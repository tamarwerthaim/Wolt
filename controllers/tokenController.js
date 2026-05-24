import * as userModel from '../models/userModel.js';

// Authenticate user credentials and return their unique ID
export const loginUser = (req, res) => {
    const { username, password } = req.body;

    // Validate that both fields are provided in the request body
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    // Query the model layer to look up the user by username
    const user = userModel.findUserByUsername(username);

    // Verify user existence and validate the password match
    if (!user || user.password !== password) {
        return res.status(400).json({ error: "Invalid username or password" });
    }

    // Return the user ID upon successful authentication
    return res.status(200).json({ id: user.id });
};