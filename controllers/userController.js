import * as userModel from '../models/userModel.js';
import { sendToCpp } from '../services/socket.js';

// Handle user sign-up registration and C++ synchronization
export const registerUser = async (req, res) => {
    const { username, password, name, phone, address } = req.body;

    // Reject request if any required registration field is missing
    if (!username || !password || !name || !phone || !address) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Call the model layer to save the user
        const newUser = userModel.saveUser({ username, password, name, phone, address });
        const { password, ...profileData } = newUser;
        return res.status(201).json(profileData);
        } catch (error) {
        // Any error thrown from the model is treated as a bad input constraint (400 Bad Request)
        return res.status(400).json({ error: "Username already taken"});
    }
};

// Handle fetching public profile information by ID
export const getUserProfile = (req, res) => {
    //take the id prom the params
    const { id } = req.params;
    const user = userModel.findUserById(id);

    // Fail if user record does not exist
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    // Exclude password from the API response payload for basic safety
    const { password, ...profileData } = user;
    return res.status(200).json(profileData);
};