import express from 'express';
import { getDashboardAnalytics, getAllUsers, toggleBanUser, getReportedPosts, reportPost } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/analytics', protect, adminOnly, getDashboardAnalytics);
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/ban/:id', protect, adminOnly, toggleBanUser);
router.get('/posts/reported', protect, adminOnly, getReportedPosts);
router.post('/posts/report/:id', protect, reportPost); // Accessible to any logged in user to flag content

export default router;
