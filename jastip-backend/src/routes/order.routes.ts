import { Router } from 'express';
import { createOrder, getOrders, getOrderById, getMessagesByOrderId, updateOrderStatus, updateOrderPricing } from '../controllers/order.controller';

const router = Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.get('/:id/messages', getMessagesByOrderId);
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/pricing', updateOrderPricing);

export default router;
