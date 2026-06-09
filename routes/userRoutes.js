import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register a new user account (Sign-up)
router.post('/', userController.registerUser);

// Only authenticated users can fetch user profile details
router.get('/:id', authenticateToken, userController.getUserProfile);

export default router;