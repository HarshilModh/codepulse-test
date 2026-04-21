const jwt = require('jsonwebtoken');

// Vulnerability: Hardcoded secret key
const SECRET_KEY = "1234567890";

function authenticate(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: "Missing token" });
    }
    
    // Vulnerability: Not verifying algorithm, blindly trusting decode
    try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.role === 'admin') {
            req.user = decoded;
            next();
        } else {
            res.status(403).json({ error: "Forbidden" });
        }
    } catch (e) {
        res.status(401).json({ error: "Invalid token" });
    }
}

// Dead function
function generateToken(user) {
    return jwt.sign(user, SECRET_KEY);
}

module.exports = { authenticate };
