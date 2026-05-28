import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadImageToR2 } from '@/lib/s3';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params; const id = parseInt(idStr);
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variations: true,
        category: true,
        images: true,
      },
    });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params; const id = parseInt(idStr);
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

    // Process new images
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

    // Delete existing variations before creating new ones
    await prisma.productVariation.deleteMany({
      where: { productId: id }
    });

    const updateData: any = {
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
      }
    };

    if (imagesData.length > 0) {
      await prisma.productImage.deleteMany({
        where: { productId: id }
      });
      updateData.images = {
        create: imagesData
      };
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        variations: true,
        images: true
      }
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params; const id = parseInt(idStr);
    await prisma.product.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
