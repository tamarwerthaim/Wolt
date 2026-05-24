//import the RestaurantModel to interact with the restaurant data
import RestaurantModel from '../models/restaurantModel.js';

class RestaurantController {
    //get all restaurants - get the request of the client and the object of the response
    static getAllRestaurants(req, res) {
        //bring all the restaurants from the model
        const restaurants = RestaurantModel.findAll();
        //send the restaurants as a JSON response with status 200 (OK)
        res.status(200).json(restaurants);
    }

    //get a specific restaurant by id
    static getRestaurantById(req, res) {
        //extract the id from the request parameters
        const { id } = req.params;
        //find the restaurant with the given id using the model
        const restaurant = RestaurantModel.findById(id);
        
        //if the restaurant is not found, return a 404 status with an error message
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }
        //if the restaurant is found, return it as a JSON response with status 200 (OK)
        res.status(200).json(restaurant);
    }

    //create a new restaurant
    static createRestaurant(req, res) {
        //extract the name from the request body
        const { name } = req.body;
        
        //validate that the name is provided, if not return a 400 status with an error message
        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }
        
        //create a new restaurant using the model and store the result in newRestaurant
        const newRestaurant = RestaurantModel.create({ name });
        
        //set the Location header to the URL of the newly created restaurant
        res.location(`/api/restaurants/${newRestaurant.id}`);
        //return a 201 status to indicate that the restaurant was created successfully
        res.status(201).send();
    }

    //update an existing restaurant
    static updateRestaurant(req, res) {
        //extract the id from the request parameters and the name from the request body
        const { id } = req.params;
        const { name } = req.body;
        //use the model to update the restaurant with the given id and new name, and store the result in updatedRestaurant
        const updatedRestaurant = RestaurantModel.update(id, { name });
        
        //if the restaurant to update is not found, return a 404 status with an error message
        if (!updatedRestaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }
        
        //if the update is successful, return a 204 status to indicate that the restaurant was updated successfully
        res.status(204).send();
    }

    //delete a restaurant by id
    static deleteRestaurant(req, res) {
        //extract the id from the request parameters
        const { id } = req.params;
        const isDeleted = RestaurantModel.delete(id);
        
        //if the restaurant to delete is not found, return a 404 status with an error message
        if (!isDeleted) {
            return res.status(404).json({ error: "Restaurant not found" });
        }
        //if the deletion is successful, return a 204 status to indicate that the restaurant was deleted successfully
        res.status(204).send();
    }
}
//export the RestaurantController class so it can be used in other parts of the application
export default RestaurantController;