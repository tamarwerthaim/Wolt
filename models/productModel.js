import { v4 as uuidv4 } from 'uuid';
import RestaurantModel from './restaurantModel.js'; // import the RestaurantModel to interact with the restaurant data

class ProductModel {
    // pull all products from a restaurant's menu
    static findAll(restaurantId) {
        // find the restaurant by id using the RestaurantModel
        const restaurant = RestaurantModel.findById(restaurantId);
        if (!restaurant) return null; // restaurant not found
        // return the menu of the restaurant, which is an array of products
        return restaurant.menu;
    }

    // pull a specific product from a restaurant's menu
    static findById(restaurantId, productId) {
        //get the menu of the restaurant using the findAll method
        const menu = this.findAll(restaurantId);
        // if the menu is null, it means the restaurant was not found, so we return null
        if (!menu) return null;
        // find the product in the menu by its id and return it, if not found return null
        return menu.find(p => p.id === productId);
    }

    // create a new product and add it to a restaurant's menu
    static create(restaurantId, productData) {
        //find the restaurant by id using the RestaurantModel
        const restaurant = RestaurantModel.findById(restaurantId);
        // if the restaurant is not found, return null
        if (!restaurant) return null;

        // create a new product object with a unique id and the provided data
        const newProduct = {
            id: uuidv4(),
            name: productData.name,
            price: productData.price,
            description: productData.description,
            image: productData.image
        };
        
        // add the new product to the restaurant's menu
        restaurant.menu.push(newProduct);
        return newProduct;
    }

    // update an existing product
    static update(restaurantId, productId, updatedData) {
        // find the product by restaurant id and product id
        const product = this.findById(restaurantId, productId);
        if (!product) return null;

        // update the fields only if they are provided in the updatedData
        if (updatedData.name) product.name = updatedData.name;
        if (updatedData.price) product.price = updatedData.price;
        if (updatedData.description) product.description = updatedData.description;

        return product;
    }

    // delete a product from the menu
    static delete(restaurantId, productId) {
        // find the restaurant by id using the RestaurantModel
        const restaurant = RestaurantModel.findById(restaurantId);
        if (!restaurant) return false;

        const initialLength = restaurant.menu.length;
        // filter out the product with the given id from the restaurant's menu
        restaurant.menu = restaurant.menu.filter(p => p.id !== productId);
        // return true if a product was deleted (i.e., the length of the menu has decreased), otherwise return false
        return restaurant.menu.length !== initialLength;
    }
}

//export the ProductModel class so it can be used in other parts of the application
export default ProductModel;