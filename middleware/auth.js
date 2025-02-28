import jwt from "jsonwebtoken";
import config from "config";

function auth(req, res, next) {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        return res.status(401).send("Access denied. No token provided.");
    }

    const token = authHeader.split(" ")[1]; // Extract token after "Bearer"
    if (!token) {
        return res.status(401).send("Access denied. Token missing.");
    }

    try {
        const secretKey = config.get("jwtPrivateKey") || "your_secret_key";
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).send("Invalid token.");
    }
}

// Debugging: Log received tokens
// app.use((req, res, next) => {
//     console.log("Token received:", req.headers.authorization);
//     next();
// });

export default auth;
