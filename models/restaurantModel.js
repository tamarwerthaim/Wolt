//restaurantModel.js - this file defines the RestaurantModel class, which provides methods for managing restaurant data in memory. It includes methods for creating, reading, updating, and deleting restaurants. Each restaurant has a unique id, a name, and a menu (which is an array of dishes).
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_ADMIN_ID } from './userModel.js';

//for storing restaurants in memory
let restaurants = [
    {
        id: uuidv4(),
        name: 'BBB',
        ratings: {},
        image: '/uploads/bbb_burger.png',
        geolocation: { lat: 32.0853, lng: 34.7818 },
        prepTime: 15,
        menu: [],
        ownerId: DEFAULT_ADMIN_ID
    },
    {
        id: uuidv4(),
        name: 'Golda',
        ratings: {},
        image: '/uploads/golda_gelato.png',
        geolocation: { lat: 32.0715, lng: 34.7785 },
        prepTime: 10,
        menu: [],
        ownerId: DEFAULT_ADMIN_ID
    },
    {
        id: uuidv4(),
        name: 'Pizza Hut',
        ratings: {},
        image: '/uploads/pizzahut_pizza.png',
        geolocation: { lat: 32.0801, lng: 34.7805 },
        prepTime: 20,
        menu: [],
        ownerId: DEFAULT_ADMIN_ID
    },
    {
        id: uuidv4(),
        name: 'Japan Japan',
        ratings: {},
        image: '/uploads/japanjapan_sushi.png',
        geolocation: { lat: 32.0844, lng: 34.7901 },
        prepTime: 25,
        menu: [],
        ownerId: DEFAULT_ADMIN_ID
    },
    {
        id: uuidv4(),
        name: 'Greg Cafe',
        ratings: {},
        image: '/uploads/greg_breakfast.png',
        geolocation: { lat: 32.0912, lng: 34.7761 },
        prepTime: 15,
        menu: [],
        ownerId: DEFAULT_ADMIN_ID
    },
    {
        id: uuidv4(),
        name: 'Rebar',
        ratings: {},
        image: '/uploads/rebar_smoothie.png',
        geolocation: { lat: 32.0699, lng: 34.7722 },
        prepTime: 10,
        menu: [],
        ownerId: DEFAULT_ADMIN_ID
    },
    {
        id: uuidv4(),
        name: 'Falafel Gabay',
        ratings: {},
        image: '/uploads/falafel_gabay.png',
        geolocation: { lat: 32.0625, lng: 34.7701 },
        prepTime: 12,
        menu: [],
        ownerId: DEFAULT_ADMIN_ID
    }
];

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

// Populate menus dynamically to avoid hardcoded IDs
restaurants.forEach(restaurant => {
  const items = initialMenus[restaurant.name];
  if (items) {
    restaurant.menu = items.map(item => ({
      id: uuidv4(),
      ...item
    }));
  }
});

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
        //create a new restaurant object with a unique id and assign the owner's ID
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
            menu: [],
            ownerId: restaurantData.ownerId
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