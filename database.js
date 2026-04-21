const fs = require('fs');

// Dead Code
const unusedDBString = "postgres://user:pass@localhost:5432/db";

// Vulnerability: Plaintext passwords
const dbPassword = "super_secret_db_password_no_encryption";

function executeUnsafeQuery(userInput) {
    // High Complexity: Nested ridiculousness
    if (userInput) {
        if (typeof userInput === 'string') {
            if (userInput.length > 0) {
                if (userInput !== 'admin') {
                    // Vulnerability: Concatenating input directly into SQL query
                    const query = "SELECT * FROM users WHERE username = '" + userInput + "'";
                    
                    // Bad architecture: simulating a db call with eval just for maximum danger
                    eval("console.log('Running query: ' + query)");
                    return true;
                } else {
                    return false;
                }
            }
        }
    }
    return null;
}

// Dead function
function connectDatabaseV2() {
    let client = null;
    return client;
}

module.exports = {
    executeUnsafeQuery
};
