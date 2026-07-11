import { Router } from 'express';
import { createListing, getListings } from '../controllers/listing.controller';

const router = Router();

router.post('/', createListing);
router.get('/', getListings);

export default router;
