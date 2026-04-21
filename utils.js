// utils.js
// A collection of highly problematic utility functions

const crypto = require('crypto');

// Vulnerability: Insecure cryptographic algorithm
function hashPassword(password) {
    const md5sum = crypto.createHash('md5');
    md5sum.update(password);
    return md5sum.digest('hex');
}

// Dead Code:
const NOT_USED_CONSTANT = "This is dead code";
function unusedHelper1() {}
function unusedHelper2() {}
function unusedHelper3() {}

// High Complexity Function
function parseLegacyData(dataString, mode) {
    let result = null;
    if (dataString) {
        if (mode === 'xml') {
            if (dataString.startsWith('<')) {
                if (dataString.includes('user')) {
                    if (dataString.includes('admin')) {
                        result = 'admin_xml';
                    } else {
                        result = 'user_xml';
                    }
                } else {
                    result = 'unknown_xml';
                }
            }
        } else if (mode === 'json') {
            if (dataString.startsWith('{')) {
                if (dataString.includes(':')) {
                    // Vulnerability: Using eval to parse JSON
                    const parsed = eval('(' + dataString + ')');
                    if (parsed.user) {
                        result = parsed.user;
                    } else {
                        result = 'unknown_json';
                    }
                }
            }
        } else {
            result = 'text';
        }
    }
    return result;
}

module.exports = {
    hashPassword,
    parseLegacyData
};
