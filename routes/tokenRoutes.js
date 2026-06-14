import express from 'express';
import * as tokenController from '../controllers/tokenController.js';

const router = express.Router();

/* POST route to verify user credentials and return an authentication token (Login) */
router.post('/', tokenController.loginUser);

export default router;