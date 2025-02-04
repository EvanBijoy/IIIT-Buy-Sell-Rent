import express from 'express';
import User from '../models/user.model.js';
import Item from '../models/item.model.js';
import Order from '../models/order.model.js';
import bcrypt from 'bcrypt';
import { authMiddleware } from '../middleware/authMiddleware.js';

const SALT_ROUNDS = 10;

const router = express.Router();

//........................PRIVATE ROUTES.............................

//..........................add order................................
router.post('/add', authMiddleware.verifyToken, async (req, res) => {
    const { buyerId, totalAmount } = req.body;

    // Check if the buyer exists in the database
    const buyer = await User.findById(buyerId);
    if(!buyer) {
        return res.status(404).json({ 
            message: 'Buyer not found in database' 
        });
    }

    // Collect all items in the buyer's cart
    const items = buyer.cartItems;

    // Variable to store the sum of all items
    var sum = 0;

    // Check if the items exist in the database and are available then calculate the sum
    for(const item of items) {
        const itemExists = await Item.findById(item.itemId);
        
        if(!itemExists) {
            return res.status(404).json({ 
                message: 'Item not found in database' 
            });
        }

        if(!itemExists.available) {
            return res.status(400).json({ 
                message: 'Item not available' 
            });
        }
        
        itemExists.available = false;
        sum = sum + itemExists.price;
    }

    // Check if the total amount matches the sum of all items
    if(sum !== totalAmount) {
        return res.status(400).json({ 
            message: 'Total amount does not match the sum of items' 
        });
    }

    try {
        // Generate OTP for the order
        const otp = "" + Math.floor(1000 + Math.random() * 9000);
        const hashedOTP = await bcrypt.hash(otp, SALT_ROUNDS);

        // Create an order for each item in the cart
        var itemIds = [];

        for (const itemId of items) {
            const item = await Item.findById(itemId.itemId);

            const newOrder = new Order({
                transactionId: Math.random().toString(36).substr(2, 9),
                buyerId: buyerId,
                sellerId: item.sellerId,
                itemId: itemId.itemId,
                amount: item.price,
                hashedOTP
            });

            await newOrder.save();

            itemIds.push(newOrder.itemId);
            
            item.available = false;
            item.save();
        }

        // Clear the buyer's cart
        buyer.cartItems = [];
        await buyer.save();

        res.status(200).json({ 
            message: 'Order added successfully',
            itemIds: itemIds,
            otp: otp
        }); // Send the OTP back to the client
    } 
    
    catch (error) {
        res.status(500).json({ 
            message: 'Error adding order', error: error.message 
        });
    }
});

//............................get all history.........................
router.get('/history/:id', authMiddleware.verifyToken, async (req, res) => {
    const userId = req.params.id;

    try {
        // Check if the user exists in the database
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({ 
                message: 'User not found in database' 
            });
        }

        // Fetch all orders for the user including the ones they bought and sold
        const orders = await Order.find({
            $or: [{ buyerId: userId }, { sellerId: userId }]
        });

        // Fetch item details for each order
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const item = await Item.findById(order.itemId);
            const seller = await User.findById(order.sellerId);
            const buyer = await User.findById(order.buyerId);
            
            if (!item || !seller) {
                console.error(`Item or seller not found for order ${order._id}`);
                return null;
            }
            
            return {
                _id: order._id,
                itemId: order.itemId,
                buyerId: order.buyerId,
                sellerId: order.sellerId,
                delivered: order.isDelivered,
                item: {
                    name: item.name,
                    price: item.price,
                    description: item.description,
                    image: item.image,
                    category: item.category,
                    available: item.available,
                    sellerName: seller.firstName + ' ' + seller.lastName,
                    buyerName: buyer.firstName + ' ' + buyer.lastName
                }
            };
        }));

        res.status(200).json({ 
            message: 'History fetched successfully',
            orders: ordersWithItems
        }); // Send the orders back to the client
    }
    
    catch (error) {
        res.status(500).json({ 
            message: 'Error fetching history',
            error: error.message 
        });
    }
});

//...........................verify otp...............................
router.post('/verify', authMiddleware.verifyToken, async (req, res) => {
    const { orderId, otp } = req.body;

    // Check if the order exists in the database
    const order = await Order.findById(orderId);
    if(!order) {
        return res.status(404).json({ 
            message: 'Order not found in database' 
        });
    }

    // Compare the OTP entered by the user with the hashed OTP stored in the database
    const isMatch = await bcrypt.compare(otp, order.hashedOTP);

    if(isMatch) {
        order.isDelivered = true;
        await order.save();
        res.status(200).json({ 
            message: 'OTP verified successfully' 
        }); // Send the success message back to the client
    }
    else {
        res.status(400).json({ 
            message: 'Incorrect OTP' 
        }); // Send the error message back to the client
    }
});

export default router;