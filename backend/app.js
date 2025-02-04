import express from 'express';
import https from 'https'; 
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/user.route.js';
import orderRoutes from './routes/order.route.js';
import itemRoutes from './routes/item.route.js';
import { sslConfig } from './middleware/casMiddleware.js';

dotenv.config();

// Creating an express app
const app = express();

// Creating an HTTPS server
const server = https.createServer(sslConfig, app);

// Using cors to allow cross-origin requests
app.use(cors());

app.use(express.json());

// Using the userRoutes
app.use('/api/user', userRoutes);

// Using the orderRoutes
app.use('/api/order', orderRoutes);

// Using the itemRoutes
app.use('/api/item', itemRoutes);

server.listen(5000, () => {
    // Connecting to the database
    connectDB();
    console.log('Server is running on https://localhost:5000');
});