const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const db = require('./src/db');
const apiRouter = require('./src/routes/api');
const viewsRouter = require('./src/routes/views');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Database
db.init();

// Configure EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// Security and compression middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'", "unpkg.com"],
            "font-src": ["'self'", "fonts.gstatic.com"],
            "style-src": ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
            "connect-src": ["'self'"]
        }
    }
}));
app.use(compression());
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Mounting Router Modules
app.use('/api', apiRouter);
app.use('/', viewsRouter);

// --- Backwards Compatibility Endpoints ---

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

// --- End Backwards Compatibility Endpoints ---

// 404 Handler
app.use((req, res) => {
    if (req.accepts('html')) {
        res.status(404).render('history', {
            title: 'Endpoint Not Found',
            scans: db.getScans() // fallback
        });
    } else {
        res.status(404).json({ error: 'Endpoint not found' });
    }
});

// Only listen if run directly (allows importing in tests)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Clean server started successfully on port ${PORT}`);
    });
}

module.exports = app;
