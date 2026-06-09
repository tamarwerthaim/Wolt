import jwt from 'jsonwebtoken';

// Secret master key used by the server to sign and verify authentication tokens
const JWT_SECRET = 'tamar_roni_moriya';

// Middleware function to verify JWT token and authenticate user
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Extract token from "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    // If no token is provided, block the request
    if (!token) {
        return res.status(401).json({ error: "Unauthorized: Missing authentication token" });
    }

    // Verify the token using the secret key
    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
        if (err) {
            // If the token is invalid or expired, block the request
            return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
        }
        // Attach user information to the request and proceed to the controller
        req.user = decodedUser;
        next();
    });
}

// Middleware function to verify JWT token and authenticate user with admin privileges
export const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
        // Block if token is invalid, or if the user is verified but NOT an admin
        if (err || !decodedUser.isAdmin) {
            return res.status(403).json({ error: "Forbidden: Admin access required" });
        }

        req.user = decodedUser;
        next();
    });
};