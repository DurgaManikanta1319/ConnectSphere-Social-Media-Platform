import express from 'express';
import { sendMessage, getMessages, getConversations } from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/get/:userId', protect, getMessages);
router.post('/send', protect, sendMessage);

export default router;
