import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

/* Define Mongoose Order Schema (Task 2.4.1) */
const OrderItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },
    name: { type: String, required: true }
});

const OrderSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => uuidv4()
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    restaurantId: {
        type: String,
        required: true
    },
    items: {
        type: [OrderItemSchema],
        required: true
    },
    total: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        required: true,
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Order = mongoose.model('Order', OrderSchema);

/* Temporary in-memory array store to keep application functioning before Task 2.4.2 */
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

    /* Create and save a new order record in memory */
    static create(orderData) {
        const items = orderData.items || [];
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const newOrder = {
            id: uuidv4(),
            userId: orderData.userId,
            restaurantId: orderData.restaurantId,
            items: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                name: item.name
            })),
            total: total,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        orders.push(newOrder);
        return newOrder;
    }

    /* Update item rows for an existing order if it exists */
    static update(id, updatedData) {
        const order = this.findById(id);
        if (!order) return null;

        if (updatedData.items) {
            order.items = updatedData.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                name: item.name
            }));
            order.total = updatedData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }

        if (updatedData.status !== undefined) {
            order.status = updatedData.status;
        }

        return order;
    }

    /* Delete an order from memory */
    static delete(id) {
        const initialLength = orders.length;
        orders = orders.filter(o => o.id !== id);
        return orders.length !== initialLength;
    }
}

export default OrderModel;