import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { registerId } from '../idMapper.js';

// Definition of the Product Schema for MongoDB
const ProductSchema = new mongoose.Schema({
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
    },
    restaurantId: {
        type: String,
        required: true,
        index: true
    },
    cppId: {
        type: Number,
        required: true,
        unique: true
    }
});

export const Product = mongoose.model('Product', ProductSchema);

class ProductModel {

    /* Get the entire menu array for a specific restaurant */
    static async findAll(restaurantId) {
        const list = await Product.find({ restaurantId });
        return list.map(p => {
            const obj = p.toObject();
            obj.id = obj._id;
            return obj;
        });
    }

    /* Find a single dish by its ID within a restaurant's menu */
    static async findById(restaurantId, productId) {
        const p = await Product.findOne({ _id: productId, restaurantId });
        if (!p) return null;
        const obj = p.toObject();
        obj.id = obj._id;
        return obj;
    }

    /* Create a new dish item and append it directly to the products collection */
    static async create(restaurantId, productData) {
        // Find next cppId
        const maxProduct = await Product.findOne().sort({ cppId: -1 });
        const nextCppId = maxProduct && maxProduct.cppId ? maxProduct.cppId + 1 : 1;

        const newProduct = new Product({
            name: productData.name,
            price: productData.price,
            description: productData.description,
            image: productData.image,
            restaurantId: restaurantId,
            cppId: nextCppId
        });

        await newProduct.save();
        const obj = newProduct.toObject();
        obj.id = obj._id;

        // Also register in memory idMapper!
        registerId(obj.id, obj.cppId);

        return obj;
    }

    /* Update specific dish fields only if they are passed in the update payload */
    static async update(restaurantId, productId, updatedData) {
        const product = await Product.findOne({ _id: productId, restaurantId });
        if (!product) return null;

        if (updatedData.name !== undefined) product.name = updatedData.name;
        if (updatedData.price !== undefined) product.price = updatedData.price;
        if (updatedData.description !== undefined) product.description = updatedData.description;
        if (updatedData.image !== undefined) product.image = updatedData.image;

        await product.save();
        const obj = product.toObject();
        obj.id = obj._id;
        return obj;
    }

    /* Delete a dish from the products collection */
    static async delete(restaurantId, productId) {
        const res = await Product.deleteOne({ _id: productId, restaurantId });
        return res.deletedCount > 0;
    }
}

