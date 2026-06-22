import { v4 as uuidv4 } from 'uuid';
import { Restaurant } from './restaurantModel.js';

class ProductModel {

    /* Get the entire menu array for a specific restaurant */
    static async findAll(restaurantId) {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return null;

        const obj = restaurant.toObject();
        if (obj.menu) {
            return obj.menu.map(p => ({ ...p, id: p._id }));
        }
        return [];
    }

    /* Find a single dish by its ID within a restaurant's menu */
    static async findById(restaurantId, productId) {
        const menu = await this.findAll(restaurantId);
        if (!menu) return null;

        return menu.find(p => p.id === productId);
    }

    /* Create a new dish item and append it directly to the restaurant's menu array */
    static async create(restaurantId, productData) {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return null;

        const newProductId = uuidv4();
        const newProduct = {
            _id: newProductId,
            name: productData.name,
            price: productData.price,
            description: productData.description,
            image: productData.image
        };

        restaurant.menu.push(newProduct);
        await restaurant.save();

        return {
            id: newProductId,
            name: productData.name,
            price: productData.price,
            description: productData.description,
            image: productData.image
        };
    }

    /* Update specific dish fields only if they are passed in the update payload */
    static async update(restaurantId, productId, updatedData) {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return null;

        const product = restaurant.menu.id(productId);
        if (!product) return null;

        if (updatedData.name) product.name = updatedData.name;
        if (updatedData.price) product.price = updatedData.price;
        if (updatedData.description) product.description = updatedData.description;
        if (updatedData.image) product.image = updatedData.image;

        await restaurant.save();
        const obj = product.toObject();
        return { ...obj, id: obj._id };
    }

    /* Delete a dish from the menu list array */
    static async delete(restaurantId, productId) {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return false;

        const initialLength = restaurant.menu.length;
        restaurant.menu.pull(productId);
        await restaurant.save();

        /* Returns true if an item was successfully removed */
        return restaurant.menu.length !== initialLength;
    }
}

export default ProductModel;