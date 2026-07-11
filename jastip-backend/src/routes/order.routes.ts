import { Router } from 'express';
import { createOrder, getOrders, updateOrderStatus, updateOrderPricing } from '../controllers/order.controller';

const router = Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/pricing', updateOrderPricing);

export default router;
