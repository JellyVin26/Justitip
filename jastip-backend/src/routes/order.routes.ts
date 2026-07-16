import { Router } from 'express';
import { createOrder, getOrders, getOrderById, getMessagesByOrderId, updateOrderStatus, updateOrderPricing } from '../controllers/order.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.get('/:id/messages', getMessagesByOrderId);
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/pricing', updateOrderPricing);

export default router;
