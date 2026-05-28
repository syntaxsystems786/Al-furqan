import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params; const id = parseInt(idStr);
    const { name } = await request.json();
    const category = await prisma.category.update({
      where: { id },
      data: { name }
    });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params; const id = parseInt(idStr);
    const productsCount = await prisma.product.count({ where: { categoryId: id } });
    
    if (productsCount > 0) {
      return NextResponse.json({ error: 'Cannot delete category with associated products' }, { status: 400 });
    }
    
    await prisma.category.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
