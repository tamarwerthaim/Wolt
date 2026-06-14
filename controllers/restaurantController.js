//import the RestaurantModel to interact with the restaurant data
import RestaurantModel from '../models/restaurantModel.js';
import orderModel from '../models/orderModel.js';
import { sendToCpp } from '../socket.js';
import { getIntId, getUuid } from '../idMapper.js';

class RestaurantController {
    // Get restaurant recommendations for the authenticated user from the C++ engine based on their last ordered product
    static async getRecommendations(req, res) {
        try {
            const userId = req.user.id;

            // Fetch user's orders and find the last ordered product
            const allOrders = orderModel.findAll();
            const userOrders = allOrders
                .filter(order => order.userId === userId)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // If the user has no orders, return an empty array (no base product to recommend on)
            if (userOrders.length === 0 || !userOrders[0].items || userOrders[0].items.length === 0) {
                return res.status(200).json([]);
            }

            const lastOrder = userOrders[0];
            const lastProduct = lastOrder.items[0]; // Get the first product of the last order
            const lastProductId = lastProduct.productId;

            // Map string UUIDs to C++ compatible integer IDs
            const intUserId = getIntId(userId);
            const intProductId = getIntId(lastProductId);

            // Query the C++ recommendation socket server
            const command = `GET ${intUserId} ${intProductId}`;
            let cppResponse;
            try {
                cppResponse = await sendToCpp(command);
            } catch (cppError) {
                console.error("C++ recommendation engine query failed:", cppError);
                // Fail silently by returning an empty list to keep the UI running
                return res.status(200).json([]);
            }

            // The C++ server response must start with a success status
            if (!cppResponse.startsWith("200 Ok")) {
                return res.status(200).json([]);
            }

            // Parse recommended product integer IDs from the response payload
            const lines = cppResponse.split('\n');
            const productIdsLine = lines[lines.length - 1] || '';
            const recommendedIntIds = productIdsLine.trim().split(/\s+/).filter(Boolean);

            if (recommendedIntIds.length === 0) {
                return res.status(200).json([]);
            }

            // Map recommended product integer IDs back to UUIDs
            const recommendedProductUuids = recommendedIntIds
                .map(intIdStr => getUuid(parseInt(intIdStr)))
                .filter(Boolean);

            // Extract the IDs of all restaurants the user has ordered from to exclude them from recommendation discovery
            const orderedRestaurantIds = new Set(userOrders.map(order => order.restaurantId));

            // Map recommended products to their corresponding restaurants in our memory database
            const recommendedRestaurants = [];
            const addedRestaurantIds = new Set();
            const allRestaurants = RestaurantModel.findAll();

            for (const prodUuid of recommendedProductUuids) {
                const restaurant = allRestaurants.find(r => 
                    r.menu && r.menu.some(p => (p.id || p._id) === prodUuid)
                );

                // Recommending new restaurants only, filtering out already visited ones
                if (restaurant && !addedRestaurantIds.has(restaurant.id) && !orderedRestaurantIds.has(restaurant.id)) {
                    addedRestaurantIds.add(restaurant.id);
                    recommendedRestaurants.push(restaurant);
                }
            }

            // Return the unique list of recommended restaurants
            return res.status(200).json(recommendedRestaurants);

        } catch (error) {
            console.error("Error in getRecommendations controller:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    //get all restaurants - get the request of the client and the object of the response
    static getAllRestaurants(req, res) {
        //bring all the restaurants from the model
        const restaurants = RestaurantModel.findAll();
        //send the restaurants as a JSON response with status 200 (OK)
        res.status(200).json(restaurants);
    }

    //get a specific restaurant by id
    static getRestaurantById(req, res) {
        //extract the id from the request parameters
        const { id } = req.params;
        //find the restaurant with the given id using the model
        const restaurant = RestaurantModel.findById(id);

        //if the restaurant is not found, return a 404 status with an error message
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }
        //if the restaurant is found, return it as a JSON response with status 200 (OK)
        res.status(200).json(restaurant);
    }

    //create a new restaurant
    static createRestaurant(req, res) {
        //extract the name from the request body
        const { name, lat, lng, prepTime } = req.body;

        const image = req.file ? `/uploads/${req.file.filename}` : null;

        //validate that the name is provided, if not return a 400 status with an error message
        if (!name || !image || !lat || !lng || !prepTime) {
            return res.status(400).json({ error: "All fields are required: name, image, lat, lng, and prepTime must be provided." });
        }

        const parsedPrepTime = parseInt(prepTime);
        if (isNaN(parsedPrepTime) || parsedPrepTime <= 0) {
            return res.status(400).json({ error: "Preparation time must be a valid number greater than zero" });
        }

        //validate that the latitude and longitude are valid numbers within the acceptable range for geolocation coordinates
        const numLat = parseFloat(lat);
        const numLng = parseFloat(lng);
        if (isNaN(numLat) || isNaN(numLng)) {
            return res.status(400).json({ error: "Latitude and Longitude must be valid numbers" });
        }
        if (numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
            return res.status(400).json({ error: "Invalid coordinate bounds for geolocation" });
        }

        // Image Path String Validation
        if (typeof image !== 'string' || image.trim() === '') {
            return res.status(400).json({ error: "Image path must be a non-empty string reference" });
        }

        //check if a restaurant with the same name already exists 
        const existingRestaurant = RestaurantModel.findByName ? RestaurantModel.findByName(name) : null;

        // if a restaurant with the same name already exists, return a 400 status with an error message to prevent duplicate restaurant names
        if (existingRestaurant) {
            return res.status(400).json({ error: "Restaurant with this name already exists" });
        }

        //create a new restaurant using the model and store the result in newRestaurant (assigning the authenticated user's ID as ownerId)
        const newRestaurant = RestaurantModel.create({ name, image, lat, lng, prepTime: parsedPrepTime, ownerId: req.user.id });

        //set the Location header to the URL of the newly created restaurant
        res.location(`/api/restaurants/${newRestaurant.id}`);
        //return a 201 status to indicate that the restaurant was created successfully
        res.status(201).send();
    }

    //update an existing restaurant
    static updateRestaurant(req, res) {
        //extract the id from the request parameters and the name from the request body
        const { id } = req.params;
        const { name, image: bodyImage, lat, lng, prepTime } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : bodyImage;

        //validate that the name is provided
        if (name) {
            //check if a restaurant with the same name already exists
            const existing = RestaurantModel.findByName(name);
            //if a restaurant with the same name exists and it's not the restaurant we're trying to update, return a 400 status with an error message to prevent duplicate restaurant names
            if (existing && existing.id !== id) {
                return res.status(400).json({ error: "Restaurant with this name already exists" });
            }
        }
        // Conditional Geolocation Checks on patches
        if (lat || lng) {
            if (!lat || !lng) {
                return res.status(400).json({ error: "Both lat and lng parameters must be updated together" });
            }
            const numLat = parseFloat(lat);
            const numLng = parseFloat(lng);
            if (isNaN(numLat) || isNaN(numLng) || numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
                return res.status(400).json({ error: "Invalid coordinates format or out of bounds" });
            }
        }

        let parsedPrepTime;
        if (prepTime !== undefined) {
            parsedPrepTime = parseInt(prepTime);
            if (isNaN(parsedPrepTime) || parsedPrepTime <= 0) {
                return res.status(400).json({ error: "Preparation time must be a valid number greater than zero" });
            }
        }

        //find the restaurant to update and check ownership
        const restaurant = RestaurantModel.findById(id);
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }
        if (restaurant.ownerId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
        }

        //use the model to update the restaurant with the given id and new name, and store the result in updatedRestaurant
        const updatedRestaurant = RestaurantModel.update(id, { name, image, lat, lng, prepTime: parsedPrepTime });

        //if the update is successful, return a 204 status to indicate that the restaurant was updated successfully
        res.status(204).send();
    }

    //delete a restaurant by id
    static deleteRestaurant(req, res) {
        //extract the id from the request parameters
        const { id } = req.params;

        //find the restaurant to delete and check ownership
        const restaurant = RestaurantModel.findById(id);
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }
        if (restaurant.ownerId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
        }

        const isDeleted = RestaurantModel.delete(id);

        //if the deletion is successful, return a 204 status to indicate that the restaurant was deleted successfully
        res.status(204).send();
    }

    static rateRestaurant(req, res) {
        //extract the restaurant id from parameters and the rating score from the request body
        const { id } = req.params;
        const { score } = req.body;
        const userId = req.user.id; // שליפת ה-userId מהטוקן המאומת

        //validate that the score is a valid input number between 1 and 5
        if (!score || score < 1 || score > 5) {
            return res.status(400).json({ error: "Score must be a number between 1 and 5" });
        }

        //call the model layer to push the new vote score and calculate the real-time average rating
        const updatedAverage = RestaurantModel.addRating(id, userId, score);

        //if the target restaurant to rate is not found in memory database, return a 404 status
        if (updatedAverage === null) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        //return the updated dynamic average rating score with a 200 (OK) response status
        return res.status(200).json({ newAverageRating: updatedAverage });
    }
}
//export the RestaurantController class so it can be used in other parts of the application
export default RestaurantController;