const express = require('express');
const router = express.Router();
const path = require('path');
const scanner = require('../scanner');
const db = require('../db');

// POST /api/scan/snippet
router.post('/scan/snippet', (req, res) => {
    const { code, filename } = req.body;
    if (!code) {
        return res.status(400).json({ error: 'Code content is required' });
    }
    
    const targetFilename = filename || 'sandbox.js';
    const report = scanner.scanSnippet(code, targetFilename);
    
    // Add to DB
    const saved = db.addScan({
        type: 'snippet',
        target: targetFilename,
        metrics: report.metrics,
        vulnerabilities: report.vulnerabilities
    });
    
    res.status(200).json({ success: true, scan: saved });
});

// POST /api/scan/workspace
router.post('/scan/workspace', (req, res) => {
    const workspaceRoot = path.join(__dirname, '../../');
    const report = scanner.scanDirectory(workspaceRoot);
    
    if (report.error) {
        return res.status(500).json({ error: 'Workspace scan failed: ' + report.error });
    }
    
    const saved = db.addScan({
        type: 'workspace',
        target: 'codepulse-test',
        metrics: report.metrics,
        vulnerabilities: report.vulnerabilities,
        files: report.files
    });
    
    res.status(200).json({ success: true, scan: saved });
});

// GET /api/scans
router.get('/scans', (req, res) => {
    try {
        const scans = db.getScans();
        res.status(200).json({ success: true, scans });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch scan history' });
    }
});

// DELETE /api/scans
router.delete('/scans', (req, res) => {
    try {
        db.clearScans();
        res.status(200).json({ success: true, message: 'Scan history cleared' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to clear scan history' });
    }
});

// GET /api/metrics/realtime (SSE Stream)
router.get('/metrics/realtime', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    
    const sendMetric = () => {
        const mem = process.memoryUsage();
        const metrics = {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: {
                rss: Math.round(mem.rss / 1024 / 1024),
                heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
                heapTotal: Math.round(mem.heapTotal / 1024 / 1024)
            },
            cpu: process.cpuUsage()
        };
        res.write(`data: ${JSON.stringify(metrics)}\n\n`);
    };
    
    // Send initial metric
    sendMetric();
    
    // Set interval to send updates every 2 seconds
    const interval = setInterval(sendMetric, 2000);
    
    req.on('close', () => {
        clearInterval(interval);
        res.end();
    });
});

module.exports = router;
