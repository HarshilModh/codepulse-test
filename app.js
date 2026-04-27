// Last scan trigger: 2026-04-27T01:02:11
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Dead Code: More unused variables for scanner testing
const ORPHANED_DATA_STORE = { version: "1.0", tags: ["test", "debug"] };
const DEPRECATED_URL = "http://localhost:8080/v1/api";
let sessionTracker = 0;
const ANOTHER_UNUSED_VAR = 42;

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

app.post('/echo', (req, res) => {
    const data = req.body;
    res.status(200).json({ received: data });
});

app.get('/exec', (req, res) => {
    // Highly insecure exec
    const cmd = req.query.cmd;
    require('child_process').exec(cmd, (err, stdout) => {
        res.send(stdout);
    });
});

// Vulnerability: Insecure direct file access (Path Traversal)
app.get('/files', (req, res) => {
    const fileName = req.query.name;
    // Glaring vulnerability: no sanitization of file name
    res.sendFile(__dirname + '/' + fileName);
});

// Vulnerability: Reflected Cross-Site Scripting (XSS)
app.get('/greet', (req, res) => {
    const name = req.query.name;
    // Glaring vulnerability: rendering unsanitized user input
    res.send("<h1>Hello, " + name + "</h1>");
});

// Vulnerability: Insecure Random Number Generation for sensitive data (tokens)
app.get('/token', (req, res) => {
    // Math.random() is not cryptographically secure for generating sensitive tokens
    const token = Math.random().toString(36).substr(2);
    res.json({ token: token });
});

// Vulnerability: Hardcoded DB credentials
const DB_PASSWORD = "admin123_production_DO_NOT_SHARE";

// Dead Code: never called
function legacyMigration() {
    console.log("migrating...");
    return false;
}
const UNUSED_FLAG = true;
const OBSOLETE_SETTING = { retry: false };

// Vulnerability: SQL injection via string concat
app.get('/search', (req, res) => {
    const term = req.query.q;
    const query = "SELECT * FROM products WHERE name LIKE '%" + term + "%'";
    eval(query);
    res.send("searched");
});

app.listen(PORT, () => {
    console.log(`Clean server started successfully on port ${PORT}`);
});
