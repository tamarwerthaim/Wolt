import RestaurantModel from '../models/restaurantModel.js';

/* Controller handling restaurant operations, including location-based lookups and ownership authorization */
class RestaurantController {

    /* GET /api/restaurants - Retrieve all active restaurant profiles */
    static getAllRestaurants(req, res) {
        const restaurants = RestaurantModel.findAll();
        return res.status(200).json(restaurants);
    }

    /* GET /api/restaurants/:id - Retrieve a specific restaurant profile by its ID */
    static getRestaurantById(req, res) {
        const { id } = req.params;
        const restaurant = RestaurantModel.findById(id);

        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }
        return res.status(200).json(restaurant);
    }

    /* POST /api/restaurants - Create and store a new restaurant profile */
    static createRestaurant(req, res) {
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
        const existingRestaurant = RestaurantModel.findByName ? RestaurantModel.findByName(name) : null;
        if (existingRestaurant) {
            return res.status(400).json({ error: "Restaurant with this name already exists" });
        }

        /* Save the new restaurant profile and assign ownership to the authenticated user */
        const newRestaurant = RestaurantModel.create({ name, image, lat, lng, prepTime: parsedPrepTime, ownerId: req.user.id });

        res.location(`/api/restaurants/${newRestaurant.id}`);
        return res.status(201).send();
    }

    /* PATCH /api/restaurants/:id - Update specific fields of an existing restaurant */
    static updateRestaurant(req, res) {
        const { id } = req.params;
        const { name, image: bodyImage, lat, lng, prepTime } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : bodyImage;

        if (name) {
            const existing = RestaurantModel.findByName(name);
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
        const restaurant = RestaurantModel.findById(id);
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }
        if (restaurant.ownerId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
        }

        RestaurantModel.update(id, { name, image, lat, lng, prepTime: parsedPrepTime });
        return res.status(204).send();
    }

    /* DELETE /api/restaurants/:id - Delete a restaurant profile from the store */
    static deleteRestaurant(req, res) {
        const { id } = req.params;

        /* Verify ownership authorization before running the delete model hook */
        const restaurant = RestaurantModel.findById(id);
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }
        if (restaurant.ownerId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
        }

        RestaurantModel.delete(id);
        return res.status(204).send();
    }

    /* POST /api/restaurants/:id/rate - Allow logged-in users to rate a restaurant */
    static rateRestaurant(req, res) {
        const { id } = req.params;
        const { score } = req.body;
        const userId = req.user.id;

        if (!score || score < 1 || score > 5) {
            return res.status(400).json({ error: "Score must be a number between 1 and 5" });
        }

        const updatedAverage = RestaurantModel.addRating(id, userId, score);
        if (updatedAverage === null) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        return res.status(200).json({ newAverageRating: updatedAverage });
    }
}

export default RestaurantController;