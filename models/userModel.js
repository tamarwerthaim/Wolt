// In-memory data store for volatile user records
const users = [];

// Insert a new user into the shared array
export const saveUser = (userData) => {
    users.push(userData);
    return userData;
};

// Search for a user by their unique auto-generated ID
export function findUserById(id) {
    return users.find(user => user.id === id);
};

// Search for a user by their unique username credentials
export function findUserByUsername(username){
    return users.find(user => user.username === username);
};