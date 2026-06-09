import express from 'express';
import * as tokenController from '../controllers/tokenController.js';

const router = express.Router();

// Authenticate user credentials and return JWT token (Login)
router.post('/', tokenController.loginUser);

export default router;