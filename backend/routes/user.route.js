import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Item from '../models/item.model.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { verifyCaptcha } from '../middleware/recaptchaMiddleware.js';
import xml2js from 'xml2js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

const router = express.Router();



// ---------------------------------PUBLIC ROUTES--------------------------------

// ---------------------------------cas-auth-------------------------------------
router.get('/cas-auth', async (req, res) => {
  const { ticket } = req.query;
  try {
    // Get CAS response
    const casResponse = await fetch(`https://login.iiit.ac.in/cas/serviceValidate?ticket=${ticket}&service=http://localhost:5173/cas`);
    
    // Parse CAS response
    const casResponseText = await casResponse.text();
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(casResponseText);
    
    // Extract email from CAS response
    const casUser = result['cas:serviceResponse']['cas:authenticationSuccess'];
    const email = casUser['cas:user'];

    res.status(200).json({ 
        success: true, 
        email: email
    }); // Respond with the email
  }

  catch (error) {
    console.error('CAS Authentication failed:', error);
    res.redirect(`http://localhost:5173/register?error=Authentication failed`);
  }
});

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, age, contactNumber, password } = req.body;
  
    try {
        // Validate required fields
        if (!firstName || !lastName || !email || !age || !contactNumber || !password) {
        return res.status(400).json({ 
            message: 'All fields are required'
        });
        }

        // Validate IIIT email
        if (!email.endsWith('iiit.ac.in')) {
        return res.status(400).json({ 
            message: 'Only IIIT email addresses are allowed' 
        });
        }

        // Check existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
        return res.status(400).json({ 
            message: 'User already exists'
        });
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = new User({
        firstName,
        lastName,
        email,
        age,
        contactNumber,
        password: hashedPassword,
        cartItems: [],
        sellerReviews: []
        });

        await newUser.save();

        // Generate tokens
        const accessToken = jwt.sign(
        { userId: newUser._id, email: newUser.email }, 
        process.env.JWT_SECRET
        );

        res.status(201).json({
        message: 'User registered successfully',
        accessToken,
        user: {
            id: newUser._id,
            token: accessToken,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            age: newUser.age,
            contactNumber: newUser.contactNumber,
            cartItems: newUser.cartItems,
            sellerReviews: newUser.sellerReviews
        }
        }); // Respond with the user details
    } 

    catch (error) {
        res.status(500).json({ 
        message: 'Error registering user',
        error: error.message 
        });
    }
});


// -------------------------------------login------------------------------------
router.post('/login', verifyCaptcha, async (req, res) => {
    const { email, password } = req.body;

    // Find user in the database
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({
            message: 'User not found' 
        });
    }

    // Check if the password is correct
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ 
            message: 'Invalid credentials' 
        });
    }

    //creating an access token
    const accessToken = jwt.sign(
        {
            userId: user._id,
            email: user.email
        }, 
        JWT_SECRET
    );

    try {
        res.status(200).json({
            message: 'User logged in successfully',
            accessToken,
            user: {
                id: user._id,
                token: accessToken,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                age: user.age,
                contactNumber: user.contactNumber,
                cartItems: user.cartItems,
                sellerReviews: user.sellerReviews
            }
        }); // Respond with the user details
    } 

    catch (error) {
        res.status(500).json({ 
            message: 'Error logging in', error: error.message 
        });
    }
});




// ---------------------------------PRIVATE ROUTES-------------------------------


// ---------------------------------profile--------------------------------------
router.get('/profile/:id', authMiddleware.verifyToken, async (req, res) => {
    const {id} = req.params;
    
    try {
        // Fetch user details from the database
        const user = await User.findById(id)
        .select('-password') // Exclude the password field from the response

        if (!user) {
            return res.status(404).json({ 
                message: 'User not found' 
            }); // Checks if the user exists in the database
        }

        res.json({ user }); // Respond with the user details
    } 

    catch (error) {
        res.status(500).json({ 
            message: 'Error fetching profile', error: error.message 
        });
    }
});


// ---------------------------------update profile-------------------------------
router.put('/update/:id', authMiddleware.verifyToken, async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, age, contactNumber } = req.body;

    try {
        // Checks if the user exists in the database
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        } 

        // Update the user details
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.age = age || user.age;
        user.contactNumber = contactNumber || user.contactNumber;
        await user.save();
        
        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                age: user.age,
                contactNumber: user.contactNumber,
                cartItems: user.cartItems,
                sellerReviews: user.sellerReviews
            }
        }); // Respond with the updated user details
    }

    catch (error) {
        res.status(500).json({
            message: 'Error updating profile',
            error: error.message
        });
    }
});


