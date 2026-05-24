import express from 'express';
import productController from '../controllers/productController.js';

//create a new router instance with mergeParams option set to true
const router = express.Router({ mergeParams: true });

// define the routes for managing products in a restaurant's menu
// for addresses that end in '/products':
router.get('/', productController.getAllProducts);
router.post('/', productController.createProduct);
// for addresses that end in '/products/:pld' - the :pld is a placeholder for the product id
router.get('/:pld', productController.getProductById);
router.patch('/:pld', productController.updateProduct);
router.delete('/:pld', productController.deleteProduct);

export default router;