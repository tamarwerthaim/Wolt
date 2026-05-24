// Import your actual RestaurantModel class to reuse its data access methods
import RestaurantModel from './restaurantModel.js';

// Filter restaurants and products by matching terms based on your real schema
export const searchRestaurantsAndProducts = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Retrieve the active list of restaurants using your class method
    const allRestaurants = RestaurantModel.findAll();

    // Filter restaurants matching the query ONLY by name 
    // filer - inside loop that make new array by the reqiurments
    const matchedRestaurants = allRestaurants.filter(restaurant => 
        restaurant.name && restaurant.name.toLowerCase().includes(lowerQuery)
    );

    const matchedProducts = [];

    // Scan through all restaurants to search within their product menus
    allRestaurants.forEach(restaurant => {
        //making sure that the resturnt have a menu
        if (restaurant.products && Array.isArray(restaurant.products)) {
            // loop on all the products and seek for our word in the products or in the description
            restaurant.products.forEach(product => {
                if ((product.name && product.name.toLowerCase().includes(lowerQuery)) || 
                    (product.description && product.description.toLowerCase().includes(lowerQuery))) {
                    matchedProducts.push(product);
                }
            });
        }
    });

    return {
        restaurants: matchedRestaurants,
        products: matchedProducts
    };
};