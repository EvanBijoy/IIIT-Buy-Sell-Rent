import express from 'express';
import User from '../models/user.model.js';
import Item from '../models/item.model.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

//........................PRIVATE ROUTES.............................

//..........................add item.................................
router.post('/add', authMiddleware.verifyToken, async (req, res) => {
    const { name, price, description, category, image, sellerId } = req.body;

    // Check if all fields are filled
    if (!name || !price || !description || !category || !image || !sellerId) {
        return res.status(400).json({ 
            message: 'All fields are required' 
        });
    }

    // Check if the seller exists in the database
    try {
        const seller = await User.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ 
                message: 'Seller not found in database' 
            });
        }
    }
    catch (error) {
        res.status(500).json({
            message: 'Error finding seller', error: error.message
        });
    }

    // Check if the price is a positive number
    if(price < 0) {
        return res.status(400).json({ 
            message: 'Price cannot be negative' 
        });
    }

    // Check if the description is at least 5 characters long and at most 500 characters long
    if(description.length < 5 || description.length > 500) {
        return res.status(400).json({ 
            message: 'Description not in the allowed length' 
        });
    } 

    // Check if the name is at least 3 characters long and at most 50 characters long
    if(name.length < 3 || name.length > 50) {
        return res.status(400).json({ 
            message: 'Name not in the allowed length' 
        });
    } 

    try {
        // Add the item to the database
        const newItem = new Item({
            name,
            price,
            description,
            image,
            category,
            sellerId
        });

        const item = await newItem.save();

        res.status(200).json({ 
            message: 'Item added successfully', 
            item 
        }); // Send the item back to the client
    } 
    
    catch (error) {
        res.status(500).json({ 
            message: 'Error adding item', error: error.message 
        });
    }
});

//..........................delete item.................................
router.delete('/delete/:id', authMiddleware.verifyToken, async (req, res) => {
    const { id, seller } = req.params;

    // Check if the item exists in the database
    const item = await Item.findById(id);
    if (!item) {
        return res.status(404).json({ 
            message: 'Item not found in database' 
        });
    } 

    // Check if the user is authorized to delete the item
    if(item.sellerId !== seller) {
        return res.status(401).json({ 
            message: 'Unauthorized to delete this item' 
        });
    } 

    try {
        // Delete the item from the database
        await Item.findByIdAndDelete(id);

        res.status(200).json({ 
            message: 'Item deleted successfully' 
        }); // Send a success message
    }
    
    catch (error) {
        res.status(500).json({ 
            message: 'Error deleting item', error: error.message 
        });
    }
});

//..........................fetch all items..............................
router.get('/all', authMiddleware.verifyToken, async (req, res) => {
    try {
        // Fetch all items from the database
        const items = await Item.find();
        const itemsWithSellerName = [];

        // Fetch the seller's name for each item
        for (const item of items) {
            const seller = await User.findById(item.sellerId).select('firstName lastName');
            const itemObj = item.toObject(); 
            // Concatenate the first name and last name of the seller
            itemObj.sellerName = seller ? `${seller.firstName} ${seller.lastName}` : 'Unknown Seller';
            // Add the item to the array
            itemsWithSellerName.push(itemObj);
        }

        res.status(200).json({ 
            message: 'Items fetched successfully', 
            items: itemsWithSellerName
        }); // Send the items back to the client
    }
    
    catch (error) {
        res.status(500).json({ 
            message: 'Error fetching items', error: error.message 
        });
    }
});

//..........................fetch item by id..............................
router.get('/get/:id', authMiddleware.verifyToken, async (req, res) => {
    const { id } = req.params;
    
    try {
        // Check if the user exists in the database
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found in database' 
            });
        } 

        // Fetch all items for the user
        const items = await Item.find({ sellerId: user._id });
        
        res.status(200).json({ 
            message: 'Items fetched successfully', 
            items 
        }); // Send the items back to the client
    }
    
    catch (error) {
        res.status(500).json({ 
            message: 'Error finding item', error: error.message 
        });
    }
});

//........................item fetch with reviews...........................
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        // Check if the item exists in the database
        const item = await Item.findById(id);
        if (!item) {
            return res.status(404).json({ 
                message: 'Item not found in database' 
            });
        } 

        // Check if the seller exists in the database
        const seller = await User.findById(item.sellerId);
        if (!seller) {
            return res.status(404).json({ 
                message: 'Seller not found in database' 
            });
        } 

        res.status(200).json({
            message: 'Item fetched successfully',
            item: {
                _id: item._id,
                name: item.name,
                price: item.price,
                description: item.description,
                image: item.image,
                category: item.category,
                available: item.available,
                sellerName: `${seller.firstName} ${seller.lastName}`,
                sellerReviews: seller.sellerReviews,
                sellerPhone: seller.contactNumber
            }
        }); // Send the item back to the client
    }
    
    catch (error) {
        res.status(500).json({ 
            message: 'Error finding item', error: error.message 
        });
    }
});

export default router;