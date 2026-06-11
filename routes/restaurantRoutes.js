//import the express module to create a router for handling restaurant-related routes
import express from 'express';
//import the RestaurantController to handle the logic for each route
import RestaurantController from '../controllers/restaurantController.js';
//import the authenticateAdmin middleware to protect admin-only routes
import { authenticateAdmin } from '../middleware/auth.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/auth.js';

//create a new router instance
const router = express.Router();

//define the routes:
// Public routes
router.get('/', RestaurantController.getAllRestaurants);
router.get('/:id', RestaurantController.getRestaurantById);

// Allow authenticated users to rate a restaurant
router.post('/:id/rate', authenticateToken, RestaurantController.rateRestaurant);

// Protected Admin-only routes
router.post('/', authenticateAdmin, upload.single('restaurantImage'), RestaurantController.createRestaurant);
router.patch('/:id', authenticateAdmin, upload.single('restaurantImage'), RestaurantController.updateRestaurant);
router.delete('/:id', authenticateAdmin, RestaurantController.deleteRestaurant);

//export the router so it can be used in other parts of the application
export default router;