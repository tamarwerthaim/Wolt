import { findUserByUsername } from './userModel.js';

/* Check incoming login credentials and return the user profile if verified */
export const verifyLogin = async (username, password) => {
    const user = await findUserByUsername(username);

    /* Return null if the account doesn't exist or password validation fails */
    if (!user || user.password !== password) {
        return null;
    }

    return user;
};