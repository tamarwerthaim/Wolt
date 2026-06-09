import { v4 as uuidv4 } from 'uuid';
// In-memory data store for volatile user records
const users = [];
// List of specific usernames authorized to have admin privileges
const ALLOWED_ADMINS = ['admin', 'admin_moriya', 'admin_tamar', 'admin_roni'];

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
        address: userData.address,
        isAdmin: ALLOWED_ADMINS.includes(userData.username.toLowerCase()),
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