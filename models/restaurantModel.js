import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { DEFAULT_ADMIN_ID } from './userModel.js';

// Definition of ProductSubSchema to represent menu items temporarily nested inside Restaurant
const ProductSubSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => uuidv4()
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
});

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
    },
    menu: {
        type: [ProductSubSchema],
        default: []
    }
});

export const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

class RestaurantModel {
    /* Get the full list of all restaurants */
    static async findAll() {
        const list = await Restaurant.find();
        return list.map(r => {
            const obj = r.toObject();
            obj.id = obj._id;
            if (obj.menu) {
                obj.menu = obj.menu.map(p => ({ ...p, id: p._id }));
            }
            return obj;
        });
    }

    /* Find a single restaurant by its unique ID string */
    static async findById(id) {
        const r = await Restaurant.findById(id);
        if (!r) return null;
        const obj = r.toObject();
        obj.id = obj._id;
        if (obj.menu) {
            obj.menu = obj.menu.map(p => ({ ...p, id: p._id }));
        }
        return obj;
    }

    /* Perform a case-insensitive search to find a restaurant by its exact name */
    static async findByName(name) {
        const r = await Restaurant.findOne({ name: { $regex: new RegExp("^" + name + "$", "i") } });
        if (!r) return null;
        const obj = r.toObject();
        obj.id = obj._id;
        if (obj.menu) {
            obj.menu = obj.menu.map(p => ({ ...p, id: p._id }));
        }
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
            menu: [],
            ownerId: restaurantData.ownerId
        });
        await newRestaurant.save();
        const obj = newRestaurant.toObject();
        obj.id = obj._id;
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
        return obj;
    }

    /* Delete a restaurant profile from the database */
    static async delete(id) {
        const res = await Restaurant.deleteOne({ _id: id });
        return res.deletedCount > 0;
    }
}

