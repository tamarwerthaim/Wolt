import express from 'express';
import ProductController from '../controllers/productController.js';

//create a new router instance with mergeParams option set to true
const router = express.Router({ mergeParams: true });

// define the routes for managing products in a restaurant's menu
// for addresses that end in '/products':
router.get('/', ProductController.getAllProducts);
router.post('/', ProductController.createProduct);
// for addresses that end in '/products/:pld' - the :pld is a placeholder for the product id
router.get('/:pld', ProductController.getProductById);
router.patch('/:pld', ProductController.updateProduct);
router.delete('/:pld', ProductController.deleteProduct);

export default router;