import express from 'express';
import { registerUser, loginUser, forgotPassword, logoutUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/logout', logoutUser);

export default router;
