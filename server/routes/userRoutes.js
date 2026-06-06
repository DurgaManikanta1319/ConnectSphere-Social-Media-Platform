import express from 'express';
import { getUserProfile, followUser, updateUserProfile, getSuggestedUsers, searchUsers } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/suggested', protect, getSuggestedUsers);
router.get('/search', protect, searchUsers);
router.get('/profile/:username', protect, getUserProfile);
router.post('/follow/:id', protect, followUser);
router.put('/edit', protect, updateUserProfile);

export default router;
