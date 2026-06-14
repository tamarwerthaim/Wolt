import ProductModel from '../models/productModel.js';
import RestaurantModel from '../models/restaurantModel.js';
import * as userModel from '../models/userModel.js'
import { sendToCpp } from '../socket.js';
import { getIntId } from '../idMapper.js';

/* Controller handling menu items operations and interactions reporting to the recommendation server */
class ProductController {

    /* GET /api/restaurants/:id/products - Fetch the entire menu for a specific restaurant */
    static async getAllProducts(req, res) {
        try {
            const { id } = req.params;
            const menu = ProductModel.findAll(id);

            if (!menu) {
                return res.status(404).json({ error: "Restaurant not found" });
            }

            return res.status(200).json(menu);
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    /* GET /api/restaurants/:id/products/:pld - Fetch a single product and log a view event with C++ */
    static async getProductById(req, res) {
        const { id, pld } = req.params;
        const product = ProductModel.findById(id, pld);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        /* Check if a user-id is present in the request headers to track recommendations */
        const userId = req.header('user-id');
        if (userId) {
            /* Fire the socket notification to the C++ server asynchronously in the background */
            (async () => {
                const user = userModel.findUserById(userId);
                if (user) {
                    const intUserId = getIntId(userId);
                    const intProductId = getIntId(pld);

                    /* If the user hasn't been synced with C++ yet, send a POST, otherwise send a PATCH */
                    const commandType = !user.isSyncedWithCpp ? 'POST' : 'PATCH';
                    const command = `${commandType} ${intUserId} ${intProductId}`;

                    const cppResponse = await sendToCpp(command);
                    if (cppResponse.includes("201 Created") || cppResponse.includes("204 No Content")) {
                        user.isSyncedWithCpp = true;
                    }
                }
            })().catch(error => {
                /* Silence recommendation sync background faults safely */
            });
        }

        return res.status(200).json(product);
    }

    /* POST /api/restaurants/:id/products - Create a new product and add it to the menu */
    static async createProduct(req, res) {
        const { id } = req.params;
        const name = req.body?.name;
        const price = req.body?.price;
        const description = req.body?.description;
        /* Check if a file was uploaded, otherwise look for a fallback fallback image string */
        const image = req.file ? `/uploads/${req.file.filename}` : req.body?.image;

        if (!name || !price || !description || !image) {
            return res.status(400).json({ error: "All fields are required: name, price, description, and image must be provided." });
        }

        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice <= 0) {
            return res.status(400).json({ error: "Product price must be a valid number greater than zero" });
        }

        if (typeof image !== 'string' || image.trim() === '') {
            return res.status(400).json({ error: "Product image must be a valid non-empty string path" });
        }

        const restaurant = RestaurantModel.findById(id);
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        /* Verify that the logged-in owner actually owns this restaurant */
        if (restaurant.ownerId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
        }

        const newProduct = ProductModel.create(id, { name, price: numPrice, description, image });
        if (!newProduct) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        res.location(`/api/restaurants/${id}/products/${newProduct.id}`);
        return res.status(201).send();
    }

    /* PATCH /api/restaurants/:id/products/:pld - Update fields of an existing product */
    static async updateProduct(req, res) {
        const { id, pld } = req.params;
        const name = req.body?.name;
        const price = req.body?.price;
        const description = req.body?.description;
        const bodyImage = req.body?.image;
        const image = req.file ? `/uploads/${req.file.filename}` : bodyImage;

        /* Validate inputs only if they are being updated in the request body */
        let numPrice;
        if (price !== undefined) {
            numPrice = parseFloat(price);
            if (isNaN(numPrice) || numPrice <= 0) {
                return res.status(400).json({ error: "Updated product price must be a valid number greater than zero" });
            }
        }
        if (image !== undefined) {
            if (typeof image !== 'string' || image.trim() === '') {
                return res.status(400).json({ error: "Updated product image must be a valid non-empty string path" });
            }
        }

        const restaurant = RestaurantModel.findById(id);
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        /* Verify ownership bounds before running the update hook */
        if (restaurant.ownerId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
        }

        const updatedProduct = ProductModel.update(id, pld, { name, price: numPrice, description, image });

        if (!updatedProduct) {
            return res.status(404).json({ error: "Product or Restaurant not found" });
        }

        return res.status(204).send();
    }

    /* DELETE /api/restaurants/:id/products/:pld - Remove a product dish completely from the menu */
    static async deleteProduct(req, res) {
        const { id, pld } = req.params;

        const restaurant = RestaurantModel.findById(id);
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }
        if (restaurant.ownerId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
        }

        const isDeleted = ProductModel.delete(id, pld);

        if (!isDeleted) {
            return res.status(404).json({ error: "Product or Restaurant not found" });
        }

        return res.status(204).send();
    }
}

export default ProductController;