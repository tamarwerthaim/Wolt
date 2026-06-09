import express from 'express';
import orderController from '../controllers/orderController.js'; 
import { authenticateToken } from '../middleware/auth.js';

//create a new router instance
const router = express.Router();

// Apply authenticateToken middleware to satisfy acceptance criteria for sensitive endpoints
// for addresses that end in '/orders':
router.get('/', authenticateToken, orderController.getAllOrders);
router.post('/', authenticateToken, orderController.createOrder);

// for addresses that end in '/orders/:id' - the :id is a placeholder for the order id
router.get('/:id', authenticateToken, orderController.getOrderById);
router.patch('/:id', authenticateToken, orderController.updateOrder);
router.delete('/:id', authenticateToken, orderController.deleteOrder);

export default router;