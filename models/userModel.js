import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

// Definition of the User Schema for MongoDB
const UserSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => uuidv4()
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    geolocation: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },
    profileImage: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isSyncedWithCpp: {
        type: Boolean,
        default: false
    },
    cppId: {
        type: Number
    }
});

// Compile and export the User model
export const User = mongoose.model('User', UserSchema);

/* Hardcoded ID for the default system admin and restaurant owner */
export const DEFAULT_ADMIN_ID = 'default-admin-owner-id';

/* Validate and register a new user account into the MongoDB database */
export const saveUser = async (userData) => {
    /* Enforce unique username constraints to avoid duplicates */
    const existingUser = await User.findOne({ username: userData.username });
    if (existingUser) {
        throw new Error("Username already taken");
    }

    // Get the next C++ ID mapping
    const maxUser = await User.findOne().sort({ cppId: -1 });
    const nextCppId = maxUser && maxUser.cppId ? maxUser.cppId + 1 : 1;

    const newUser = new User({
        username: userData.username,
        password: userData.password,
        name: userData.name,
        phone: userData.phone,
        geolocation: {
            lat: parseFloat(userData.lat),
            lng: parseFloat(userData.lng)
        },
        profileImage: userData.profileImage,
        isAdmin: !!userData.isAdmin,
        cppId: nextCppId
    });

    await newUser.save();
    const obj = newUser.toObject();
    obj.id = obj._id;
    return obj;
};

/* Find a single user profile matching a specific ID string */
export async function findUserById(id) {
    const userDoc = await User.findById(id);
    if (!userDoc) return null;
    const obj = userDoc.toObject();
    obj.id = obj._id;
    return obj;
}

/* Find a user account by their unique username string */
export async function findUserByUsername(username) {
    const userDoc = await User.findOne({ username });
    if (!userDoc) return null;
    const obj = userDoc.toObject();
    obj.id = obj._id;
    return obj;
}

/* Update allowed fields on an existing user profile */
export async function updateUser(id, updateData) {
    const user = await User.findById(id);
    if (!user) {
        throw new Error("User not found");
    }

    if (updateData.name !== undefined) user.name = updateData.name;
    if (updateData.phone !== undefined) user.phone = updateData.phone;

    if (updateData.lat !== undefined && updateData.lng !== undefined) {
        user.geolocation = {
            lat: parseFloat(updateData.lat),
            lng: parseFloat(updateData.lng)
        };
    }

    if (updateData.profileImage !== undefined) {
        user.profileImage = updateData.profileImage;
    }

    if (updateData.password) {
        user.password = updateData.password;
    }

    /* Reset sync status to false so changes are re-pushed to the C++ server on the next event */
    user.isSyncedWithCpp = false;

    await user.save();
    const obj = user.toObject();
    obj.id = obj._id;
    return obj;
}

/* Database seeding logic to auto-create the default admin user on startup */
export async function seedDefaultAdmin() {
    try {
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            const defaultAdmin = new User({
                _id: DEFAULT_ADMIN_ID,
                username: 'admin',
                password: 'Password123',
                name: 'Default Admin',
                phone: '0501234567',
                geolocation: {
                    lat: 32.0801,
                    lng: 34.7805
                },
                profileImage: 'wolt_circle2.png',
                isAdmin: true,
                isSyncedWithCpp: false,
                cppId: 1
            });
            await defaultAdmin.save();
        }
    } catch (err) {
        console.error('Failed to seed default admin:', err);
    }
}