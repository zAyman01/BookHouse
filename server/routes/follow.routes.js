import { Router } from 'express';
import protect from '../middleware/protect.middleware.js';
import * as followController from '../controllers/follow.controller.js';

const router = Router();

router.post('/:userId', protect, followController.follow);
router.delete('/:userId', protect, followController.unfollow);
router.get('/:userId/followers', followController.getFollowers);
router.get('/:userId/following', followController.getFollowing);
router.get('/:userId/stats', followController.getFollowStats);
router.get('/:userId/check', protect, followController.checkFollow);

export default router;
