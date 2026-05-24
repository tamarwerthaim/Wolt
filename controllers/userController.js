import * as userModel from '../models/userModel.js';

// Handle user sign-up registration
export const registerUser = (req, res) => {
    const { username, password, name, phone, address } = req.body;

    // Reject request if any required registration field is missing
    if (!username || !password || !name || !phone || !address) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Enforce username uniqueness constraint
    const existingUser = userModel.findUserByUsername(username);
    if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
    }

    // Construct the standard user object layout
    const newUser = {
        id: Date.now().toString(),
        username,
        password,
        name,
        phone,
        address
    };

    userModel.saveUser(newUser);
    return res.status(201).json(newUser);
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