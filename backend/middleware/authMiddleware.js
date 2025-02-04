import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authMiddleware = {
    // Middleware to verify the token
    verifyToken: (req, res, next) => {
        try {
            // Get token from the header
            const token = req.header('token');
            
            // If token is not provided return error
            if (!token) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            // Verify the token
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next(); // If token is valid, call the next middleware
        } 
        
        catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Invalid token' });
        }
    }
};