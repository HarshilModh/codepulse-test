// server.js
const express = require('express');
const sqlite3 = require('sqlite3');
const fs = require('fs');

// Drift / Bad Architecture: Dynamic import mixed with require inside a weird IIFE
// (This will drive static analysis tools crazy when mixed with CommonJS).
let pathModule;
(async () => {
    pathModule = await import('path');
})();

// Vulnerability: Hardcoded Secrets at the top of the file
const JWT_SECRET = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.super_secret_jwt_key_12345!";
const STRIPE_API_KEY = "sk_test_51HxK92L9K2mNqP00abc123DEF456ghi789jkl";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dead Code: Variables that are fully declared but absolutely never called or used
const unusedConfig = { maxRetries: 5, timeout: 5000 };
let unusedCounter = 42;
var legacyOrphanArray = ['apple', 'banana', 'cherry'];

// Dead Code: Function 1
function deadFunctionOne() {
    console.log("This is dead code");
    return unusedCounter;
}

// Dead Code: Function 2
const deadFunctionTwo = () => {
    let internalUnused = "hello world";
    return internalUnused.toUpperCase();
}

// Dead Code: Function 3
function deadFunctionThree(a, b) {
    const calc = a + b;
    return calc * 2;
}

// Drift / Bad Architecture: Mixing async/await, .then() chains, and ancient raw callbacks in the same block.
app.get('/api/legacy-data', async (req, res) => {
    // 1. Ancient raw callback pattern
    fs.readFile('package.json', 'utf8', (err, fileData) => {
        if (err) console.error(err);
        
        // 2. .then() promise chain completely nested inside a callback
        fetch('https://jsonplaceholder.typicode.com/todos/1')
            .then(response => response.json())
            .then(apiData => {
                
                // 3. Spawning an IIFE to use async/await inside the promise chain inside the callback
                (async () => {
                   let processed = await Promise.resolve(apiData);
                   res.json({ file: fileData ? fileData.substring(0, 50) : null, processed });
                })();
                
            }).catch(e => console.error(e));
    });
});

// High Complexity & Vulnerabilities
app.post('/api/process', (req, res) => {
    let payload = req.body;
    let result = '';

    // Vulnerability: Using eval() on raw user input
    if (payload.dynamicAction) {
        eval("console.log('Action: ' + " + payload.dynamicAction + ")");
    }

    // Vulnerability: Glaring SQL Injection
    const db = new sqlite3.Database('./test.db');
    let userQuery = req.query.username;
    let unsafeQuery = "SELECT * FROM users WHERE username = '" + userQuery + "' AND role = 'admin'";
    
    db.exec(unsafeQuery, (err) => {
         if (err) console.log("DB Error:", err);
    });

    // High Complexity: Deeply nested if/else and switch block (5+ levels deep) parsing user input
    if (payload) {                                                        // Level 1
        if (payload.action) {                                             // Level 2
            if (payload.action === 'execute') {                           // Level 3
                if (payload.userContext) {                                // Level 4
                    if (payload.userContext.role === 'admin') {           // Level 5
                        switch (payload.userContext.stage) {              // Level 6
                            case 'init':
                                result = 'Initializing admin process...';
                                if (payload.force) {                      // Level 7
                                    result += ' Force flag activated!';
                                }
                                break;
                            case 'run':
                                result = 'Running admin tasks...';
                                break;
                            default:
                                result = 'Unknown admin stage';
                        }
                    } else if (payload.userContext.role === 'user') {
                        switch (payload.userContext.stage) {
                            case 'login':
                                result = 'User login procedure...';
                                break;
                            case 'logout':
                                result = 'User logout procedure...';
                                break;
                            default:
                                result = 'Unknown user stage';
                        }
                    } else {
                        result = 'Unknown role identified';
                    }
                } else {
                    result = 'Missing userContext in execute action';
                }
            } else if (payload.action === 'delete') {
                 result = 'Processing delete action...';
            } else {
                 result = 'Execution action not recognized';
            }
        } else {
            result = 'No action provided in payload';
        }
    } else {
        result = 'No payload provided';
    }

    res.status(200).send({ status: 'success', message: result });
});

// Vulnerability: Unrestricted File Read / Path Traversal
// e.g. GET /api/download?file=../../../../etc/passwd
app.get('/api/download', (req, res) => {
    const path = require('path'); // Drift: requiring inside a route handler
    const filePath = req.query.file;
    // No sanitization of filePath
    const fullPath = path.join(__dirname, filePath);
    
    fs.readFile(fullPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send("Error reading file");
        }
        res.send(data);
    });
});

app.listen(3000, () => {
    console.log("Messy server running on port 3000");
});

// Dead Code: Unused Class
class DeadClass {
    constructor() {
        this.unusedProp = "I do nothing";
    }
    
    deadMethod() {
        return this.unusedProp;
    }
}
