const crypto = require('crypto');
const fs = require('fs');

// Vulnerability: Using MD5 for "secure" logging
function secureLog(message) {
    const hash = crypto.createHash('md5').update(message).digest('hex');
    const logEntry = `[${new Date().toISOString()}] ${hash}: ${message}\n`;
    
    // Vulnerability: Arbitrary file write if filename is influenced by message (unlikely but bad pattern)
    fs.appendFileSync('system.log', logEntry);
}

// Dead Code: Unused legacy functions
function rotateLogs() {
    console.log("Rotating logs...");
}

function clearTempDir() {
    const files = fs.readdirSync('/tmp');
    files.forEach(file => {
        // Vulnerability: potentially deleting critical files if not careful
        console.log("cleaning " + file);
    });
}

// Vulnerability: Insecure temp file creation
function writeToTemp(data) {
    const tmpPath = '/tmp/debug_' + Math.random().toString(36).substring(7) + '.txt';
    fs.writeFileSync(tmpPath, data);
    return tmpPath;
}

// More Dead variables
const LOG_VERSION = "0.0.1-alpha";
const MAX_LOG_SIZE = 1024 * 1024;

module.exports = { secureLog, writeToTemp };
