import { sendToCpp } from '../services/socket.js';

// array to hold orders in memory 
let orders = [];


// POST /api/orders - Creates a new order.
export async function createOrder(req, res) {
    try {
        // get user ID from request headers and product ID from request body
        const userId = req.headers['user-id'] || req.headers['authorization'];
        const { productId } = req.body;

        // validate that both user ID and product ID are provided
        if (!userId || !productId) {
            return res.status(400).json({ error: 'User ID and Product ID are required' });
        }

        // command format to send to C++ server for adding an order to existing user
        const cppCommand = `PATCH ${userId} ${productId}\n`;

        // send the command to the C++ server in socket and wait for the response
        const cppResponse = await sendToCpp(cppCommand);

        // if the user didnt exist
        if (cppResponse.includes("404 Not Found")) {
            return res.status(404).json({ error: "User not found" });
        }

        // create a new order object and add it to the in-memory orders array
        const newOrder = {
            id: Date.now().toString(),
            userId: userId,
            productId: productId,
            createdAt: new Date()
        };
        orders.push(newOrder);

        // return the newly created order with status 201
        return res.status(201).json(newOrder);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}


//GET /api/orders - Returns the list of orders for the logged in user.
export async function getOrders(req, res) {
    try {
        // get user ID from request headers
        const userId = req.headers['user-id'] || req.headers['authorization'];

        // validate that user ID is provided
        if (!userId) {
            return res.status(400).json({ error: 'User ID header is required' });
        }

        // filter the in-memory orders array to return only orders that belong to the logged in user
        const userOrders = orders.filter(order => order.userId === userId);
        return res.status(200).json(userOrders);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}


// GET /api/orders/:id - Gives the order details
export async function getOrderById(req, res) {
    try {
        // get the order ID from the request URL parameters
        const { id } = req.params;
        // find the order in the in-memory orders array by its ID
        const order = orders.find(o => o.id === id);

        // if the order is not found, return a 404 error
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // if the order is found, return it with status 200
        return res.status(200).json(order);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}


 // PATCH /api/orders/:id - Updating the private invitation
export async function updateOrder(req, res) {
    try {
        // get the order ID from the request URL parameters
        const { id } = req.params;
        // find the index of the order in the in-memory orders array by its ID
        const orderIndex = orders.findIndex(o => o.id === id);

        // if the order is not found, return a 404 error
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }

        /* update the order object with the new data from the request body
        * ...orders[orderIndex] creates a copy of the existing order object
        * ...req.body creates a copy of the new data from the request body 
        * and overwrites any existing fields in the order object with the new values
        */
        orders[orderIndex] = { ...orders[orderIndex], ...req.body };

        // return the updated order with status 204
        return res.status(204).send();

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// DELETE /api/orders/:id - Deleting an order
export async function deleteOrder(req, res) {
    try {
        // get the order ID from the request URL parameters
        const { id } = req.params;
        // find the index of the order in the in-memory orders array by its ID
        const orderIndex = orders.findIndex(o => o.id === id);

        // if the order is not found, return a 404 error
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // remove 1 element from the orders array at the index of the order to be deleted
        orders.splice(orderIndex, 1);

        // return a 204 status with no content to indicate successful deletion
        return res.status(204).send();

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}