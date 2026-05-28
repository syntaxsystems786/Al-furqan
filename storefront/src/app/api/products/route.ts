import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadImageToR2 } from '@/lib/s3';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        variations: true,
        category: true,
        images: true,
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const topNotes = formData.get('topNotes') as string;
    const middleNotes = formData.get('middleNotes') as string;
    const baseNotes = formData.get('baseNotes') as string;
    const price = formData.get('price') as string;
    const categoryId = formData.get('categoryId') as string;
    const variationsStr = formData.get('variations') as string;
    
    let variations = [];
    if (variationsStr) {
      try {
        variations = JSON.parse(variationsStr);
      } catch (e) {
        console.error("Failed to parse variations");
      }
    }

    // Process images
    const imagesData: { url: string }[] = [];
    const files = formData.getAll('images') as File[];
    
    for (const file of files) {
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const url = await uploadImageToR2(buffer);
        imagesData.push({ url });
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        topNotes,
        middleNotes,
        baseNotes,
        price: parseFloat(price),
        categoryId: categoryId ? parseInt(categoryId) : null,
        variations: {
          create: variations.map((v: any) => ({
            size: v.size,
            color: v.color,
            stock: parseInt(v.stock)
          })),
        },
        images: {
          create: imagesData
        }
      },
      include: {
        variations: true,
        images: true
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
