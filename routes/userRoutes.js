import express from 'express';
import multer from 'multer';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/* Configure multer local storage destination directory for uploaded media files */
const upload = multer({ dest: 'uploads/' });

/* Public route to sign up and register a new user account with a profile image */
router.post('/', upload.single('profileImage'), userController.registerUser);

/* Fetch user profile details (requires authentication token verification) */
router.get('/:id', authenticateToken, userController.getUserProfile);

/* Update existing user profile records and upload replacement avatar pictures */
router.put('/:id', authenticateToken, upload.single('profileImage'), userController.updateUserProfile);

export default router;