import express from 'express';
import {
  createPost,
  deletePost,
  likePost,
  commentPost,
  replyComment,
  deleteComment,
  getFeedPosts,
  getUserPosts,
  savePost,
  getSavedPosts,
  searchPosts,
  getTrendingHashtags
} from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getFeedPosts);
router.get('/saved', protect, getSavedPosts);
router.get('/search', protect, searchPosts);
router.get('/trending-hashtags', protect, getTrendingHashtags);
router.get('/user/:username', protect, getUserPosts);
router.post('/create', protect, createPost);
router.delete('/:id', protect, deletePost);
router.post('/like/:id', protect, likePost);
router.post('/comment/:id', protect, commentPost);
router.post('/comment/:commentId/reply', protect, replyComment);
router.delete('/comment/:commentId', protect, deleteComment);
router.post('/save/:id', protect, savePost);

export default router;
