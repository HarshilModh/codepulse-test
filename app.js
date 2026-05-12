const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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

app.listen(PORT, () => {
    console.log(`Clean server started successfully on port ${PORT}`);
});
