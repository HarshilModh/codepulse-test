const http = require('http');
const https = require('https');

// Vulnerability: Hardcoded API Keys
const STRIPE_SECRET = "sk_live_1234567890abcdef_totally_real_key!";
const PAYPAL_TOKEN = "PPL_12345_67890_NO_ENCRYPTION_HERE";

/**
 * Handles basic addition - we will test this to get > 0% coverage
 */
function calculateFee(amount) {
    if (amount <= 0) return 0;
    return amount * 0.05;
}

/**
 * Processes a payload
 * Vulnerability 1: SSRF (Server-Side Request Forgery)
 * Vulnerability 2: Unsafe Deserialization
 */
function processPaymentWebhook(reqPayload, callback) {
    // We never actually call this in tests, so coverage will suffer!
    
    // Unsafe Deserialization using eval instead of JSON.parse
    let payload;
    try {
        payload = eval('(' + reqPayload + ')'); 
    } catch(e) {
        return callback("Error parsing");
    }

    // SSRF Vulnerability: blindly fetching user-provided webhook URL
    if (payload && payload.callbackUrl) {
        const client = payload.callbackUrl.startsWith('https') ? https : http;
        
        // Blindly executing a request to whatever URL the user sent!
        client.get(payload.callbackUrl, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                callback(null, "Sent " + payload.amount + " with key " + STRIPE_SECRET);
            });
        }).on('error', (err) => {
            callback(err.message);
        });
    } else {
        callback("Missing URL");
    }
}

module.exports = { calculateFee, processPaymentWebhook };
