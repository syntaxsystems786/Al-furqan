import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            variation: {
              include: { product: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, email, phone, address, city, paymentMethod, items } = body;

    const order = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of items) {
        const variation = await tx.productVariation.findUnique({
          where: { id: item.productVariationId },
          include: { product: true }
        });

        if (!variation) {
          throw new Error(`Product variation not found (ID: ${item.productVariationId}). Your cart may be out of date. Please clear your cart and try again.`);
        }

        if (variation.stock < item.quantity) {
          throw new Error(`Only ${variation.stock} units of "${variation.product.name}" (${variation.size}) are available, but you requested ${item.quantity}`);
        }

        totalAmount += variation.product.price * item.quantity;
        orderItemsData.push({
          productVariationId: item.productVariationId,
          quantity: item.quantity,
          priceAtPurchase: variation.product.price,
          productName: variation.product.name,
          productSize: variation.size,
          productColor: variation.color
        });

        await tx.productVariation.update({
          where: { id: item.productVariationId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      return tx.order.create({
        data: {
          customerName,
          email,
          phone,
          address,
          city,
          paymentMethod,
          totalAmount,
          items: { create: orderItemsData }
        },
        include: { items: true }
      });
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error('Create order error:', error);
    const isStockError = error.message?.includes('available') || error.message?.includes('not found');
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: isStockError ? 400 : 500 });
  }
}
