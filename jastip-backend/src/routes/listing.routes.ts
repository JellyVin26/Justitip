import { Router } from 'express';
import { createListing, getListings, deleteListing } from '../controllers/listing.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, createListing);
router.get('/', getListings);
router.delete('/:id', authMiddleware, deleteListing);

export default router;
