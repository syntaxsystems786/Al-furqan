const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const STOREFRONT_PUBLIC_UPLOADS = path.join(__dirname, '../../storefront/public/uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(STOREFRONT_PUBLIC_UPLOADS)) {
  fs.mkdirSync(STOREFRONT_PUBLIC_UPLOADS, { recursive: true });
}

const perfumesDir = path.join(__dirname, '../../storefront/perfumes');
const logoDir = path.join(__dirname, '../../storefront/logo');

async function processImages() {
  console.log('Processing logo...');
  const logoPath = path.join(logoDir, 'logo.jpeg');
  if (fs.existsSync(logoPath)) {
    const logoOut = path.join(__dirname, '../../storefront/public/logo.webp');
    await sharp(logoPath)
      .resize({ width: 500, withoutEnlargement: true })
      .webp({ quality: 90 })
      .toFile(logoOut);
    console.log('Logo processed to public/logo.webp');
  }

  console.log('Processing perfume images...');
  const files = fs.readdirSync(perfumesDir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));
  
  const processedImages = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filepath = path.join(perfumesDir, file);
    const filename = `perfume-${i + 1}-${Date.now()}.webp`;
    const outPath = path.join(UPLOADS_DIR, filename);
    
    await sharp(filepath)
      .resize({ width: 800, height: 1000, fit: 'cover' }) // Luxury 4:5 ratio
      .webp({ quality: 80 })
      .toFile(outPath);
      
    // Also copy to storefront public so Next.js Image can use it locally without backend if needed
    // But since backend serves /uploads, we'll just rely on backend serving it or copy to public just in case.
    // Actually, storefront already maps /uploads via next.config.js remotePatterns? 
    // Yes, but let's just use the backend url.
    
    processedImages.push(`/uploads/${filename}`);
    console.log(`Processed ${file} -> ${filename}`);
  }

  return processedImages;
}

async function seedDatabase(images) {
  console.log('Clearing existing products...');
  await prisma.productImage.deleteMany();
  await prisma.productVariation.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log('Creating categories...');
  const catSignature = await prisma.category.create({ data: { name: 'Signature Collection' } });
  const catOud = await prisma.category.create({ data: { name: 'Oud Exclusif' } });

  console.log('Creating products...');
  const perfumeData = [
    {
      name: 'Oud Royale',
      description: 'A deeply resonant, majestic oud blend fit for royalty. Opening with a spicy saffron kick, it settles into a rich, dark agarwood heart.',
      topNotes: 'Saffron, Pink Pepper',
      middleNotes: 'Rose, Jasmine, Agarwood',
      baseNotes: 'Oud, Amber, Dark Musk',
      price: 25000,
      categoryId: catOud.id,
      images: [images[0] || ''],
    },
    {
      name: 'Midnight Bloom',
      description: 'An alluring evening fragrance featuring night-blooming jasmine and sweet vanilla absolute, anchored by smooth sandalwood.',
      topNotes: 'Bergamot, Blackcurrant',
      middleNotes: 'Night-Blooming Jasmine, Orchid',
      baseNotes: 'Vanilla Absolute, Sandalwood',
      price: 18500,
      categoryId: catSignature.id,
      images: [images[1] || ''],
    },
    {
      name: 'Desert Mirage',
      description: 'A warm, intoxicating scent capturing the essence of golden hour in the dunes. Spiced cardamom and smoky incense lead to a leathery base.',
      topNotes: 'Cardamom, Cinnamon',
      middleNotes: 'Incense, Tobacco Leaf',
      baseNotes: 'Leather, Vetiver, Cedarwood',
      price: 21000,
      categoryId: catOud.id,
      images: [images[2] || ''],
    },
    {
      name: 'Aqua Marine',
      description: 'A crisp, refreshing aquatic fragrance inspired by the Mediterranean sea. Perfect for hot summer days.',
      topNotes: 'Sea Salt, Sicilian Lemon',
      middleNotes: 'Marine Accord, Rosemary',
      baseNotes: 'White Musk, Driftwood',
      price: 15000,
      categoryId: catSignature.id,
      images: [images[3] || ''],
    },
    {
      name: 'Rose Damascena',
      description: 'A modern, sophisticated take on the classic rose. Sweet, velvety, and endlessly romantic.',
      topNotes: 'Lychee, Bergamot',
      middleNotes: 'Damask Rose, Peony',
      baseNotes: 'White Musk, Cashmeran',
      price: 17500,
      categoryId: catSignature.id,
      images: [images[4] || ''],
    },
    {
      name: 'Imperial Leather',
      description: 'Bold, unapologetic, and fiercely elegant. A dominant leather accord wrapped in warm spices.',
      topNotes: 'Nutmeg, Cumin',
      middleNotes: 'Leather, Iris',
      baseNotes: 'Tonka Bean, Guaiac Wood',
      price: 28000,
      categoryId: catOud.id,
      images: [images[5] || ''],
    }
  ];

  for (let i = 0; i < perfumeData.length; i++) {
    const p = perfumeData[i];
    await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        topNotes: p.topNotes,
        middleNotes: p.middleNotes,
        baseNotes: p.baseNotes,
        price: p.price,
        categoryId: p.categoryId,
        images: {
          create: p.images.filter(Boolean).map(url => ({ url }))
        },
        variations: {
          create: [
            { size: '50ml', color: 'Standard', stock: 100 },
            { size: '100ml', color: 'Standard', stock: 50 },
            { size: 'Extrait (30ml)', color: 'Premium', stock: 20 },
          ]
        }
      }
    });
  }
  
  console.log('Database seeded successfully!');
}

async function run() {
  try {
    const images = await processImages();
    await seedDatabase(images);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
