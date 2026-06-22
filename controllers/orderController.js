import { sendToCpp } from '../socket.js';
import orderModel from '../models/orderModel.js';
import * as userModel from '../models/userModel.js';
import { getIntId } from '../idMapper.js';

/* Controller handling order management and synchronization with the C++ recommendation engine */
class OrderController {

    /* GET /api/orders - Get all past orders for the logged-in user */
    static async getAllOrders(req, res) {
        try {
            /* Grab the user ID attached by the auth token middleware */
            const userId = req.user.id;

            /* Pull all orders and filter them down to this specific user */
            const allOrders = orderModel.findAll();
            const userOrders = allOrders.filter(order => order.userId === userId);

            return res.status(200).json(userOrders);

        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    /* GET /api/orders/:id - Get details for a specific single order */
    static async getOrderById(req, res) {
        try {
            const { id } = req.params;
            const order = orderModel.findById(id);

            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }

            return res.status(200).json(order);

        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    /* POST /api/orders - Create a brand new order */
    static async createOrder(req, res) {
        try {
            const userId = req.user.id;
            const { restaurantId, items } = req.body;

            /* Quick validation to make sure we have a restaurant and a proper items array list */
            if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: 'Restaurant ID and a non-empty items array are required' });
            }

            const user = await userModel.findUserById(userId);
            /* If the user is missing from memory (e.g. server restarted), ask them to log in again */
            if (!user) {
                return res.status(401).json({ error: "Session expired. Please log in again." });
            }

            /* Update the C++ recommendation engine asynchronously in the background */
            (async () => {
                for (const item of items) {
                    const intUserId = getIntId(userId);
                    const intProductId = getIntId(item.productId);
                    let commandType = !user.isSyncedWithCpp ? 'POST' : 'PATCH';
                    let cppCommand = `${commandType} ${intUserId} ${intProductId}`;

                    try {
                        let cppResponse = await sendToCpp(cppCommand);

                        /* If a POST request fails with 404, fall back to a PATCH update command */
                        if (commandType === 'POST' && cppResponse.includes("404 Not Found")) {
                            commandType = 'PATCH';
                            cppCommand = `${commandType} ${intUserId} ${intProductId}`;
                            cppResponse = await sendToCpp(cppCommand);
                        }

                        if (cppResponse.includes("201 Created") || cppResponse.includes("204 No Content")) {
                            user.isSyncedWithCpp = true;
                        }
                    } catch (cppError) {
                        /* C++ sync is non-critical, so we safely silence errors here */
                    }
                }
            })().catch(err => {
                /* Silence background loop errors safely */
            });

            /* Save the new order data to our model store */
            const newOrder = orderModel.create({ userId, restaurantId, items });

            return res.status(201).json(newOrder);

        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    /* PATCH /api/orders/:id - Update order cart items fields */
    static async updateOrder(req, res) {
        try {
            const { id } = req.params;
            const updatedOrder = orderModel.update(id, req.body);

            if (!updatedOrder) {
                return res.status(404).json({ error: 'Order not found' });
            }

            const userId = updatedOrder.userId;
            const user = await userModel.findUserById(userId);

            /* If the update request contains items, sync the new data with the C++ server */
            if (req.body.items && Array.isArray(req.body.items) && req.body.items.length > 0) {

                if (!user) {
                    return res.status(404).json({ error: "User not found" });
                }

                /* Run C++ updates in the background without blocking the client's HTTP response cycle */
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
                            }
                        } catch (cppError) {
                            /* Silence background sync faults safely */
                        }
                    }
                })().catch(err => {
                    /* Silence non-critical background errors */
                });
            }

            /* Send back a clean 204 No Content status on a successful update patch */
            return res.status(204).send();

        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    /* DELETE /api/orders/:id - Cancel and delete a specific order record */
    static async deleteOrder(req, res) {
        try {
            const { id } = req.params;
            const wasDeleted = orderModel.delete(id);

            if (!wasDeleted) {
                return res.status(404).json({ error: 'Order not found' });
            }

            return res.status(204).send();

        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default OrderController;