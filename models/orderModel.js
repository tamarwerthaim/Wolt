import { v4 as uuidv4 } from 'uuid';

/* In-memory array store for keeping track of all orders */
let orders = [];

class OrderModel {

    /* Get the full list of all orders */
    static findAll() {
        return orders;
    }

    /* Find a single order matching a specific ID */
    static findById(id) {
        return orders.find(o => o.id === id);
    }

    /* Create and save a new order record with a unique UUID and an ISO timestamp */
    static create(orderData) {
        const newOrder = {
            id: uuidv4(),
            userId: orderData.userId,
            restaurantId: orderData.restaurantId,
            items: orderData.items, /* Expected schema array of { productId, quantity } */
            createdAt: new Date().toISOString()
        };
        orders.push(newOrder);
        return newOrder;
    }

    /* Update item rows for an existing order if it exists */
    static update(id, updatedData) {
        const order = this.findById(id);
        if (!order) return null;

        if (updatedData.items) order.items = updatedData.items;

        return order;
    }

    /* Delete an order by removing it from our array store */
    static delete(id) {
        const initialLength = orders.length;
        orders = orders.filter(o => o.id !== id);

        /* Returns true if the record was successfully found and deleted */
        return orders.length !== initialLength;
    }
}

export default OrderModel;