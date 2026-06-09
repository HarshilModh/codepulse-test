const express = require('express');
const router = express.Router();
const db = require('../db');
const scanner = require('../scanner');

// GET /
router.get('/', (req, res) => {
    const scans = db.getScans();
    const pkg = require('../../package.json');
    
    // Aggregate summary metrics
    const stats = {
        totalScans: scans.length,
        workspaceScans: scans.filter(s => s.type === 'workspace').length,
        snippetScans: scans.filter(s => s.type === 'snippet').length,
        latestGrade: scans.length > 0 ? scans[0].metrics.grade : 'N/A',
        latestScore: scans.length > 0 ? scans[0].metrics.score : 0,
        totalVulnerabilitiesFound: scans.reduce((acc, s) => acc + (s.vulnerabilities ? s.vulnerabilities.length : 0), 0)
    };
    
    res.render('dashboard', {
        title: 'Dashboard - CodePulse Scanner',
        stats,
        recentScans: scans.slice(0, 5),
        version: pkg.version
    });
});

// GET /scan
router.get('/scan', (req, res) => {
    res.render('scan', {
        title: 'Interactive Code Scanner - CodePulse',
        rules: scanner.RULES
    });
});

// GET /history
router.get('/history', (req, res) => {
    const scans = db.getScans();
    res.render('history', {
        title: 'Scan Log History - CodePulse',
        scans
    });
});

module.exports = router;
