import RestaurantModel from './restaurantModel.js';

/* Query memory arrays to find matching restaurants and specific dishes */
export const searchRestaurantsAndProducts = (query) => {
    const lowerQuery = query.toLowerCase();

    /* Fetch all active restaurant entries from the memory store */
    const allRestaurants = RestaurantModel.findAll();

    /* Filter restaurants whose name matches the keyword */
    const matchedRestaurants = allRestaurants.filter(restaurant =>
        restaurant.name && restaurant.name.toLowerCase().includes(lowerQuery)
    );

    const matchedProducts = [];

    /* Scan through all restaurant menus to find matching product names or descriptions */
    allRestaurants.forEach(restaurant => {
        if (restaurant.menu && Array.isArray(restaurant.menu)) {
            restaurant.menu.forEach(product => {
                if ((product.name && product.name.toLowerCase().includes(lowerQuery)) ||
                    (product.description && product.description.toLowerCase().includes(lowerQuery))) {

                    /* Inject parent restaurant metadata directly into the product object payload */
                    matchedProducts.push({
                        ...product,
                        restaurantId: restaurant.id,
                        restaurantName: restaurant.name
                    });
                }
            });
        }
    });

    return {
        restaurants: matchedRestaurants,
        products: matchedProducts
    };
};