import { IdGenerator } from '../tools.js';

//for storing orders in memory
let orders = [];

class OrderModel {
    // pull all orders
    static findAll() {
        return orders;
    }

    // pull a specific order by its ID
    static findById(id) {
        return orders.find(o => o.id === id);
    }

    // create a new order
    static create(orderData) {
        // create a new order object with a unique id and the provided data
        const newOrder = {
            id: IdGenerator(),
            userId: orderData.userId,
            restaurantId: orderData.restaurantId,
            items: orderData.items, // array of { productId, quantity }
            status: 'pending', // initial status of the order
            createdAt: new Date().toISOString() //timestamp of when the order was created
        };
        // add the new order to the in-memory array
        orders.push(newOrder);
        return newOrder;
    }

    // update an existing order
    static update(id, updatedData) {
        // find the order by id
        const order = this.findById(id);
        if (!order) return null; // if the order doesn't exist, return null

        // update the order's fields only if they are provided in the updatedData
        if (updatedData.status) order.status = updatedData.status;
        if (updatedData.items) order.items = updatedData.items;

        return order;
    }

    // delete an order by id
    static delete(id) {
        // store the initial length of the orders array
        const initialLength = orders.length;
        // filter out the order with the given id
        orders = orders.filter(o => o.id !== id);
        
        // return true if an order was deleted, otherwise return false
        return orders.length !== initialLength;
    }
}

export default OrderModel;