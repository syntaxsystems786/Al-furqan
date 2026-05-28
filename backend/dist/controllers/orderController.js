"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.createOrder = exports.getOrderById = exports.getOrders = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getOrders = async (req, res) => {
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
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};
exports.getOrders = getOrders;
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) },
            include: {
                items: {
                    include: {
                        variation: {
                            include: { product: true }
                        }
                    }
                }
            }
        });
        if (!order)
            return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};
exports.getOrderById = getOrderById;
const createOrder = async (req, res) => {
    try {
        const { customerName, email, phone, address, city, paymentMethod, items } = req.body;
        // Use a transaction so stock check + decrement + order creation are atomic
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
                // Enforce stock limit
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
                // Decrement stock
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
        res.status(201).json(order);
    }
    catch (error) {
        console.error('Create order error:', error);
        const isStockError = error.message?.includes('available') || error.message?.includes('not found');
        res.status(isStockError ? 400 : 500).json({ error: error.message || 'Failed to create order' });
    }
};
exports.createOrder = createOrder;
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
