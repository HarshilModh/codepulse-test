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

app.listen(PORT, () => {
    console.log(`Clean server started successfully on port ${PORT}`);
});
