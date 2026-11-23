import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

  return NextResponse.json({ variants });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, subtitle, description, imageUrl } = body;

  const newVariant = await prisma.variant.create({
    data: {
      name,
      subtitle: subtitle || '',
      description,
      imageUrl:
        imageUrl ||
        'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
      packages: {
        create: [
          {
            sizeLabel: 'Regular Size (8 cm)',
            name: 'Reguler Package (3 pcs)',
            pieceCount: 3,
            price: 35000,
          },
          {
            sizeLabel: 'Regular Size (8 cm)',
            name: 'Medium Package (6 pcs)',
            pieceCount: 6,
            price: 55000,
          },
          {
            sizeLabel: 'Regular Size (8 cm)',
            name: 'Large Package (10 pcs)',
            pieceCount: 10,
            price: 85000,
          },
          {
            sizeLabel: 'Mini Bites (5 cm)',
            name: 'Mini Bites Package (12 pcs)',
            pieceCount: 12,
            price: 60000,
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
    const updated = await prisma.package.update({
      where: { id: Number(body.packageId) },
      data: { price: Number(body.price) },
    });
    return NextResponse.json({ package: updated });
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