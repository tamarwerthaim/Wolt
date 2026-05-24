import express from 'express';
import orderController from '../controllers/orderController.js'; 

//create a new router instance
const router = express.Router();

// for addresses that end in '/orders':
router.get('/', orderController.getAllOrders);
router.post('/', orderController.createOrder);

// for addresses that end in '/orders/:id' - the :id is a placeholder for the order id
router.get('/:id', orderController.getOrderById);
router.patch('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

export default router;