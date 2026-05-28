import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import process from 'process';

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: hashedPassword },
  });
  console.log('Admin user:', admin.username);

  // Seed categories
  const categoryNames = ['Men', 'Women', 'Accessories'];
  for (const name of categoryNames) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Categories seeded: Men, Women, Accessories');

  // Seed sample products
  const menCat = await prisma.category.findUnique({ where: { name: 'Men' } });
  const womenCat = await prisma.category.findUnique({ where: { name: 'Women' } });
  const accCat = await prisma.category.findUnique({ where: { name: 'Accessories' } });

  const sampleProducts = [
    {
      name: 'Essential White Tee',
      description: 'A premium cotton essential for every wardrobe. Relaxed fit, soft feel.',
      price: 2500,
      categoryId: menCat!.id,
      variations: [
        { size: 'S', color: 'White', stock: 20 },
        { size: 'M', color: 'White', stock: 30 },
        { size: 'L', color: 'White', stock: 25 },
        { size: 'XL', color: 'White', stock: 15 },
      ],
    },
    {
      name: 'Classic Beige Chinos',
      description: 'Versatile slim-fit chinos in a versatile beige tone. Perfect for every occasion.',
      price: 4500,
      categoryId: menCat!.id,
      variations: [
        { size: '30', color: 'Beige', stock: 12 },
        { size: '32', color: 'Beige', stock: 18 },
        { size: '34', color: 'Beige', stock: 10 },
      ],
    },
    {
      name: 'Silk Blend Blouse',
      description: 'Elegant silk-blend blouse with a relaxed silhouette. Effortlessly chic.',
      price: 5500,
      categoryId: womenCat!.id,
      variations: [
        { size: 'S', color: 'Ivory', stock: 15 },
        { size: 'M', color: 'Ivory', stock: 20 },
        { size: 'L', color: 'Ivory', stock: 10 },
      ],
    },
    {
      name: 'Linen Summer Dress',
      description: 'Lightweight linen dress perfect for warm days. Breathable and minimalist.',
      price: 7200,
      categoryId: womenCat!.id,
      variations: [
        { size: 'S', color: 'White', stock: 8 },
        { size: 'M', color: 'White', stock: 12 },
        { size: 'L', color: 'Beige', stock: 6 },
      ],
    },
    {
      name: 'Leather Crossbody Bag',
      description: 'Premium full-grain leather crossbody bag with adjustable strap.',
      price: 12000,
      categoryId: accCat!.id,
      variations: [
        { size: 'One Size', color: 'Tan', stock: 10 },
        { size: 'One Size', color: 'Black', stock: 8 },
      ],
    },
  ];

  for (const product of sampleProducts) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          categoryId: product.categoryId,
          variations: { create: product.variations },
        },
      });
      console.log(`Created product: ${product.name}`);
    }
  }

  console.log('Seeding complete!');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
