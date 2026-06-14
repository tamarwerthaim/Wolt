import { v4 as uuidv4 } from 'uuid';
import RestaurantModel from './restaurantModel.js';

class ProductModel {

    /* Get the entire menu array for a specific restaurant */
    static findAll(restaurantId) {
        const restaurant = RestaurantModel.findById(restaurantId);
        if (!restaurant) return null;

        return restaurant.menu;
    }

    /* Find a single dish by its ID within a restaurant's menu */
    static findById(restaurantId, productId) {
        const menu = this.findAll(restaurantId);
        if (!menu) return null;

        return menu.find(p => p.id === productId);
    }

    /* Create a new dish item and append it directly to the restaurant's menu array */
    static create(restaurantId, productData) {
        const restaurant = RestaurantModel.findById(restaurantId);
        if (!restaurant) return null;

        const newProduct = {
            id: uuidv4(),
            name: productData.name,
            price: productData.price,
            description: productData.description,
            image: productData.image
        };

        restaurant.menu.push(newProduct);
        return newProduct;
    }

    /* Update specific dish fields only if they are passed in the update payload */
    static update(restaurantId, productId, updatedData) {
        const product = this.findById(restaurantId, productId);
        if (!product) return null;

        if (updatedData.name) product.name = updatedData.name;
        if (updatedData.price) product.price = updatedData.price;
        if (updatedData.description) product.description = updatedData.description;
        if (updatedData.image) product.image = updatedData.image;

        return product;
    }

    /* Delete a dish from the menu list array */
    static delete(restaurantId, productId) {
        const restaurant = RestaurantModel.findById(restaurantId);
        if (!restaurant) return false;

        const initialLength = restaurant.menu.length;
        restaurant.menu = restaurant.menu.filter(p => p.id !== productId);

        /* Returns true if an item was successfully removed */
        return restaurant.menu.length !== initialLength;
    }
}

export default ProductModel;