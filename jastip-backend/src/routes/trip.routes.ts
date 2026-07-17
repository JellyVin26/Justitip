import { Router } from 'express';
import { createTrip, getTrips, getTripById } from '../controllers/trip.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTripSchema } from '../middleware/schemas';

const router = Router();

router.post('/', authMiddleware, validate(createTripSchema), createTrip);
router.get('/', getTrips);
router.get('/:id', getTripById);

export default router;
