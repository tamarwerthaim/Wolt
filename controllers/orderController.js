import { sendToCpp } from '../socket.js'; 
import orderModel from '../models/orderModel.js';
import * as userModel from '../models/userModel.js';
import { getIntId } from '../idMapper.js';

class OrderController {

    // GET /api/orders - Returns the list of orders for the logged in user.
    static async getAllOrders(req, res) {
        try {
            // Extract verified user ID attached to the request object by the authenticateToken middleware
            const userId = req.user.id;

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
            // Extract verified user ID from the request object populated by the JWT middleware
            const userId = req.user.id;
            // extract restaurantId and items from the request body, which are required to create a new order
            const { restaurantId, items } = req.body;

            if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: 'Restaurant ID and a non-empty items array are required' });
            }
            const user = userModel.findUserById(userId);
            // If user not found in memory (e.g., server restarted and in-memory data was cleared),
            // return 401 so the client knows to log in again with a fresh session
            if (!user) {
                return res.status(401).json({ error: "Session expired. Please log in again." });
            }

            // update the C++ recommendation system in the background asynchronously
            (async () => {
                for (const item of items) {
                    const intUserId = getIntId(userId);
                    const intProductId = getIntId(item.productId);
                    let commandType = !user.isSyncedWithCpp ? 'POST' : 'PATCH';
                    let cppCommand = `${commandType} ${intUserId} ${intProductId}`;

                    try {
                        let cppResponse = await sendToCpp(cppCommand);

                        if (commandType === 'POST' && cppResponse.includes("404 Not Found")) {
                            commandType = 'PATCH';
                            cppCommand = `${commandType} ${intUserId} ${intProductId}`;
                            cppResponse = await sendToCpp(cppCommand);
                        }

                        if (cppResponse.includes("201 Created") || cppResponse.includes("204 No Content")) {
                            user.isSyncedWithCpp = true; 
                            console.log(`[C++] Sync Success: User ${intUserId} -> Product ${intProductId} (${cppResponse})`);
                        } else {
                            console.log(`[C++] Sync Response: ${cppResponse}`);
                        }
                    } catch (cppError) {
                        console.error('C++ server communication error (non-critical):', cppError.message);
                    }
                }
            })().catch(err => console.error("Error in background C++ sync:", err));

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

            // extract the userId from the order that returned
            const userId = updatedOrder.userId;
        
            // find the user by the extracted userId to check if they are synced with the C++ server
            const user = userModel.findUserById(userId);

            // if the request body contains an items array, we need to send the appropriate commands to the C++ server to update the user's interactions
            if (req.body.items && Array.isArray(req.body.items) && req.body.items.length > 0) {
            
                if (!user) {
                    return res.status(404).json({ error: "User not found" });
                }

                // update the C++ recommendation system in the background asynchronously
                (async () => {
                    for (const item of req.body.items) {
                        const intUserId = getIntId(userId);
                        const intProductId = getIntId(item.productId);
                        const commandType = !user.isSyncedWithCpp ? 'POST' : 'PATCH';
                        const cppCommand = `${commandType} ${intUserId} ${intProductId}`;
                    
                        try {
                            const cppResponse = await sendToCpp(cppCommand);

                            if (cppResponse.includes("201 Created") || cppResponse.includes("204 No Content")) {
                                user.isSyncedWithCpp = true; 
                                console.log(`[C++] Sync Success (Update Order): User ${intUserId} -> Product ${intProductId} (${cppResponse})`);
                            } else {
                                console.log(`[C++] Sync Response (Update Order): ${cppResponse}`);
                            }
                        } catch (cppError) {
                            console.error('C++ server communication error (non-critical):', cppError.message);
                        }
                    }
                })().catch(err => console.error("Error in background C++ sync:", err));
            }   

            // return the updated order in the response with a 204 status code
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