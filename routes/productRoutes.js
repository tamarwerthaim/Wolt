import express from 'express';
import productController from '../controllers/productController.js';
import { authenticateAdmin, upload } from '../middleware/auth.js';

//create a new router instance with mergeParams option set to true
const router = express.Router({ mergeParams: true });

// define the routes for managing products in a restaurant's menu
// Public routes
router.get('/', productController.getAllProducts);
router.get('/:pld', productController.getProductById);

// Protected Admin-only routes
router.post('/', authenticateAdmin, upload.single('productImage'), productController.createProduct);
router.patch('/:pld', authenticateAdmin, upload.single('productImage'), productController.updateProduct);
router.delete('/:pld', authenticateAdmin, productController.deleteProduct);

export default router;