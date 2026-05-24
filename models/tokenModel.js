import { findUserByUsername } from './userModel.js';

// Verify user credentials against the data store
export const verifyLogin = (username, password) => {
    const user = findUserByUsername(username);

    // If user does not exist or password mismatch, return null
    if (!user || user.password !== password) {
        return null;
    }

    // Return the matched user object
    return user;
};