import { prisma } from '@/lib/prisma';
import { DEFAULT_PICKUP_ADDRESS } from '@/lib/store-settings';
import CatalogClient from './CatalogClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [variants, storeSettings] = await Promise.all([
    prisma.variant.findMany({
      include: {
        packages: {
          orderBy: { price: 'asc' },
        },
      },
      orderBy: { id: 'asc' },
    }),
    prisma.storeSettings.findUnique({ where: { id: 1 } }),
  ]);

  return (
    <CatalogClient
      variants={variants}
      pickupAddress={storeSettings?.pickupAddress ?? DEFAULT_PICKUP_ADDRESS}
    />
  );
}