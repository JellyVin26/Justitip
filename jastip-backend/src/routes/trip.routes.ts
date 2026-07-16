import { Router } from 'express';
import { createTrip, getTrips, getTripById } from '../controllers/trip.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, createTrip);
router.get('/', getTrips);
router.get('/:id', getTripById);

export default router;
