import { Router } from 'express';
import { createListing, getListings, deleteListing } from '../controllers/listing.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createListingSchema } from '../middleware/schemas';

const router = Router();

router.post('/', authMiddleware, validate(createListingSchema), createListing);
router.get('/', getListings);
router.delete('/:id', authMiddleware, deleteListing);

export default router;