/* Dynamic initial menus from the original memory setup */
const initialMenus = {
    'BBB': [
        { name: 'Classic Burger', price: 55, description: '100% kosher beef patty, lettuce, tomato, pickles, red onion, BBB sauce.', image: '/uploads/classic_burger.jpg' },
        { name: 'Double BBB Burger', price: 79, description: 'Two 160g kosher beef patties, smoked goose breast, fried egg, BBB sauce.', image: '/uploads/double_bbb_burger.jpg' },
        { name: 'Garden Burger', price: 49, description: 'Crispy vegan patty, lettuce, tomato, onion, vegan mayo.', image: '/uploads/garden_burger.jpg' },
        { name: 'Crispy Chicken Burger', price: 58, description: 'Golden fried chicken breast, coleslaw, garlic mayo, pickles.', image: '/uploads/crispy_chicken_burger.jpg' },
        { name: 'French Fries Basket', price: 22, description: 'Golden crispy fries with dynamic dipping sauces.', image: '/uploads/french_fries_basket.jpg' }
    ],
    'Golda': [
        { name: 'Cookim Gelato', price: 18, description: 'Italian cream gelato with cookies and chocolate hazelnut fudge.', image: '/uploads/cookim_gelato.jpg' },
        { name: 'Pistachio Gelato', price: 18, description: 'Premium Sicilian pistachio gelato.', image: '/uploads/pistachio_gelato.jpg' },
        { name: 'White Chocolate & Pretzel', price: 18, description: 'Sweet cream gelato with salty pretzels and white chocolate coating.', image: '/uploads/white_chocolate_pretzel.jpg' },
        { name: 'Belgian Waffle Box', price: 45, description: 'Warm Belgian waffle served with 2 scoops of gelato and maple syrup.', image: '/uploads/belgian_waffle_box.jpg' },
        { name: 'Chocolate Souffle', price: 28, description: 'Rich melted chocolate cake served warm.', image: '/uploads/chocolate_souffle.jpg' }
    ],
    'Pizza Hut': [
        { name: 'Classic Margherita', price: 45, description: 'Tomato sauce, 100% real mozzarella cheese, oregano.', image: '/uploads/classic_margherita.jpg' },
        { name: 'Greek Pizza', price: 54, description: 'Mozzarella, feta cheese, black olives, red onions, tomatoes.', image: '/uploads/greek_pizza.jpg' },
        { name: 'Mushroom & Truffle', price: 58, description: 'Truffle white sauce, mozzarella, portobello mushrooms, garlic confit.', image: '/uploads/mushroom_truffle.jpg' },
        { name: 'Spicy Chili Pizza', price: 49, description: 'Spicy tomato sauce, mozzarella, jalapeno, chili flakes, corn.', image: '/uploads/spicy_chili_pizza.jpg' },
        { name: 'Garlic Breadsticks', price: 18, description: 'Warm baked breadsticks seasoned with garlic butter and herbs.', image: '/uploads/garlic_breadsticks.jpg' }
    ],
    'Japan Japan': [
        { name: 'Salmon Avocado Roll', price: 42, description: 'Kosher salmon, avocado, cucumber, wrapped in sesame seeds.', image: '/uploads/salmon_avocado_roll.jpg' },
        { name: 'Spicy Tuna Roll', price: 45, description: 'Spicy red tuna, green onion, cucumber, spicy mayo.', image: '/uploads/spicy_tuna_roll.jpg' },
        { name: 'Sweet Potato Roll', price: 36, description: 'Sweet potato tempura, avocado, cucumber, teriyaki sauce.', image: '/uploads/sweet_potato_roll.jpg' },
        { name: 'Salmon Nigiri', price: 28, description: 'Slices of fresh kosher salmon over seasoned sushi rice (3 pieces).', image: '/uploads/salmon_nigiri.jpg' },
        { name: 'Vegetarian Wok', price: 46, description: 'Egg noodles, stir-fried vegetables, sweet soy sauce.', image: '/uploads/vegetarian_wok.jpg' }
    ],
    'Greg Cafe': [
        { name: 'Israeli Breakfast', price: 62, description: 'Two eggs cooked to choice, chopped salad, cheese spreads, bread, coffee.', image: '/uploads/israeli_breakfast.jpg' },
        { name: 'Shakshuka Greg', price: 54, description: 'Traditional spiced tomato and bell pepper sauce with two eggs, tahini, bread.', image: '/uploads/shakshuka_greg.png' },
        { name: 'Balkan Toast', price: 44, description: 'Toasted bagel with mozzarella, feta cheese, roasted eggplant, pesto.', image: '/uploads/balkan_toast.jpg' },
        { name: 'Halloumi Salad', price: 58, description: 'Crispy halloumi cheese cubes, lettuce, cucumbers, cherry tomatoes, walnuts.', image: '/uploads/halloumi_salad.jpg' },
        { name: 'Iced Cafe Late', price: 16, description: 'Double espresso shot poured over cold milk and ice cubes.', image: '/uploads/iced_cafe_latte.jpg' }
    ],
    'Rebar': [
        { name: 'Re-fresh Smoothie', price: 22, description: 'Melon, mango, mint, apple juice, base of frozen yogurt.', image: '/uploads/re_fresh_smoothie.jpg' },
        { name: 'Re-boost Smoothie', price: 24, description: 'Banana, date, pecan nuts, organic raw tahini, soy milk.', image: '/uploads/re_boost_smoothie.jpg' },
        { name: 'Green Detox', price: 25, description: 'Spinach, celery, green apple, cucumber, ginger, spirulina.', image: '/uploads/green_detox.jpg' },
        { name: 'Berry Blast', price: 23, description: 'Mixed berries, cranberry juice, dairy-free frozen yogurt, honey.', image: '/uploads/berry_blast.jpg' },
        { name: 'Superfood Bowl', price: 32, description: 'Frozen acai base topped with chia seeds, goji berries, pumpkin seeds.', image: '/uploads/superfood_bowl.png' }
    ],
    'Falafel Gabay': [
        { name: 'Classic Falafel Pita', price: 24, description: 'Crispy hot falafel balls, hummus, tahini, Israeli salad, pickles in fluffy pita.', image: '/uploads/classic_falafel_pita.png' },
        { name: 'Hummus Chickpeas Plate', price: 34, description: 'Fresh warm hummus plate topped with cooked chickpeas, olive oil, tahini, pita.', image: '/uploads/hummus_chickpeas_plate.jpg' },
        { name: 'Gabay Sabich Pita', price: 26, description: 'Baked eggplant slices, hard-boiled egg, hummus, tahini, amba sauce, pickles.', image: '/uploads/gabay_sabich_pita.png' },
        { name: 'Crispy French Fries', price: 18, description: 'Thin golden crispy potato chips sprinkled with seasoned salt.', image: '/uploads/crispy_french_fries.jpg' },
        { name: 'Malabi Dessert', price: 15, description: 'Traditional Middle Eastern milk pudding with rose water and peanuts.', image: '/uploads/malabi_dessert.png' }
    ]
};

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
                    ownerId: DEFAULT_ADMIN_ID,
                    menu: []
                },
                {
                    _id: 'golda-gelato-uuid-static',
                    name: 'Golda',
                    ratings: new Map(),
                    image: '/uploads/golda_gelato.png',
                    geolocation: { lat: 32.0715, lng: 34.7785 },
                    prepTime: 10,
                    ownerId: DEFAULT_ADMIN_ID,
                    menu: []
                },
                {
                    _id: 'pizzahut-pizza-uuid-static',
                    name: 'Pizza Hut',
                    ratings: new Map(),
                    image: '/uploads/pizzahut_pizza.png',
                    geolocation: { lat: 32.0801, lng: 34.7805 },
                    prepTime: 20,
                    ownerId: DEFAULT_ADMIN_ID,
                    menu: []
                },
                {
                    _id: 'japanjapan-sushi-uuid-static',
                    name: 'Japan Japan',
                    ratings: new Map(),
                    image: '/uploads/japanjapan_sushi.png',
                    geolocation: { lat: 32.0844, lng: 34.7901 },
                    prepTime: 25,
                    ownerId: DEFAULT_ADMIN_ID,
                    menu: []
                },
                {
                    _id: 'greg-breakfast-uuid-static',
                    name: 'Greg Cafe',
                    ratings: new Map(),
                    image: '/uploads/greg_breakfast.png',
                    geolocation: { lat: 32.0912, lng: 34.7761 },
                    prepTime: 15,
                    ownerId: DEFAULT_ADMIN_ID,
                    menu: []
                },
                {
                    _id: 'rebar-smoothie-uuid-static',
                    name: 'Rebar',
                    ratings: new Map(),
                    image: '/uploads/rebar_smoothie.png',
                    geolocation: { lat: 32.0699, lng: 34.7722 },
                    prepTime: 10,
                    ownerId: DEFAULT_ADMIN_ID,
                    menu: []
                },
                {
                    _id: 'falafel-gabay-uuid-static',
                    name: 'Falafel Gabay',
                    ratings: new Map(),
                    image: '/uploads/falafel_gabay.png',
                    geolocation: { lat: 32.0625, lng: 34.7701 },
                    prepTime: 12,
                    ownerId: DEFAULT_ADMIN_ID,
                    menu: []
                }
            ];

            // Assign initial dynamic menus to seeded restaurants
            initialRestaurants.forEach(restaurant => {
                const items = initialMenus[restaurant.name];
                if (items) {
                    restaurant.menu = items.map(item => ({
                        _id: uuidv4(),
                        ...item
                    }));
                }
            });

            await Restaurant.insertMany(initialRestaurants);
        }
    } catch (err) {
        console.error('Failed to seed default restaurants:', err);
    }
}

export default RestaurantModel;