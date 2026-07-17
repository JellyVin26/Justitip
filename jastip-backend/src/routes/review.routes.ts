import { Router } from 'express';
import { createReview } from '../controllers/review.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createReviewSchema } from '../middleware/schemas';

const router = Router();

router.post('/', authMiddleware, validate(createReviewSchema), createReview);

export default router;
