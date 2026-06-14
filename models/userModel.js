import { v4 as uuidv4 } from 'uuid';

// Fixed identifier for the default system administrator and restaurant owner
export const DEFAULT_ADMIN_ID = 'default-admin-owner-id';

// In-memory data store for volatile user records pre-populated with a default admin owner
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
        profileImage: 'default_avatar.png',
        isAdmin: true,
        isSyncedWithCpp: false
    }
];
// Insert a new user into the shared array
export const saveUser = (userData) => {
    //check if the username already exist in the system
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

// Search for a user by their unique auto-generated ID
export function findUserById(id) {
    return users.find(user => user.id === id);
};

// Search for a user by their unique username credentials
export function findUserByUsername(username){
    return users.find(user => user.username === username);
};

// Update an existing user's details
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
    user.isSyncedWithCpp = false;

    return user;
}