// ---------------------------------change password-------------------------------
router.put('/changepassword/:id', authMiddleware.verifyToken, async (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    try {
        // Checks if the user exists in the database
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Checks if the current password is correct
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: 'Invalid credentials'
            }); 
        }

        // Hash the new password and update it
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        user.password = hashedPassword;
        await user.save();

        res.json({
            message: 'Password changed successfully'
        }); // Respond with a success message
    }

    catch (error) {
        res.status(500).json({
            message: 'Error changing password',
            error: error.message
        });
    }
});


// -----------------------------fetch items in cart---------------------------------
router.get('/cart/:id', authMiddleware.verifyToken, async (req, res) => {
    const { id } = req.params;
    
    try {
        // Checks if the user exists in the database
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        // Populate the `cartItems` with product details
        await user.populate('cartItems.itemId');

        // Transform `cartItems` into an array of `Item` objects
        const items = user.cartItems.map((cartItem) => ({
            _id: cartItem.itemId._id,
            name: cartItem.itemId.name,
            price: cartItem.itemId.price,
            description: cartItem.itemId.description,
            image: cartItem.itemId.image,
            category: cartItem.itemId.category,
            sellerId: cartItem.itemId.sellerId,
            available: cartItem.itemId.available
        }));

        res.json({
            message: "Items fetched successfully",
            items
        }); // Respond with the items in the cart
    } 
    
    catch (error) {
        res.status(500).json({ 
            message: 'Error fetching cart items', 
            error: error.message 
        });
    }
});


// -------------------------------add to cart--------------------------------------
router.post('/addcart', authMiddleware.verifyToken, async (req, res) => {
    const { userId, itemId } = req.body;
    
    try {
        // Checks if the user exists in the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        // Checks if the item exists in the database
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({
                message: 'Item not found' 
            });
        }

        // Checks if the item is already in the cart
        const itemIndex = user.cartItems.findIndex((cartItem) => cartItem.itemId.equals(itemId));
        if (itemIndex !== -1) {
            return res.status(400).json({
                message: 'Item already in cart' 
            });
        }

        // Checks if the user is trying to add their own item to the cart
        if(item.sellerId.equals(userId)) {
            return res.status(400).json({ 
                message: 'Cannot add your own item to cart' 
            });
        }

        // Add the item to the cart and save the user
        user.cartItems.push({ itemId });
        await user.save();

        res.json({ 
            message: 'Item added to cart successfully' 
        }); // Respond with a success message
    }

    catch (error) {
        res.status(500).json({ 
            message: 'Error adding item to cart', error: error.message 
        });
    }
});


// -------------------------------remove from cart---------------------------------
router.delete('/remcart', authMiddleware.verifyToken, async (req, res) => {
    const { userId, itemId } = req.body;
    
    try {
        // Checks if the user exists in the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        // Checks if the item exists in the database
        const itemIndex = user.cartItems.findIndex((cartItem) => cartItem.itemId.equals(itemId));
        if (itemIndex === -1) {
            return res.status(404).json({ 
                message: 'Item not found in cart' 
            });
        }

        // Remove the item from the cart and save the user
        user.cartItems.splice(itemIndex, 1);
        await user.save();

        res.json({ 
            message: 'Item removed from cart successfully'
        }); // Respond with a success message
    }
    
    catch (error) {
        res.status(500).json({ 
            message: 'Error removing item from cart', error: error.message 
        });
    }
});


// ------------------------------add reviews-------------------------------------
router.post('/addreview', authMiddleware.verifyToken, async (req, res) => {
    const { userId, sellerId, rating, comment } = req.body;
    
    try {
        // Checks if the user exists in the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        // Checks if the seller exists in the database
        const seller = await User.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ 
                message: 'Seller not found' 
            });
        }

        // Checks if the user is trying to review their own profile
        if (seller._id.equals(userId)) {
            return res.status(400).json({ 
                message: 'Cannot review your own profile' 
            });
        }

        // Create a new review object
        const review = {
            reviewerId: userId,
            rating,
            comment
        };

        // Add the review to the seller's profile and save the seller
        seller.sellerReviews.push(review);
        await seller.save();

        res.json({ 
            message: 'Review added successfully' 
        }); // Respond with a success message
    }
    
    catch (error) {
        res.status(500).json({ 
            message: 'Error adding review', error: error.message 
        });
    }
});

export default router;