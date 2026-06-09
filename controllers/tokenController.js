import jwt from 'jsonwebtoken';
import * as tokenModel from '../models/tokenModel.js';

// Secret master key used by the server to sign and verify authentication tokens
const JWT_SECRET = 'tamar_roni_moriya';

// Handle user authentication login verification
export const loginUser = (req, res) => {
    const { username, password } = req.body;

    // Validate that both required fields are present in the request body
    if (!username || !password) {
        return res.status(401).json({ error: "Unauthorized: Username and password are required" });
    }

    // Delegate the verification and data access to the model layer
    const matchedUser = tokenModel.verifyLogin(username, password);

    // If login verification fails, return error status
    if (!matchedUser) {
        return res.status(401).json({ error: "Unauthorized: Invalid username or password" });
    }

    // Generate a secure signed JWT token with user information and if admin
    const token = jwt.sign(
        { 
            id: matchedUser.id, 
            username: matchedUser.username, 
            isAdmin: matchedUser.isAdmin
        },
        JWT_SECRET,
        // Set token expiration time
        { expiresIn: '48h' }
    );

    // Return the generated JWT token upon successful match
    return res.status(200).json({ token });
};