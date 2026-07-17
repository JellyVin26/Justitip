import { Router } from 'express';
import { createOrder, getOrders, getOrderById, getMessagesByOrderId, updateOrderStatus, updateOrderPricing } from '../controllers/order.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createOrderSchema, updateOrderStatusSchema, updateOrderPricingSchema } from '../middleware/schemas';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(createOrderSchema), createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.get('/:id/messages', getMessagesByOrderId);
router.patch('/:id/status', validate(updateOrderStatusSchema), updateOrderStatus);
router.patch('/:id/pricing', validate(updateOrderPricingSchema), updateOrderPricing);

export default router;
