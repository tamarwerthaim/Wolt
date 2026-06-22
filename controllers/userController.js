import * as userModel from '../models/userModel.js';

/* Handle new user sign-up and registration validation */
export const registerUser = async (req, res) => {
    const { username, password, displayName, phone, lat, lng, isAdmin } = req.body;
    const profileImage = req.file;

    /* Make sure all required fields are included in the form data submission */
    if (!username || !password || !displayName || !phone || !lat || !lng || !profileImage) {
        return res.status(400).json({ error: "All fields are required" });
    }

    /* Validate geolocation coordinates format and map boundaries */
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

    /* Enforce strict file type rules for the uploaded profile picture */
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedMimeTypes.includes(profileImage.mimetype)) {
        return res.status(400).json({ error: "Invalid image format. Only JPG, JPEG, PNG, and WEBP are allowed" });
    }

    /* Verify secure password complexity requirements */
    if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasLetter || !hasNumber) {
        return res.status(400).json({ error: "Password must contain a combination of letters and numbers" });
    }

    /* Check that the phone number matches standard formatting using regex */
    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: "Invalid phone number. Must be a valid 10-digit number" });
    }

    try {
        /* Save the new user record in the model database store */
        const newUser = await userModel.saveUser({
            username,
            password,
            name: displayName,
            phone,
            lat,
            lng,
            profileImage: profileImage ? profileImage.filename : null,
            isAdmin: isAdmin === 'true' || isAdmin === true
        });

        /* Exclude password from the API response payload for safety */
        const { password: savedPassword, ...profileData } = newUser;
        return res.status(201).json(profileData);
    } catch (error) {
        if (error.message === "Username already taken") {
            return res.status(400).json({ error: "Username already taken" });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
};

/* Handle fetching public profile information by account ID */
export const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findUserById(id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        /* Exclude password string from the returned data payload */
        const { password, ...profileData } = user;
        return res.status(200).json(profileData);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

/* Handle updating user profile details securely */
export const updateUserProfile = async (req, res) => {
    const { id } = req.params;

    /* Authorization guard: Users are only allowed to modify their own profile data */
    if (!req.user || req.user.id !== id) {
        return res.status(403).json({ error: "Forbidden: You can only edit your own profile" });
    }

    const { displayName, phone, lat, lng, password } = req.body;
    const profileImage = req.file;

    /* Re-validate coordinates if they are being changed in this update request */
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

    /* Validate new image mimetype if a replacement file was uploaded */
    if (profileImage) {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedMimeTypes.includes(profileImage.mimetype)) {
            return res.status(400).json({ error: "Invalid image format. Only JPG, JPEG, PNG, and WEBP are allowed" });
        }
    }

    /* Enforce security rules if a password change is requested */
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

    /* Re-verify the phone text structure if it's being updated */
    if (phone) {
        const phoneRegex = /^05\d{8}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ error: "Invalid phone number. Must be a valid 10-digit number" });
        }
    }

    try {
        const updatedUser = await userModel.updateUser(id, {
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