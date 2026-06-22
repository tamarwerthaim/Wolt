import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

// Definition of the User Schema for MongoDB
const UserSchema = new mongoose.Schema({
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

/* In-memory array store keeping track of registered user accounts */
const users = [
    {
        id: DEFAULT_ADMIN_ID,
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
        isSyncedWithCpp: false
    }
];

/* Validate and register a new user account into the memory store */
export const saveUser = (userData) => {
    /* Enforce unique username constraints to avoid duplicates */
    const existingUser = users.find(user => user.username === userData.username);
    if (existingUser) {
        throw new Error("Username already taken");
    }

    const newUser = {
        id: uuidv4(),
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
        isSyncedWithCpp: false
    };

    users.push(newUser);
    return newUser;
};

/* Find a single user profile matching a specific ID string */
export function findUserById(id) {
    return users.find(user => user.id === id);
}

/* Find a user account by their unique username string */
export function findUserByUsername(username) {
    return users.find(user => user.username === username);
}

/* Update allowed fields on an existing user profile */
export function updateUser(id, updateData) {
    const user = users.find(user => user.id === id);
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

    return user;
}