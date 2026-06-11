//restaurantModel.js - this file defines the RestaurantModel class, which provides methods for managing restaurant data in memory. It includes methods for creating, reading, updating, and deleting restaurants. Each restaurant has a unique id, a name, and a menu (which is an array of dishes).
import { v4 as uuidv4 } from 'uuid';

//for storing restaurants in memory
let restaurants = [
    {
        id: uuidv4(),
        name: 'BBB',
        ratings: {},
        image: '/uploads/bbb_burger.png',
        geolocation: { lat: 32.0853, lng: 34.7818 },
        prepTime: 15,
        menu: []
    },
    {
        id: uuidv4(),
        name: 'Golda',
        ratings: {},
        image: '/uploads/golda_gelato.png',
        geolocation: { lat: 32.0715, lng: 34.7785 },
        prepTime: 10,
        menu: []
    },
    {
        id: uuidv4(),
        name: 'Pizza Hut',
        ratings: {},
        image: '/uploads/pizzahut_pizza.png',
        geolocation: { lat: 32.0801, lng: 34.7805 },
        prepTime: 20,
        menu: []
    },
    {
        id: uuidv4(),
        name: 'Japan Japan',
        ratings: {},
        image: '/uploads/japanjapan_sushi.png',
        geolocation: { lat: 32.0844, lng: 34.7901 },
        prepTime: 25,
        menu: []
    },
    {
        id: uuidv4(),
        name: 'Greg Cafe',
        ratings: {},
        image: '/uploads/greg_breakfast.png',
        geolocation: { lat: 32.0912, lng: 34.7761 },
        prepTime: 15,
        menu: []
    },
    {
        id: uuidv4(),
        name: 'Rebar',
        ratings: {},
        image: '/uploads/rebar_smoothie.png',
        geolocation: { lat: 32.0699, lng: 34.7722 },
        prepTime: 10,
        menu: []
    },
    {
        id: uuidv4(),
        name: 'Falafel Gabay',
        ratings: {},
        image: '/uploads/falafel_gabay.png',
        geolocation: { lat: 32.0625, lng: 34.7701 },
        prepTime: 12,
        menu: []
    }
];

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
            ratings: {}, // שינוי לאובייקט כדי לתמוך בהצבעה אחת למשתמש (מפתח: מזהה משתמש, ערך: ציון)
            image: restaurantData.image,
            geolocation: {
                lat: parseFloat(restaurantData.lat),
                lng: parseFloat(restaurantData.lng)
            },
            prepTime: parseInt(restaurantData.prepTime) || 15,
            menu: []
        };
        //add the new restaurant to the in-memory array
        restaurants.push(newRestaurant);
        //return the newly created restaurant
        return newRestaurant;
    }

    // add a new rating to the restaurant and return the updated average rating
    static addRating(restaurantId, userId, newScore) {
        const restaurant = this.findById(restaurantId);
        if (!restaurant) return null;

        // וידוא שהדירוגים מוגדרים כאובייקט (תמיכה במעבר ממערך לאובייקט ללא שגיאות)
        if (!restaurant.ratings || Array.isArray(restaurant.ratings)) {
            restaurant.ratings = {};
        }

        // שמירה/עדכון הדירוג של המשתמש (מבטיח שלכל משתמש יש רק קול אחד בעל משקל זהה)
        restaurant.ratings[userId] = parseFloat(newScore);

        const scores = Object.values(restaurant.ratings);
        // calculate the average rating
        const sum = scores.reduce((total, score) => total + score, 0);
        const average = sum / scores.length;

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
        //update the restaurant's prepTime if it's provided in the updatedData
        if (updatedData.prepTime !== undefined) {
            restaurant.prepTime = parseInt(updatedData.prepTime) || 15;
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