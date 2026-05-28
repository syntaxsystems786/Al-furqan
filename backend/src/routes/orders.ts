import express from 'express';
import { getOrders, getOrderById, createOrder, updateOrderStatus } from '../controllers/orderController';

const router = express.Router();

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.patch('/:id/status', updateOrderStatus);

export default router;
