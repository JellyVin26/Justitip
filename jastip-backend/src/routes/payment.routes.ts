import { Router } from 'express';
import { generateQR, handleWebhook } from '../controllers/payment.controller';

const router = Router();

router.post('/qr', generateQR);
router.post('/webhook', handleWebhook);

export default router;
