import * as tokenModel from '../models/tokenModel.js';

// Handle user authentication login verification
export const loginUser = (req, res) => {
    const { username, password } = req.body;

    // Validate that both required fields are present in the request body
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    // Delegate the verification and data access to the model layer
    const matchedUser = tokenModel.verifyLogin(username, password);

    // If login verification fails, return error status
    if (!matchedUser) {
        return res.status(400).json({ error: "Invalid username or password" });
    }

    // Return the unique user ID upon successful match
    return res.status(200).json({ id: matchedUser.id });
};