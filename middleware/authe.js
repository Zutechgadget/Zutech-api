// middleware/auth.js
import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Access Denied. No token provided." });

    try {
        const jwtPrivateKey = process.env.JWT_SECRET;
        if (!jwtPrivateKey) {
            return res.status(500).json({ message: "JWT secret is missing from environment variables." });
        }

        const decoded = jwt.verify(token, jwtPrivateKey);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Token verification failed:", error);
        res.status(403).json({ message: "Invalid token" });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admins only." });
    }
};

// Export both functions correctly
module.exports = { authenticateToken, isAdmin };
