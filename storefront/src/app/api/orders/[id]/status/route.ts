import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function handleUpdateStatus(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const { status } = await request.json();
    
    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });
    
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}

export const PUT = handleUpdateStatus;
export const PATCH = handleUpdateStatus;
