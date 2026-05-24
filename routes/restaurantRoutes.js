//import the express module to create a router for handling restaurant-related routes
import express from 'express';
//import the RestaurantController to handle the logic for each route
import RestaurantController from '../controllers/restaurantController.js';

//create a new router instance
const router = express.Router();
//define the routes:
//for adress that end in '/':
router.get('/', RestaurantController.getAllRestaurants);
router.post('/', RestaurantController.createRestaurant);

//for adress that end in '/:id' - the :id is a placeholder for the restaurant id
router.get('/:id', RestaurantController.getRestaurantById);
router.patch('/:id', RestaurantController.updateRestaurant);
router.delete('/:id', RestaurantController.deleteRestaurant);

//export the router so it can be used in other parts of the application
export default router;