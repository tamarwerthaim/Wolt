import express from 'express';
import orderController from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/* All order endpoints require a verified user token */

/* Base routes mapping to /api/orders */
router.get('/', authenticateToken, orderController.getAllOrders);
router.post('/', authenticateToken, orderController.createOrder);

/* Specific order resource routes mapping to /api/orders/:id */
router.get('/:id', authenticateToken, orderController.getOrderById);
router.patch('/:id', authenticateToken, orderController.updateOrder);
router.delete('/:id', authenticateToken, orderController.deleteOrder);

export default router;