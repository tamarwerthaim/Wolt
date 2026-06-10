//restaurantModel.js - this file defines the RestaurantModel class, which provides methods for managing restaurant data in memory. It includes methods for creating, reading, updating, and deleting restaurants. Each restaurant has a unique id, a name, and a menu (which is an array of dishes).
import { v4 as uuidv4 } from 'uuid';

//for storing restaurants in memory
let restaurants = []; 

class RestaurantModel {
    //CRUD operations for restaurants
    //the functions are static because we don't need to create an instance of RestaurantModel to use them, we can call them directly on the class itself.

    //find all restaurants
    static findAll() {
        return restaurants;
    }

    //find restaurant by id - the first with this id
    static findById(id) {
        return restaurants.find(r => r.id === id);
    }

    // find restaurent by name 
    static findByName(name) {
    return restaurants.find(restaurant => restaurant.name.toLowerCase() === name.toLowerCase());
}

    //create a new restaurant
    static create(restaurantData) {
        //create a new restaurant object with a unique id
        const newRestaurant = {
            id: uuidv4(), 
            name: restaurantData.name,
            rating: restaurantData.rating ? [parseFloat(restaurantData.rating)] : [], 
            image: restaurantData.image, 
            geolocation: {
                lat: parseFloat(restaurantData.lat), 
                lng: parseFloat(restaurantData.lng)
            },
            menu: [] 
        };
        //add the new restaurant to the in-memory array
        restaurants.push(newRestaurant);
        //return the newly created restaurant
        return newRestaurant;
    }

    // add a new rating to the restaurant and return the updated average rating
    static addRating(restaurantId, newScore) {
        const restaurant = this.findById(restaurantId);
        if (!restaurant) return null;

        // add the new score to the restaurant's ratings array
        restaurant.ratings.push(parseFloat(newScore));

        // calculate the average rating
        const sum = restaurant.ratings.reduce((total, score) => total + score, 0);
        const average = sum / restaurant.ratings.length;

        // return the average rating rounded to one decimal place
        return Math.round(average);
    }

    //update an existing restaurant
    static update(id, updatedData) {
        //find the restaurant by id
        const restaurant = this.findById(id);
        //if the restaurant doesn't exist, return null
        if (!restaurant) return null;
        //update the restaurant's name if it's provided in the updatedData
        if (updatedData.name) {
            restaurant.name = updatedData.name;
        }
        //update the restaurant's image if it's provided in the updatedData
        if (updatedData.image) {
            restaurant.image = updatedData.image;
        }
        //update the restaurant's geolocation if both lat and lng are provided in the updatedData
        if (updatedData.lat && updatedData.lng) {
            restaurant.geolocation = {
                lat: parseFloat(updatedData.lat),
                lng: parseFloat(updatedData.lng)
            };
        }
        //return the updated restaurant
        return restaurant;
    }

    //delete a restaurant by id
    static delete(id) {
        //store the initial length of the restaurants array
        const initialLength = restaurants.length;
        //filter out the restaurant with the given id
        restaurants = restaurants.filter(r => r.id !== id);
        //return true if a restaurant was deleted (i.e., the length of the array has decreased), otherwise return false
        return restaurants.length !== initialLength;
    }
}
//export the RestaurantModel class so it can be used in other parts of the application
export default RestaurantModel;