/* Database seeding logic for initial products */
export async function seedDefaultProducts() {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            const seedProducts = [
                // BBB
                { _id: 'prod-bbb-1', name: 'Classic Burger', price: 55, description: '100% kosher beef patty, lettuce, tomato, pickles, red onion, BBB sauce.', image: '/uploads/classic_burger.jpg', restaurantId: 'bbb-restaurant-uuid-static', cppId: 1 },
                { _id: 'prod-bbb-2', name: 'Double BBB Burger', price: 79, description: 'Two 160g kosher beef patties, smoked goose breast, fried egg, BBB sauce.', image: '/uploads/double_bbb_burger.jpg', restaurantId: 'bbb-restaurant-uuid-static', cppId: 2 },
                { _id: 'prod-bbb-3', name: 'Garden Burger', price: 49, description: 'Crispy vegan patty, lettuce, tomato, onion, vegan mayo.', image: '/uploads/garden_burger.jpg', restaurantId: 'bbb-restaurant-uuid-static', cppId: 3 },
                { _id: 'prod-bbb-4', name: 'Crispy Chicken Burger', price: 58, description: 'Golden fried chicken breast, coleslaw, garlic mayo, pickles.', image: '/uploads/crispy_chicken_burger.jpg', restaurantId: 'bbb-restaurant-uuid-static', cppId: 4 },
                { _id: 'prod-bbb-5', name: 'French Fries Basket', price: 22, description: 'Golden crispy fries with dynamic dipping sauces.', image: '/uploads/french_fries_basket.jpg', restaurantId: 'bbb-restaurant-uuid-static', cppId: 5 },
                // Golda
                { _id: 'prod-golda-1', name: 'Cookim Gelato', price: 18, description: 'Italian cream gelato with cookies and chocolate hazelnut fudge.', image: '/uploads/cookim_gelato.jpg', restaurantId: 'golda-gelato-uuid-static', cppId: 6 },
                { _id: 'prod-golda-2', name: 'Pistachio Gelato', price: 18, description: 'Premium Sicilian pistachio gelato.', image: '/uploads/pistachio_gelato.jpg', restaurantId: 'golda-gelato-uuid-static', cppId: 7 },
                { _id: 'prod-golda-3', name: 'White Chocolate & Pretzel', price: 18, description: 'Sweet cream gelato with salty pretzels and white chocolate coating.', image: '/uploads/white_chocolate_pretzel.jpg', restaurantId: 'golda-gelato-uuid-static', cppId: 8 },
                { _id: 'prod-golda-4', name: 'Belgian Waffle Box', price: 45, description: 'Warm Belgian waffle served with 2 scoops of gelato and maple syrup.', image: '/uploads/belgian_waffle_box.jpg', restaurantId: 'golda-gelato-uuid-static', cppId: 9 },
                { _id: 'prod-golda-5', name: 'Chocolate Souffle', price: 28, description: 'Rich melted chocolate cake served warm.', image: '/uploads/chocolate_souffle.jpg', restaurantId: 'golda-gelato-uuid-static', cppId: 10 },
                // Pizza Hut
                { _id: 'prod-pizza-1', name: 'Classic Margherita', price: 45, description: 'Tomato sauce, 100% real mozzarella cheese, oregano.', image: '/uploads/classic_margherita.jpg', restaurantId: 'pizzahut-pizza-uuid-static', cppId: 11 },
                { _id: 'prod-pizza-2', name: 'Greek Pizza', price: 54, description: 'Mozzarella, feta cheese, black olives, red onions, tomatoes.', image: '/uploads/greek_pizza.jpg', restaurantId: 'pizzahut-pizza-uuid-static', cppId: 12 },
                { _id: 'prod-pizza-3', name: 'Mushroom & Truffle', price: 58, description: 'Truffle white sauce, mozzarella, portobello mushrooms, garlic confit.', image: '/uploads/mushroom_truffle.jpg', restaurantId: 'pizzahut-pizza-uuid-static', cppId: 13 },
                { _id: 'prod-pizza-4', name: 'Spicy Chili Pizza', price: 49, description: 'Spicy tomato sauce, mozzarella, jalapeno, chili flakes, corn.', image: '/uploads/spicy_chili_pizza.jpg', restaurantId: 'pizzahut-pizza-uuid-static', cppId: 14 },
                { _id: 'prod-pizza-5', name: 'Garlic Breadsticks', price: 18, description: 'Warm baked breadsticks seasoned with garlic butter and herbs.', image: '/uploads/garlic_breadsticks.jpg', restaurantId: 'pizzahut-pizza-uuid-static', cppId: 15 },
                // Japan Japan
                { _id: 'prod-japan-1', name: 'Salmon Avocado Roll', price: 42, description: 'Kosher salmon, avocado, cucumber, wrapped in sesame seeds.', image: '/uploads/salmon_avocado_roll.jpg', restaurantId: 'japanjapan-sushi-uuid-static', cppId: 16 },
                { _id: 'prod-japan-2', name: 'Spicy Tuna Roll', price: 45, description: 'Spicy red tuna, green onion, cucumber, spicy mayo.', image: '/uploads/spicy_tuna_roll.jpg', restaurantId: 'japanjapan-sushi-uuid-static', cppId: 17 },
                { _id: 'prod-japan-3', name: 'Sweet Potato Roll', price: 36, description: 'Sweet potato tempura, avocado, cucumber, teriyaki sauce.', image: '/uploads/sweet_potato_roll.jpg', restaurantId: 'japanjapan-sushi-uuid-static', cppId: 18 },
                { _id: 'prod-japan-4', name: 'Salmon Nigiri', price: 28, description: 'Slices of fresh kosher salmon over seasoned sushi rice (3 pieces).', image: '/uploads/salmon_nigiri.jpg', restaurantId: 'japanjapan-sushi-uuid-static', cppId: 19 },
                { _id: 'prod-japan-5', name: 'Vegetarian Wok', price: 46, description: 'Egg noodles, stir-fried vegetables, sweet soy sauce.', image: '/uploads/vegetarian_wok.jpg', restaurantId: 'japanjapan-sushi-uuid-static', cppId: 20 },
                // Greg Cafe
                { _id: 'prod-greg-1', name: 'Israeli Breakfast', price: 62, description: 'Two eggs cooked to choice, chopped salad, cheese spreads, bread, coffee.', image: '/uploads/israeli_breakfast.jpg', restaurantId: 'greg-breakfast-uuid-static', cppId: 21 },
                { _id: 'prod-greg-2', name: 'Shakshuka Greg', price: 54, description: 'Traditional spiced tomato and bell pepper sauce with two eggs, tahini, bread.', image: '/uploads/shakshuka_greg.png', restaurantId: 'greg-breakfast-uuid-static', cppId: 22 },
                { _id: 'prod-greg-3', name: 'Balkan Toast', price: 44, description: 'Toasted bagel with mozzarella, feta cheese, roasted eggplant, pesto.', image: '/uploads/balkan_toast.jpg', restaurantId: 'greg-breakfast-uuid-static', cppId: 23 },
                { _id: 'prod-greg-4', name: 'Halloumi Salad', price: 58, description: 'Crispy halloumi cheese cubes, lettuce, cucumbers, cherry tomatoes, walnuts.', image: '/uploads/halloumi_salad.jpg', restaurantId: 'greg-breakfast-uuid-static', cppId: 24 },
                { _id: 'prod-greg-5', name: 'Iced Cafe Late', price: 16, description: 'Double espresso shot poured over cold milk and ice cubes.', image: '/uploads/iced_cafe_latte.jpg', restaurantId: 'greg-breakfast-uuid-static', cppId: 25 },
                // Rebar
                { _id: 'prod-rebar-1', name: 'Re-fresh Smoothie', price: 22, description: 'Melon, mango, mint, apple juice, base of frozen yogurt.', image: '/uploads/re_fresh_smoothie.jpg', restaurantId: 'rebar-smoothie-uuid-static', cppId: 26 },
                { _id: 'prod-rebar-2', name: 'Re-boost Smoothie', price: 24, description: 'Banana, date, pecan nuts, organic raw tahini, soy milk.', image: '/uploads/re_boost_smoothie.jpg', restaurantId: 'rebar-smoothie-uuid-static', cppId: 27 },
                { _id: 'prod-rebar-3', name: 'Green Detox', price: 25, description: 'Spinach, celery, green apple, cucumber, ginger, spirulina.', image: '/uploads/green_detox.jpg', restaurantId: 'rebar-smoothie-uuid-static', cppId: 28 },
                { _id: 'prod-rebar-4', name: 'Berry Blast', price: 23, description: 'Mixed berries, cranberry juice, dairy-free frozen yogurt, honey.', image: '/uploads/berry_blast.jpg', restaurantId: 'rebar-smoothie-uuid-static', cppId: 29 },
                { _id: 'prod-rebar-5', name: 'Superfood Bowl', price: 32, description: 'Frozen acai base topped with chia seeds, goji berries, pumpkin seeds.', image: '/uploads/superfood_bowl.png', restaurantId: 'rebar-smoothie-uuid-static', cppId: 30 },
                // Falafel Gabay
                { _id: 'prod-gabay-1', name: 'Classic Falafel Pita', price: 24, description: 'Crispy hot falafel balls, hummus, tahini, Israeli salad, pickles in fluffy pita.', image: '/uploads/classic_falafel_pita.png', restaurantId: 'falafel-gabay-uuid-static', cppId: 31 },
                { _id: 'prod-gabay-2', name: 'Hummus Chickpeas Plate', price: 34, description: 'Fresh warm hummus plate topped with cooked chickpeas, olive oil, tahini, pita.', image: '/uploads/hummus_chickpeas_plate.jpg', restaurantId: 'falafel-gabay-uuid-static', cppId: 32 },
                { _id: 'prod-gabay-3', name: 'Gabay Sabich Pita', price: 26, description: 'Baked eggplant slices, hard-boiled egg, hummus, tahini, amba sauce, pickles.', image: '/uploads/gabay_sabich_pita.png', restaurantId: 'falafel-gabay-uuid-static', cppId: 33 },
                { _id: 'prod-gabay-4', name: 'Crispy French Fries', price: 18, description: 'Thin golden crispy potato chips sprinkled with seasoned salt.', image: '/uploads/crispy_french_fries.jpg', restaurantId: 'falafel-gabay-uuid-static', cppId: 34 },
                { _id: 'prod-gabay-5', name: 'Malabi Dessert', price: 15, description: 'Traditional Middle Eastern milk pudding with rose water and peanuts.', image: '/uploads/malabi_dessert.png', restaurantId: 'falafel-gabay-uuid-static', cppId: 35 }
            ];
            await Product.insertMany(seedProducts);
            console.log('Default products seeded successfully');
        }
    } catch (err) {
        console.error('Failed to seed default products:', err);
    }
}

/* Syncs all existing database user/product cppIds with the memory idMapper on startup */
export async function syncIdMapper() {
    try {
        const users = await mongoose.model('User').find();
        for (const u of users) {
            if (u.cppId) {
                registerId(u._id, u.cppId);
            }
        }

        const products = await Product.find();
        for (const p of products) {
            if (p.cppId) {
                registerId(p._id, p.cppId);
            }
        }
        console.log('idMapper successfully synchronized with MongoDB database');
    } catch (err) {
        console.error('Failed to sync idMapper with MongoDB:', err);
    }
}

export default ProductModel;