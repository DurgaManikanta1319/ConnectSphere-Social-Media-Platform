import express from 'express';
import { createStory, getStories, viewStory, reactStory } from '../controllers/storyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getStories);
router.post('/create', protect, createStory);
router.post('/:id/view', protect, viewStory);
router.post('/:id/react', protect, reactStory);

export default router;
