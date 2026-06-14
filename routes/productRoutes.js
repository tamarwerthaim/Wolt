import express from 'express';
import productController from '../controllers/productController.js';
import { authenticateAdmin, upload } from '../middleware/auth.js';

/* Enable mergeParams so we can inherit parent route variables, like the restaurant ':id' */
const router = express.Router({ mergeParams: true });

/* Public menu endpoints */
router.get('/', productController.getAllProducts);
router.get('/:pld', productController.getProductById);

/* Protected restaurant owner / admin endpoints */
router.post('/', authenticateAdmin, upload.single('productImage'), productController.createProduct);
router.patch('/:pld', authenticateAdmin, upload.single('productImage'), productController.updateProduct);
router.delete('/:pld', authenticateAdmin, productController.deleteProduct);

export default router;