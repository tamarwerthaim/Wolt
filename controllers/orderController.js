import { sendToCpp } from '../services/socket.js'; 
import orderModel from '../models/orderModel.js';

class OrderController {

    // GET /api/orders - Returns the list of orders for the logged in user.
    static async getAllOrders(req, res) {
        try {
            // get user ID from request headers
            const userId = req.headers['user-id'] || req.headers['authorization'];

            // validate that user ID is provided
            if (!userId) {
                return res.status(400).json({ error: 'User ID header is required' });
            }

            // get all orders from the model and filter them by user ID
            const allOrders = orderModel.findAll();
            const userOrders = allOrders.filter(order => order.userId === userId);

            return res.status(200).json(userOrders);

        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // GET /api/orders/:id - Gives the order details
    static async getOrderById(req, res) {
        try {
            // extract the order ID from the request parameters
            const { id } = req.params;
            
            // use the orderModel to find the order by its ID 
            // findById should return the order object if found, or null if not found
            const order = orderModel.findById(id);

            // if the order is not found, return a 404 status with an error message
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }

            return res.status(200).json(order);

        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // 3. POST /api/orders - Creates a new order.
    static async createOrder(req, res) {
        try {
            // get user ID from request headers and product ID from request body
            const userId = req.headers['user-id'] || req.headers['authorization'];
            // extract restaurantId and items from the request body, which are required to create a new order
            const { restaurantId, items } = req.body;

            // validate that user ID, restaurant ID, and items array are provided in the request
            if (!userId) {
                return res.status(400).json({ error: 'User ID header is required' });
            }
            if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: 'Restaurant ID and a non-empty items array are required' });
            }

            for (const item of items) {
                // command format to send to C++ server for adding an order to existing user
                const cppCommand = `PATCH ${userId} ${item.productId}\n`;
                // send the command to the C++ server in socket and wait for the response
                const cppResponse = await sendToCpp(cppCommand);

                // if the user didnt exist
                if (cppResponse.includes("404 Not Found")) {
                    return res.status(404).json({ error: "User not found" });
                }
            }

            // create a new order using the orderModel's create function
            const newOrder = orderModel.create({ userId, restaurantId, items });

            return res.status(201).json(newOrder);

        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // 4. PATCH /api/orders/:id - Updating the private invitation
    static async updateOrder(req, res) {
        try {
            // extract the order ID from the request parameters
            const { id } = req.params;
            
            // use the orderModel to update the order with the given ID using the data from the request body
            const updatedOrder = orderModel.update(id, req.body);

            // if the order is not found, return a 404 status with an error message
            if (!updatedOrder) {
                return res.status(404).json({ error: 'Order not found' });
            }

            return res.status(204).send();

        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // 5. DELETE /api/orders/:id - Deleting an order.
    static async deleteOrder(req, res) {
        try {
            // extract the order ID from the request parameters
            const { id } = req.params;
            
            // call the delete function of the orderModel 
            const wasDeleted = orderModel.delete(id);

            // if the order was not found and therefore not deleted, return a 404 status with an error message
            if (!wasDeleted) {
                return res.status(404).json({ error: 'Order not found' });
            }

            return res.status(204).send();

        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

// export the OrderController class so it can be used in other parts of the application, such as in route handlers
export default OrderController;