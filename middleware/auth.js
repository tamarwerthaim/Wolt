import jwt from 'jsonwebtoken';
import multer from 'multer'; // 🔥 מייבאים את מולטר לניהול קבצים
import path from 'path';     // 🔥 מייבאים את ספריית path כדי לשמור על סיומות הקבצים

// Secret master key used by the server to sign and verify authentication tokens
const JWT_SECRET = 'tamar_roni_moriya';

// ==========================================
// 📸 הגדרת מנגנון העלאת הקבצים (Multer Configuration)
// ==========================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // התמונות יישמרו בתיקיית uploads בשרת
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // מייצרים שם ייחודי לכל תמונה בעזרת timestamp כדי שקבצים לא ידרסו אחד את השני
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 🔥 מייצאים אקטיבית את upload כדי שראוטר המסעדות וראוטר המשתמשים יוכלו להשתמש בו!
export const upload = multer({ storage: storage });


// ==========================================
// 🛡️ פונקציות האבטחה וה-JWT שלכן (נשארות ללא שינוי)
// ==========================================

// Middleware function to verify JWT token and authenticate user
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: Missing authentication token" });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
        if (err) {
            return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
        }
        req.user = decodedUser;
        next();
    });
}

// Middleware function to verify JWT token and authenticate user with admin privileges
export const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
        if (err || !decodedUser.isAdmin) {
            return res.status(403).json({ error: "Forbidden: Admin access required" });
        }

        req.user = decodedUser;
        next();
    });
};