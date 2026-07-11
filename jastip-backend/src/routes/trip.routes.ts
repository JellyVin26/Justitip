import { Router } from 'express';
import { createTrip, getTrips, getTripById } from '../controllers/trip.controller';

const router = Router();

router.post('/', createTrip);
router.get('/', getTrips);
router.get('/:id', getTripById);

export default router;
