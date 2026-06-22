import { Restaurant } from './restaurantModel.js';
import { Product } from './productModel.js';

/* Query MongoDB to find matching restaurants and specific dishes using regex matches */
export const searchRestaurantsAndProducts = async (query) => {
    const matchedRestaurants = await Restaurant.find({
        name: { $regex: query, $options: 'i' }
    });

    const formattedRestaurants = matchedRestaurants.map(r => {
        const obj = r.toObject();
        obj.id = obj._id;
        return obj;
    });

    const matchedProducts = await Product.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ]
    });

    const formattedProducts = [];
    const restaurantCache = new Map();

    for (const p of matchedProducts) {
        const obj = p.toObject();
        obj.id = obj._id;

        let restaurantName = '';
        if (restaurantCache.has(obj.restaurantId)) {
            restaurantName = restaurantCache.get(obj.restaurantId);
        } else {
            const r = await Restaurant.findById(obj.restaurantId);
            if (r) {
                restaurantName = r.name;
                restaurantCache.set(obj.restaurantId, r.name);
            }
        }

        obj.restaurantName = restaurantName;
        formattedProducts.push(obj);
    }

    return {
        restaurants: formattedRestaurants,
        products: formattedProducts
    };
};