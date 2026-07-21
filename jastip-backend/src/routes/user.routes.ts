import { Router } from 'express';
import { followUser, unfollowUser, getUserById, updateUserProfile, getFollowing } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/me/following', authMiddleware, getFollowing);
router.get('/:id', getUserById);
router.put('/:id', authMiddleware, updateUserProfile);
router.post('/:id/follow', authMiddleware, followUser);
router.delete('/:id/follow', authMiddleware, unfollowUser);

export default router;
