import ProductModel from '../models/productModel.js';
import * as userModel from '../models/userModel.js'
import { sendToCpp } from '../socket.js';
import { getIntId } from '../idMapper.js';

class ProductController {
    //pull all products from a restaurant's menu
    static async getAllProducts(req, res) {
        try {
            const { id } = req.params; // the id of the restaurant from the URL
            // use the ProductModel to get the menu of the restaurant with the given id
            const menu = ProductModel.findAll(id);
            
            // if the restaurant is not found, the model will return null
            if (!menu) {
                return res.status(404).json({ error: "Restaurant not found" });
            }
            
            res.status(200).json(menu);
        } catch (error) {
            // For any unexpected error, return a 500 Internal Server Error response
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // pull a specific product + report to the recommendation server (cpp)
    static async getProductById(req, res) {
        // extract the restaurant id and product id from the request parameters
        const { id, pld } = req.params; 
        // use the ProductModel to find the specific product by restaurant id and product id
        const product = ProductModel.findById(id, pld);
        // if the product is not found, the model will return null
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Notify the C++ recommendation server about the product view
        const userId = req.header('user-id'); 
        //check if the userId header is provided
        if (userId) {
            // we use a try-catch block to handle any potential errors when communicating with the C++ server, so that our server doesn't crash if the C++ server is down
            try {
                const user = userModel.findUserById(userId);
                if (user) {
                    // convert the string IDs to integers
                    const intUserId = getIntId(userId);
                    const intProductId = getIntId(pld);
                    // if user is not exist make post else patch
                    const commandType = !user.isSyncedWithCpp ? 'POST' : 'PATCH';
                    const command = `${commandType} ${intUserId} ${intProductId}`;
                    // send the command to the C++ server and wait for the response
                    const cppResponse = await sendToCpp(command);
                    // log the response from the C++ server for debugging purposes
                    console.log("C++ Server Response:", cppResponse);
                    // if created
                    if (cppResponse.includes("201 Created") || cppResponse.includes("204 No Content")) {
                        // update that created in Cpp
                        user.isSyncedWithCpp = true;
                    }
                }
            //if there is an error
            } catch (error) {
                // log the error message to the console, but don't crash the server
                console.error("Failed to notify C++ server:", error.message);
            }
        }
        // return the product details as a JSON response with status 200 (OK)
        res.status(200).json(product);
    }

    // create a new product and add it to a restaurant's menu
    static async createProduct(req, res) {
        // extract the restaurant id from the request parameters and the product data from the request body
        const { id } = req.params;
        const { name, price, description, image } = req.body;
        //if the name is not provided in the request body, return a 400 status with an error message
        if (!name || !price || !description || !image) {
            return res.status(400).json({ error: "All fields are required: name, price, description, and image must be provided." });
        }
        // Price Logic Validation
        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice <= 0) {
            return res.status(400).json({ error: "Product price must be a valid number greater than zero" });
        }

        // Product Image Reference Validation
        if (typeof image !== 'string' || image.trim() === '') {
            return res.status(400).json({ error: "Product image must be a valid non-empty string path" });
        }
        // use the ProductModel to create a new product and add it to the restaurant's menu
        const newProduct = ProductModel.create(id, { name, price, description, image });
        // if the restaurant is not found, the model will return null
        if (!newProduct) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        // set the Location header to the URL of the newly created product
        res.location(`/api/restaurants/${id}/products/${newProduct.id}`);
        // return a 201 status to indicate that the product was created successfully
        res.status(201).send();
    }

    // update an existing product
    static async updateProduct(req, res) {
        // extract the restaurant id and product id from the request parameters, and the updated product data from the request body
        const { id, pld } = req.params;
        const { name, price, description, image } = req.body;
        // If an update for price is requested, enforce it is a positive number greater than zero
        if (price !== undefined) {
            const numPrice = parseFloat(price);
            if (isNaN(numPrice) || numPrice <= 0) {
                return res.status(400).json({ error: "Updated product price must be a valid number greater than zero" });
            }
        }
        // If an update for image is requested, enforce it is a non-empty string reference path
        if (image !== undefined) {
            if (typeof image !== 'string' || image.trim() === '') {
                return res.status(400).json({ error: "Updated product image must be a valid non-empty string path" });
            }
        }
        // use the ProductModel to update the product with the given restaurant id and product id
        const updatedProduct = ProductModel.update(id, pld, { name, price, description, image });
        
        // if the product or restaurant is not found, the model will return null
        if (!updatedProduct) {
            return res.status(404).json({ error: "Product or Restaurant not found" });
        }
        // if the update is successful, return a 204 status to indicate that the product was updated successfully
        res.status(204).send();
    }

    // delete a product from the menu
    static async deleteProduct(req, res) {
        // extract the restaurant id and product id from the request parameters
        const { id, pld } = req.params;
        
        // use the ProductModel to delete the product with the given restaurant id and product id, and store the result in isDeleted
        const isDeleted = ProductModel.delete(id, pld);
        
        // if the product or restaurant is not found, the model will return false
        if (!isDeleted) {
            return res.status(404).json({ error: "Product or Restaurant not found" });
        }
        
        // if the deletion is successful, return a 204 status to indicate that the product was deleted successfully
        res.status(204).send();
    }
}
//export the ProductController class so it can be used in other parts of the application
export default ProductController;