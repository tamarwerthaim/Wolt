//import { IdGenerator } from '../idMapper.js';
import { v4 as uuidv4 } from 'uuid';
// In-memory data store for volatile user records
const users = [];

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