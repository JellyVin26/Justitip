import { Router } from 'express';
import { followUser, unfollowUser } from '../controllers/user.controller';

const router = Router();

router.post('/:id/follow', followUser);
router.delete('/:id/follow', unfollowUser);

export default router;
