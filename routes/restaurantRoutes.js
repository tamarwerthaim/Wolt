import express from 'express';
import RestaurantController from '../controllers/restaurantController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/auth.js';

const router = express.Router();

/* Publicly accessible restaurant endpoints */
router.get('/', RestaurantController.getAllRestaurants);

// Get recommended restaurants for the authenticated user based on C++ recommendation system
router.get('/recommendations', authenticateToken, RestaurantController.getRecommendations);

router.get('/:id', RestaurantController.getRestaurantById);

/* Authenticated user routes */
router.post('/:id/rate', authenticateToken, RestaurantController.rateRestaurant);

/* Protected restaurant owner / admin routes */
router.post('/', authenticateAdmin, upload.single('restaurantImage'), RestaurantController.createRestaurant);
router.patch('/:id', authenticateAdmin, upload.single('restaurantImage'), RestaurantController.updateRestaurant);
router.delete('/:id', authenticateAdmin, RestaurantController.deleteRestaurant);

export default router;