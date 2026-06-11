import * as userModel from '../models/userModel.js';

// Handle user sign-up registration and C++ synchronization
export const registerUser = async (req, res) => {
    const { username, password, displayName, phone, lat, lng } = req.body;
    const profileImage = req.file;

    // Reject request if any required registration field is missing
    if (!username || !password || !displayName || !phone || !lat || !lng || !profileImage) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Geolocation bounds format and range check
    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);
    
    if (isNaN(numLat) || isNaN(numLng)) {
        return res.status(400).json({ error: "Latitude and Longitude must be valid numbers" });
    }
    if (numLat < -90 || numLat > 90) {
        return res.status(400).json({ error: "Latitude must be a number between -90 and 90" });
    }
    if (numLng < -180 || numLng > 180) {
        return res.status(400).json({ error: "Longitude must be a number between -180 and 180" });
    }

    // Ensure the uploaded file mimetype is strictly an image
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedMimeTypes.includes(profileImage.mimetype)) {
        return res.status(400).json({ error: "Invalid image format. Only JPG, JPEG, PNG, and WEBP are allowed" });
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
            lat,
            lng,
            profileImage: profileImage ? profileImage.filename : null
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

// Handle updating user profile details
export const updateUserProfile = async (req, res) => {
    const { id } = req.params;

    // Check if the user is updating their own profile
    if (!req.user || req.user.id !== id) {
        return res.status(403).json({ error: "Forbidden: You can only edit your own profile" });
    }

    const { displayName, phone, lat, lng, password } = req.body;
    const profileImage = req.file;

    // Validate coordinates if provided
    if (lat !== undefined && lng !== undefined) {
        const numLat = parseFloat(lat);
        const numLng = parseFloat(lng);
        if (isNaN(numLat) || isNaN(numLng)) {
            return res.status(400).json({ error: "Latitude and Longitude must be valid numbers" });
        }
        if (numLat < -90 || numLat > 90) {
            return res.status(400).json({ error: "Latitude must be a number between -90 and 90" });
        }
        if (numLng < -180 || numLng > 180) {
            return res.status(400).json({ error: "Longitude must be a number between -180 and 180" });
        }
    }

    // Validate image format if uploaded
    if (profileImage) {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedMimeTypes.includes(profileImage.mimetype)) {
            return res.status(400).json({ error: "Invalid image format. Only JPG, JPEG, PNG, and WEBP are allowed" });
        }
    }

    // Validate password if updating
    if (password) {
        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        }
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        if (!hasLetter || !hasNumber) {
            return res.status(400).json({ error: "Password must contain a combination of letters and numbers" });
        }
    }

    // Validate phone if updating
    if (phone) {
        const phoneRegex = /^05\d{8}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ error: "Invalid phone number. Must be a valid 10-digit number" });
        }
    }

    try {
        const updatedUser = userModel.updateUser(id, {
            name: displayName,
            phone,
            lat,
            lng,
            password,
            profileImage: profileImage ? profileImage.filename : undefined
        });

        const { password: savedPassword, ...profileData } = updatedUser;
        return res.status(200).json(profileData);
    } catch (error) {
        if (error.message === "User not found") {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
};