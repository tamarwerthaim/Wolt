import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { DEFAULT_ADMIN_ID } from './userModel.js';
import { Product } from './productModel.js';

// Definition of the Restaurant Schema for MongoDB
const RestaurantSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => uuidv4()
    },
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    ratings: {
        type: Map,
        of: Number,
        default: () => new Map()
    },
    image: {
        type: String,
        required: true
    },
    geolocation: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },
    prepTime: {
        type: Number,
        default: 15
    },
    ownerId: {
        type: String,
        required: true
    }
});

export const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

class RestaurantModel {
    /* Get the full list of all restaurants */
    static async findAll() {
        const list = await Restaurant.find();
        return Promise.all(list.map(async r => {
            const obj = r.toObject();
            obj.id = obj._id;
            const products = await Product.find({ restaurantId: obj.id });
            obj.menu = products.map(p => {
                const pObj = p.toObject();
                pObj.id = pObj._id;
                return pObj;
            });
            return obj;
        }));
    }

    /* Find a single restaurant by its unique ID string */
    static async findById(id) {
        const r = await Restaurant.findById(id);
        if (!r) return null;
        const obj = r.toObject();
        obj.id = obj._id;
        const products = await Product.find({ restaurantId: obj.id });
        obj.menu = products.map(p => {
            const pObj = p.toObject();
            pObj.id = pObj._id;
            return pObj;
        });
        return obj;
    }

    /* Perform a case-insensitive search to find a restaurant by its exact name */
    static async findByName(name) {
        const r = await Restaurant.findOne({ name: { $regex: new RegExp("^" + name + "$", "i") } });
        if (!r) return null;
        const obj = r.toObject();
        obj.id = obj._id;
        const products = await Product.find({ restaurantId: obj.id });
        obj.menu = products.map(p => {
            const pObj = p.toObject();
            pObj.id = pObj._id;
            return pObj;
        });
        return obj;
    }

    /* Create and save a new restaurant profile into the database */
    static async create(restaurantData) {
        const newRestaurant = new Restaurant({
            name: restaurantData.name,
            ratings: new Map(),
            image: restaurantData.image,
            geolocation: {
                lat: parseFloat(restaurantData.lat),
                lng: parseFloat(restaurantData.lng)
            },
            prepTime: parseInt(restaurantData.prepTime) || 15,
            ownerId: restaurantData.ownerId
        });
        await newRestaurant.save();
        const obj = newRestaurant.toObject();
        obj.id = obj._id;
        obj.menu = [];
        return obj;
    }

    /* Log or update a user rating and return a rounded average score */
    static async addRating(restaurantId, userId, newScore) {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return null;

        if (!restaurant.ratings) {
            restaurant.ratings = new Map();
        }

        restaurant.ratings.set(userId, parseFloat(newScore));
        await restaurant.save();

        const scores = Array.from(restaurant.ratings.values());
        if (scores.length === 0) return 0;
        const sum = scores.reduce((total, score) => total + score, 0);
        const average = sum / scores.length;

        return Math.round(average);
    }

    /* Update dynamic metadata attributes selectively on an existing profile */
    static async update(id, updatedData) {
        const restaurant = await Restaurant.findById(id);
        if (!restaurant) return null;

        if (updatedData.name) {
            restaurant.name = updatedData.name;
        }
        if (updatedData.image) {
            restaurant.image = updatedData.image;
        }
        if (updatedData.lat && updatedData.lng) {
            restaurant.geolocation = {
                lat: parseFloat(updatedData.lat),
                lng: parseFloat(updatedData.lng)
            };
        }
        if (updatedData.prepTime !== undefined) {
            restaurant.prepTime = parseInt(updatedData.prepTime) || 15;
        }

        await restaurant.save();
        const obj = restaurant.toObject();
        obj.id = obj._id;
        const products = await Product.find({ restaurantId: obj.id });
        obj.menu = products.map(p => {
            const pObj = p.toObject();
            pObj.id = pObj._id;
            return pObj;
        });
        return obj;
    }

    /* Delete a restaurant profile from the database */
    static async delete(id) {
        const res = await Restaurant.deleteOne({ _id: id });
        return res.deletedCount > 0;
    }
}

/* Database seeding logic for initial restaurants */
export async function seedDefaultRestaurants() {
    try {
        const count = await Restaurant.countDocuments();
        if (count === 0) {
            const initialRestaurants = [
                {
                    _id: 'bbb-restaurant-uuid-static',
                    name: 'BBB',
                    ratings: new Map(),
                    image: '/uploads/bbb_burger.png',
                    geolocation: { lat: 32.0853, lng: 34.7818 },
                    prepTime: 15,
                    ownerId: DEFAULT_ADMIN_ID
                },
                {
                    _id: 'golda-gelato-uuid-static',
                    name: 'Golda',
                    ratings: new Map(),
                    image: '/uploads/golda_gelato.png',
                    geolocation: { lat: 32.0715, lng: 34.7785 },
                    prepTime: 10,
                    ownerId: DEFAULT_ADMIN_ID
                },
                {
                    _id: 'pizzahut-pizza-uuid-static',
                    name: 'Pizza Hut',
                    ratings: new Map(),
                    image: '/uploads/pizzahut_pizza.png',
                    geolocation: { lat: 32.0801, lng: 34.7805 },
                    prepTime: 20,
                    ownerId: DEFAULT_ADMIN_ID
                },
                {
                    _id: 'japanjapan-sushi-uuid-static',
                    name: 'Japan Japan',
                    ratings: new Map(),
                    image: '/uploads/japanjapan_sushi.png',
                    geolocation: { lat: 32.0844, lng: 34.7901 },
                    prepTime: 25,
                    ownerId: DEFAULT_ADMIN_ID
                },
                {
                    _id: 'greg-breakfast-uuid-static',
                    name: 'Greg Cafe',
                    ratings: new Map(),
                    image: '/uploads/greg_breakfast.png',
                    geolocation: { lat: 32.0912, lng: 34.7761 },
                    prepTime: 15,
                    ownerId: DEFAULT_ADMIN_ID
                },
                {
                    _id: 'rebar-smoothie-uuid-static',
                    name: 'Rebar',
                    ratings: new Map(),
                    image: '/uploads/rebar_smoothie.png',
                    geolocation: { lat: 32.0699, lng: 34.7722 },
                    prepTime: 10,
                    ownerId: DEFAULT_ADMIN_ID
                },
                {
                    _id: 'falafel-gabay-uuid-static',
                    name: 'Falafel Gabay',
                    ratings: new Map(),
                    image: '/uploads/falafel_gabay.png',
                    geolocation: { lat: 32.0625, lng: 34.7701 },
                    prepTime: 12,
                    ownerId: DEFAULT_ADMIN_ID
                }
            ];

            await Restaurant.insertMany(initialRestaurants);
        }
    } catch (err) {
        console.error('Failed to seed default restaurants:', err);
    }
}

export default RestaurantModel;