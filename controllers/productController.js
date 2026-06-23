import ProductModel from '../models/productModel.js';
import RestaurantModel from '../models/restaurantModel.js';
import * as userModel from '../models/userModel.js';
import { sendToCpp } from '../socket.js';
import { getIntId, getUuid } from '../idMapper.js';
import jwt from 'jsonwebtoken';

/* Controller handling menu items operations and interactions reporting to the recommendation server */
class ProductController {

    /* GET /api/restaurants/:id/products - Fetch the entire menu for a specific restaurant */
    static async getAllProducts(req, res) {
        try {
            const { id } = req.params;
            const menu = await ProductModel.findAll(id);

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
        try {
            const { id, pld } = req.params;
            const product = await ProductModel.findById(id, pld);

            if (!product) {
                return res.status(404).json({ error: "Product not found" });
            }

            /* Check if a user-id is present in the request headers to track recommendations */
            const userId = req.header('user-id');
            if (userId) {
                /* Fire the socket notification to the C++ server asynchronously in the background */
                (async () => {
                    const user = await userModel.findUserById(userId);
                    if (user) {
                        const intUserId = getIntId(userId);
                        const intProductId = getIntId(pld);

                        // Store the last viewed product ID in the database for restaurant recommendation fallback
                        await userModel.updateLastViewedProduct(userId, pld);

                        /* If the user hasn't been synced with C++ yet, send a POST, otherwise send a PATCH */
                        let commandType = !user.isSyncedWithCpp ? 'POST' : 'PATCH';
                        let command = `${commandType} ${intUserId} ${intProductId}`;

                        let cppResponse = await sendToCpp(command);

                        /* If the command fails with 404, flip type and retry (e.g. C++ restarted or cache mismatch) */
                        if (cppResponse.includes("404 Not Found")) {
                            commandType = commandType === 'POST' ? 'PATCH' : 'POST';
                            command = `${commandType} ${intUserId} ${intProductId}`;
                            cppResponse = await sendToCpp(command);
                        }

                        if (cppResponse.includes("201 Created") || cppResponse.includes("204 No Content")) {
                            user.isSyncedWithCpp = true;
                        }
                    }
                })().catch(error => {
                    /* Silence recommendation sync background faults safely */
                });
            }

            return res.status(200).json(product);
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    /* GET /api/restaurants/:id/products/:pld/recommendations - Get recommended products from the same restaurant */
    static async getProductRecommendations(req, res) {
        try {
            const { id, pld } = req.params;

            // Get JWT token optionally from authorization header
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
                return res.status(200).json([]);
            }

            const JWT_SECRET = 'tamar_roni_moriya';
            let userId;
            try {
                const decodedUser = jwt.verify(token, JWT_SECRET);
                userId = decodedUser.id;
            } catch (err) {
                return res.status(200).json([]);
            }

            const intUserId = getIntId(userId);
            const intProductId = getIntId(pld);

            const command = `GET ${intUserId} ${intProductId}`;
            let cppResponse;
            try {
                cppResponse = await sendToCpp(command);
            } catch (cppError) {
                console.error("C++ product recommendation query failed:", cppError);
                return res.status(200).json([]);
            }

            if (!cppResponse.startsWith("200 Ok")) {
                return res.status(200).json([]);
            }

            const lines = cppResponse.split('\n');
            const productIdsLine = lines[lines.length - 1] || '';
            const recommendedIntIds = productIdsLine.trim().split(/\s+/).filter(Boolean);

            if (recommendedIntIds.length === 0) {
                return res.status(200).json([]);
            }

            const recommendedProductUuids = recommendedIntIds
                .map(intIdStr => getUuid(parseInt(intIdStr)))
                .filter(Boolean);

            const menu = await ProductModel.findAll(id);
            if (!menu) {
                return res.status(200).json([]);
            }

            // Filter recommended products so they only belong to the current restaurant
            const recommendedProducts = menu.filter(item => {
                const itemId = item.id || item._id;
                return recommendedProductUuids.includes(itemId.toString());
            });

            return res.status(200).json(recommendedProducts);
        } catch (error) {
            console.error("Error in getProductRecommendations:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    /* POST /api/restaurants/:id/products - Create a new product and add it to the menu */
    static async createProduct(req, res) {
        try {
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

            const restaurant = await RestaurantModel.findById(id);
            if (!restaurant) {
                return res.status(404).json({ error: "Restaurant not found" });
            }

            /* Verify that the logged-in owner actually owns this restaurant */
            if (restaurant.ownerId !== req.user.id) {
                return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
            }

            const newProduct = await ProductModel.create(id, { name, price: numPrice, description, image });
            if (!newProduct) {
                return res.status(404).json({ error: "Restaurant not found" });
            }

            res.location(`/api/restaurants/${id}/products/${newProduct.id}`);
            return res.status(201).send();
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    /* PATCH /api/restaurants/:id/products/:pld - Update fields of an existing product */
    static async updateProduct(req, res) {
        try {
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

            const restaurant = await RestaurantModel.findById(id);
            if (!restaurant) {
                return res.status(404).json({ error: "Restaurant not found" });
            }

            /* Verify ownership bounds before running the update hook */
            if (restaurant.ownerId !== req.user.id) {
                return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
            }

            const updatedProduct = await ProductModel.update(id, pld, { name, price: numPrice, description, image });

            if (!updatedProduct) {
                return res.status(404).json({ error: "Product or Restaurant not found" });
            }

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    /* DELETE /api/restaurants/:id/products/:pld - Remove a product dish completely from the menu */
    static async deleteProduct(req, res) {
        try {
            const { id, pld } = req.params;

            const restaurant = await RestaurantModel.findById(id);
            if (!restaurant) {
                return res.status(404).json({ error: "Restaurant not found" });
            }
            if (restaurant.ownerId !== req.user.id) {
                return res.status(403).json({ error: "Forbidden: You are not the owner of this restaurant" });
            }

            const isDeleted = await ProductModel.delete(id, pld);

            if (!isDeleted) {
                return res.status(404).json({ error: "Product or Restaurant not found" });
            }

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}

export default ProductController;