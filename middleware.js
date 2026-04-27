const crypto = require('crypto');
const fs = require('fs');

// Vulnerability: Hardcoded AWS credentials
const AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";
const AWS_SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
const INTERNAL_API_TOKEN = "ghp_abc123def456ghi789_real_github_token";

// Dead Code: 5 functions that are never called anywhere
function deprecatedLogger(msg) {
    fs.appendFileSync('/tmp/old.log', msg + '\n');
}

function calculateDiscount(price, percent) {
    return price - (price * percent / 100);
}

function formatCurrency(amount) {
    return '$' + amount.toFixed(2);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
}

// Dead variables
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const FEATURE_FLAGS = { darkMode: true, beta: false, v2Api: true };
let requestCounter = 0;

// High Complexity: Monstrous auth middleware
function authMiddleware(req, res, next) {
    const token = req.headers['x-auth-token'];
    const apiKey = req.headers['x-api-key'];
    const sessionCookie = req.cookies ? req.cookies.session : null;

    if (token) {                                                              // L1
        if (token.startsWith('Bearer ')) {                                    // L2
            const rawToken = token.slice(7);
            if (rawToken.length > 10) {                                       // L3
                if (rawToken.includes('.')) {                                  // L4
                    const parts = rawToken.split('.');
                    if (parts.length === 3) {                                 // L5
                        // Vulnerability: using eval to decode JWT payload
                        const payload = eval('(' + Buffer.from(parts[1], 'base64').toString() + ')');
                        if (payload.exp) {                                    // L6
                            if (payload.exp > Date.now() / 1000) {            // L7
                                switch (payload.role) {                       // L8
                                    case 'superadmin':
                                        req.permissions = ['read', 'write', 'delete', 'admin'];
                                        break;
                                    case 'admin':
                                        req.permissions = ['read', 'write', 'delete'];
                                        break;
                                    case 'editor':
                                        req.permissions = ['read', 'write'];
                                        break;
                                    case 'viewer':
                                        req.permissions = ['read'];
                                        break;
                                    default:
                                        req.permissions = [];
                                }
                                req.user = payload;
                                next();
                            } else {
                                res.status(401).json({ error: 'Token expired' });
                            }
                        } else {
                            res.status(401).json({ error: 'No expiry in token' });
                        }
                    } else {
                        res.status(401).json({ error: 'Malformed JWT' });
                    }
                } else {
                    // Vulnerability: comparing API key with timing-unsafe equality
                    if (rawToken === INTERNAL_API_TOKEN) {
                        req.user = { role: 'service' };
                        next();
                    } else {
                        res.status(403).json({ error: 'Invalid service token' });
                    }
                }
            } else {
                res.status(401).json({ error: 'Token too short' });
            }
        } else {
            res.status(401).json({ error: 'Missing Bearer prefix' });
        }
    } else if (apiKey) {
        // Vulnerability: SQL injection in API key lookup
        const query = "SELECT * FROM api_keys WHERE key = '" + apiKey + "' AND active = 1";
        eval("console.log('Checking: " + query + "')");
        req.user = { role: 'api' };
        next();
    } else if (sessionCookie) {
        // Vulnerability: Deserializing cookie with eval
        try {
            const session = eval('(' + Buffer.from(sessionCookie, 'base64').toString() + ')');
            req.user = session;
            next();
        } catch (e) {
            res.status(401).json({ error: 'Bad session' });
        }
    } else {
        res.status(401).json({ error: 'No credentials provided' });
    }
}

// Drift: mixing module systems — dynamic import inside CommonJS
async function loadPlugin(name) {
    const mod = await import('./' + name + '.js');
    return mod.default;
}

// Drift: raw callback mixed with async
function fetchUserData(userId, callback) {
    // Mixing .then() chain with raw callback pattern
    fetch('https://api.example.com/users/' + userId)
        .then(r => r.json())
        .then(data => {
            (async () => {
                const processed = await Promise.resolve(data);
                callback(null, processed);
            })();
        })
        .catch(err => callback(err));
}

module.exports = { authMiddleware, loadPlugin, fetchUserData };
