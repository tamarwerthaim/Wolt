// In-memory data store for volatile user records
const users = [];

// Insert a new user into the shared array
export const saveUser = (userData) => {
    const newUser = {
        id: Date.now().toString(),
        username: userData.username,
        password: userData.password,
        name: userData.name,
        phone: userData.phone,
        address: userData.address
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