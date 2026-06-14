import jwt from 'jsonwebtoken';
import * as tokenModel from '../models/tokenModel.js';

/* Secret key used to sign and verify JWT authentication tokens */
const JWT_SECRET = 'tamar_roni_moriya';

/* Authenticate the user and return a signed token if credentials are valid */
export const loginUser = (req, res) => {
    const { username, password } = req.body;

    /* Make sure both username and password are provided in the request */
    if (!username || !password) {
        return res.status(401).json({ error: "Unauthorized: Username and password are required" });
    }

    /* Verify credentials against the stored user data in the model layer */
    const matchedUser = tokenModel.verifyLogin(username, password);

    if (!matchedUser) {
        return res.status(401).json({ error: "Unauthorized: Invalid username or password" });
    }

    /* Generate a signed JWT token containing basic profile info and admin status valid for 48 hours */
    const token = jwt.sign(
        {
            id: matchedUser.id,
            username: matchedUser.username,
            isAdmin: matchedUser.isAdmin
        },
        JWT_SECRET,
        { expiresIn: '48h' }
    );

    return res.status(200).json({ token });
};