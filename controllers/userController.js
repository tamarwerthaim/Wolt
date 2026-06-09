import * as userModel from '../models/userModel.js';

// Handle user sign-up registration and C++ synchronization
export const registerUser = async (req, res) => {
    const { username, password, displayName, phone, address } = req.body;
    const profileImage = req.file;

    // Reject request if any required registration field is missing
    if (!username || !password || !displayName || !phone || !address || !profileImage) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Check password length
    if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    // Check password contains letters and numbers
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasLetter || !hasNumber) { //if password does not contain letters and numbers:
        return res.status(400).json({ error: "Password must contain a combination of letters and numbers" });
    }

    // Check phone number format
    const phoneRegex = /^05\d{8}$/; // Matches exactly 10 digits starting with '05'
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: "Invalid phone number. Must be a valid 10-digit number" });
    }

    try {
        // Call the model layer to save the user
        const newUser = userModel.saveUser({
            username,
            password,
            name: displayName,
            phone,
            address,
            profileImage: profileImage.path
        });
        const { password: savedPassword, ...profileData } = newUser;
        return res.status(201).json(profileData);
    } catch (error) {
        // Any error thrown from the model is treated as a bad input constraint (400 Bad Request)
        if (error.message === "Username already taken") {
            return res.status(400).json({ error: "Username already taken" });
        }
        // For any other unexpected error, return a 500 Internal Server Error response
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Handle fetching public profile information by ID
export const getUserProfile = (req, res) => {
    try {
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
    } catch (error) {
        // For any unexpected error, return a 500 Internal Server Error response
        return res.status(500).json({ error: "Internal server error" });
    }
};