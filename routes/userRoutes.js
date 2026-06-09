import express from 'express';
import multer from 'multer';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// Register a new user account (Sign-up)
router.post('/', upload.single('profileImage'), userController.registerUser);

// Only authenticated users can fetch user profile details
router.get('/:id', authenticateToken, userController.getUserProfile);

export default router;