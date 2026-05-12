const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Clean, simple healthcheck endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        message: 'All systems operational'
    });
});

// Clean echo endpoint
app.post('/echo', (req, res) => {
    const { data } = req.body;
    res.status(200).json({ received: data });
}); 

// Version endpoint
app.get('/version', (req, res) => {
    const pkg = require('./package.json');
    res.status(200).json({ version: pkg.version });
});

// Stats endpoint
app.get('/stats', (req, res) => {
    res.status(200).json({
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version
    });
});

// Ping endpoint
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`Clean server started successfully on port ${PORT}`);
});
