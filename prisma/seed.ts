import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean existing seed data to make seeding idempotent
  await prisma.package.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.admin.deleteMany();

  await prisma.admin.create({
    data: {
      username: 'admin',
      password: process.env.ADMIN_PASSWORD || 'legit2026',
    },
  });

  const defaultPackages = [
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
  ];

  await prisma.variant.create({
    data: {
      name: 'K.Caw',
      subtitle: 'Kukis Chocolate Almond Walnut',
      description:
        'Rich chocolate cookie loaded with crunchy roasted almonds and walnuts. Crisp edges with a soft, fudgy center.',
      imageUrl:
        'https://drive.google.com/thumbnail?id=1oeG9hRPFNKnxOrSjmVbQzWtkhtewvU-H&sz=w1000',
      isSoldOut: false,
      packages: {
        create: defaultPackages,
      },
    },
  });

  await prisma.variant.create({
    data: {
      name: 'Raisin Nut',
      subtitle: 'Classic Oatmeal Raisin & Roasted Nuts',
      description:
        'Classic artisanal cookie packed with sweet, chewy raisins and crunchy roasted nuts baked to golden perfection.',
      imageUrl:
        'https://drive.google.com/thumbnail?id=1hwJGxKdUWDlcvd4m-pL1VezbcUmF8_E6&sz=w1000',
      isSoldOut: false,
      packages: {
        create: defaultPackages,
      },
    },
  });

  console.log('Seed completed for Lé Git!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });