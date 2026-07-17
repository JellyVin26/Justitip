import { Router } from 'express';
import { createReview } from '../controllers/review.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, createReview);

export default router;
