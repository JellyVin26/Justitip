import { Router } from 'express';
import { createListing, getListings, deleteListing } from '../controllers/listing.controller';

const router = Router();

router.post('/', createListing);
router.get('/', getListings);
router.delete('/:id', deleteListing);

export default router;
