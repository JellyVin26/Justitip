import { Router } from 'express';
import { generateQR, handleWebhook } from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/qr', authMiddleware, generateQR);
router.post('/webhook', handleWebhook);

export default router;
