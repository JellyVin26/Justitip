import { Router } from 'express';
import { followUser, unfollowUser, getUserById, updateUserProfile } from '../controllers/user.controller';

const router = Router();

router.get('/:id', getUserById);
router.put('/:id', updateUserProfile);
router.post('/:id/follow', followUser);
router.delete('/:id/follow', unfollowUser);

export default router;
