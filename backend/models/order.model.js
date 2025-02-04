import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    hashedOTP: {
        type: String,
        required: true
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false
    }
});

const Order = mongoose.model("Order", orderSchema);

export default Order;