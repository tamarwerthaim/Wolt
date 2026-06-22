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

class OrderModel {

    /* Get the full list of all orders */
    static async findAll() {
        const list = await Order.find();
        return list.map(o => {
            const obj = o.toObject();
            obj.id = obj._id;
            return obj;
        });
    }

    /* Find a single order matching a specific ID */
    static async findById(id) {
        const o = await Order.findById(id);
        if (!o) return null;
        const obj = o.toObject();
        obj.id = obj._id;
        return obj;
    }

    /* Create and save a new order record into MongoDB */
    static async create(orderData) {
        const items = orderData.items || [];
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const newOrder = new Order({
            userId: orderData.userId,
            restaurantId: orderData.restaurantId,
            items: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                name: item.name
            })),
            total: total,
            status: 'pending'
        });

        await newOrder.save();
        const obj = newOrder.toObject();
        obj.id = obj._id;
        return obj;
    }

    /* Update item rows for an existing order if it exists */
    static async update(id, updatedData) {
        const order = await Order.findById(id);
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

        await order.save();
        const obj = order.toObject();
        obj.id = obj._id;
        return obj;
    }

    /* Delete an order from MongoDB */
    static async delete(id) {
        const res = await Order.deleteOne({ _id: id });
        return res.deletedCount > 0;
    }
}

export default OrderModel;