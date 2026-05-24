import express from 'express';
import * as tokenController from '../controllers/tokenController.js';

const router = express.Router();

// Authenticate user credentials and return the user ID (Login)
router.post('/', tokenController.loginUser);

export default router;