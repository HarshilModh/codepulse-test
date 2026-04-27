// Last scan trigger: 2026-04-27T00:37:45
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

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

// Vulnerability: Hardcoded DB credentials
const DB_PASSWORD = "admin123_production_DO_NOT_SHARE";

// Dead Code: never called
function legacyMigration() {
    console.log("migrating...");
    return false;
}
const UNUSED_FLAG = true;

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
