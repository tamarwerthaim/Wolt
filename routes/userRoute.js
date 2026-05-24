import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// Register a new user account (Sign-up)
router.post('/', userController.registerUser);

// Get user profile details by ID
router.get('/:id', userController.getUserProfile);

export default router;