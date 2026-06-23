import RestaurantModel from '../models/restaurantModel.js';
import orderModel from '../models/orderModel.js';
import * as userModel from '../models/userModel.js';
import { sendToCpp } from '../socket.js';
import { getIntId, getUuid } from '../idMapper.js';

/* Controller handling restaurant operations, including location-based lookups and ownership authorization */
class RestaurantController {
    // Get restaurant recommendations for the authenticated user from the C++ engine based on their last ordered product
    static async getRecommendations(req, res) {
        try {
            const userId = req.user.id;

            // Fetch user's orders and find the last ordered product
            const allOrders = await orderModel.findAll();
            const userOrders = allOrders
                .filter(order => order.userId === userId)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            let lastProductId = null;

            if (userOrders.length > 0 && userOrders[0].items && userOrders[0].items.length > 0) {
                const lastOrder = userOrders[0];
                const lastProduct = lastOrder.items[0]; // Get the first product of the last order
                lastProductId = lastProduct.productId;
            } else {
                // Fallback: Check if the user has a last viewed product
                const user = await userModel.findUserById(userId);
                if (user && user.lastViewedProductId) {
                    lastProductId = user.lastViewedProductId;
                }
            }

            // If we have neither orders nor product views, return an empty array (no base product to recommend on)
            if (!lastProductId) {
                return res.status(200).json([]);
            }

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
            const allRestaurants = await RestaurantModel.findAll();

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
    static async getAllRestaurants(req, res) {
        try {
            const restaurants = await RestaurantModel.findAll();
            return res.status(200).json(restaurants);
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    /* GET /api/restaurants/:id - Retrieve a specific restaurant profile by its ID */
    static async getRestaurantById(req, res) {
        try {
            const { id } = req.params;
            const restaurant = await RestaurantModel.findById(id);

            if (!restaurant) {
                return res.status(404).json({ error: "Restaurant not found" });
            }
            return res.status(200).json(restaurant);
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    /* POST /api/restaurants - Create and store a new restaurant profile */
    static async createRestaurant(req, res) {
        try {
            const { name, lat, lng, prepTime } = req.body;
            const image = req.file ? `/uploads/${req.file.filename}` : null;

            /* Verify all mandatory attributes are present in the request body */
            if (!name || !image || !lat || !lng || !prepTime) {
                return res.status(400).json({ error: "All fields are required: name, image, lat, lng, and prepTime must be provided." });
            }

            const parsedPrepTime = parseInt(prepTime);
            if (isNaN(parsedPrepTime) || parsedPrepTime <= 0) {
                return res.status(400).json({ error: "Preparation time must be a valid number greater than zero" });
            }

            /* Geolocation coordinate formats validation */
            const numLat = parseFloat(lat);
            const numLng = parseFloat(lng);
            if (isNaN(numLat) || isNaN(numLng)) {
                return res.status(400).json({ error: "Latitude and Longitude must be valid numbers" });
            }
            if (numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
                return res.status(400).json({ error: "Invalid coordinate bounds for geolocation" });
            }

            if (typeof image !== 'string' || image.trim() === '') {
                return res.status(400).json({ error: "Image path must be a non-empty string reference" });
            }

            /* Check for unique restaurant name constraints */
            const existingRestaurant = RestaurantModel.findByName ? await RestaurantModel.findByName(name) : null;
            if (existingRestaurant) {
                return res.status(400).json({ error: "Restaurant with this name already exists" });
            }

            /* Save the new restaurant profile and assign ownership to the authenticated user */
            const newRestaurant = await RestaurantModel.create({ name, image, lat, lng, prepTime: parsedPrepTime, ownerId: req.user.id });

            res.location(`/api/restaurants/${newRestaurant.id}`);
            return res.status(201).send();
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    /* PATCH /api/restaurants/:id - Update specific fields of an existing restaurant */
    static async updateRestaurant(req, res) {
        try {
            const { id } = req.params;
            const { name, image: bodyImage, lat, lng, prepTime } = req.body;
            const image = req.file ? `/uploads/${req.file.filename}` : bodyImage;

            if (name) {
                const existing = await RestaurantModel.findByName(name);
                if (existing && existing.id !== id) {
                    return res.status(400).json({ error: "Restaurant with this name already exists" });
                }
            }

            /* Re-validate coordinates if partial coordinates updates are supplied */
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

            /* Verify restaurant owner authorization before executing the update */
            const restaurant = await RestaurantModel.findById(id);
            if (!restaurant) {
                return res.status(404).json({ error: "Restaurant not found" });
            }
            if (restaurant.ownerId !== req.user.id) {
                return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
            }

            await RestaurantModel.update(id, { name, image, lat, lng, prepTime: parsedPrepTime });
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    /* DELETE /api/restaurants/:id - Delete a restaurant profile from the store */
    static async deleteRestaurant(req, res) {
        try {
            const { id } = req.params;

            /* Verify ownership authorization before running the delete model hook */
            const restaurant = await RestaurantModel.findById(id);
            if (!restaurant) {
                return res.status(404).json({ error: "Restaurant not found" });
            }
            if (restaurant.ownerId !== req.user.id) {
                return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
            }

            await RestaurantModel.delete(id);
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    /* POST /api/restaurants/:id/rate - Allow logged-in users to rate a restaurant */
    static async rateRestaurant(req, res) {
        try {
            const { id } = req.params;
            const { score } = req.body;
            const userId = req.user.id;

            if (!score || score < 1 || score > 5) {
                return res.status(400).json({ error: "Score must be a number between 1 and 5" });
            }

            const updatedAverage = await RestaurantModel.addRating(id, userId, score);
            if (updatedAverage === null) {
                return res.status(404).json({ error: "Restaurant not found" });
            }

            return res.status(200).json({ newAverageRating: updatedAverage });
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}

export default RestaurantController;