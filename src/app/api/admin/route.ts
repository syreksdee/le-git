import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_PICKUP_ADDRESS } from '@/lib/store-settings';

function isAuthorized(req: NextRequest) {
  const authHeader = req.headers.get('x-admin-password');
  const validPassword = process.env.ADMIN_PASSWORD || 'legit2026';
  return authHeader === validPassword;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const variants = await prisma.variant.findMany({
    include: { packages: { orderBy: { price: 'asc' } } },
    orderBy: { id: 'asc' },
  });
  const storeSettings = await prisma.storeSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { pickupAddress: DEFAULT_PICKUP_ADDRESS },
  });

  return NextResponse.json({ variants, storeSettings });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, subtitle, description, imageUrl, packagePrices } = body;
  const defaultPrices = [35000, 55000, 85000, 60000];
  const prices = packagePrices ?? defaultPrices;
  if (
    !Array.isArray(prices) ||
    prices.length !== defaultPrices.length ||
    prices.some(
      (price) =>
        typeof price !== 'number' ||
        !Number.isSafeInteger(price) ||
        price <= 0
    ) ||
    typeof name !== 'string' ||
    !name.trim() ||
    typeof description !== 'string' ||
    !description.trim()
  ) {
    return NextResponse.json(
      { error: 'Invalid variant details or package prices' },
      { status: 400 }
    );
  }

  const newVariant = await prisma.variant.create({
    data: {
      name: name.trim(),
      subtitle: typeof subtitle === 'string' ? subtitle.trim() : '',
      description: description.trim(),
      imageUrl:
        imageUrl ||
        'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
      packages: {
        create: [
          {
            sizeLabel: 'Regular Size (8 cm)',
            name: 'Reguler Package (3 pcs)',
            pieceCount: 3,
            price: prices[0],
          },
          {
            sizeLabel: 'Regular Size (8 cm)',
            name: 'Medium Package (6 pcs)',
            pieceCount: 6,
            price: prices[1],
          },
          {
            sizeLabel: 'Regular Size (8 cm)',
            name: 'Large Package (10 pcs)',
            pieceCount: 10,
            price: prices[2],
          },
          {
            sizeLabel: 'Mini Bites (5 cm)',
            name: 'Mini Bites Package (12 pcs)',
            pieceCount: 12,
            price: prices[3],
          },
        ],
      },
    },
    include: { packages: true },
  });

  return NextResponse.json({ variant: newVariant }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  if (body.type === 'toggle_sold_out') {
    const updated = await prisma.variant.update({
      where: { id: Number(body.variantId) },
      data: { isSoldOut: Boolean(body.isSoldOut) },
    });
    return NextResponse.json({ variant: updated });
  }

  if (body.type === 'update_image') {
    const updated = await prisma.variant.update({
      where: { id: Number(body.variantId) },
      data: { imageUrl: String(body.imageUrl) },
    });
    return NextResponse.json({ variant: updated });
  }

  if (body.type === 'update_price') {
    const price = Number(body.price);
    if (!Number.isSafeInteger(price) || price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive whole number' },
        { status: 400 }
      );
    }
    const updated = await prisma.package.update({
      where: { id: Number(body.packageId) },
      data: { price },
    });
    return NextResponse.json({ package: updated });
  }

  if (body.type === 'update_pickup_address') {
    if (
      typeof body.pickupAddress !== 'string' ||
      !body.pickupAddress.trim()
    ) {
      return NextResponse.json({ error: 'Pickup address is required' }, { status: 400 });
    }
    const storeSettings = await prisma.storeSettings.upsert({
      where: { id: 1 },
      update: { pickupAddress: body.pickupAddress.trim() },
      create: { pickupAddress: body.pickupAddress.trim() },
    });
    return NextResponse.json({ storeSettings });
  }

  return NextResponse.json({ error: 'Invalid update type' }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const variantId = searchParams.get('id');

  if (!variantId) {
    return NextResponse.json({ error: 'Missing variant ID' }, { status: 400 });
  }

  await prisma.variant.delete({
    where: { id: Number(variantId) },
  });

  return NextResponse.json({ success: true });
}