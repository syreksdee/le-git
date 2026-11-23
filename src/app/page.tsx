import { prisma } from '@/lib/prisma';
import CatalogClient from './CatalogClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const variants = await prisma.variant.findMany({
    include: {
      packages: {
        orderBy: { price: 'asc' },
      },
    },
    orderBy: { id: 'asc' },
  });

  return <CatalogClient variants={variants} />;
}