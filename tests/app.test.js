const request = require('supertest');
const app = require('../app');
const db = require('../src/db');

describe('App Integration Tests', () => {

    beforeAll(() => {
        db.init();
    });

    afterAll(() => {
        // clean up scan records
        db.clearScans();
    });

    // --- Backwards Compatibility Endpoint Tests ---

    test('GET /health should return 200 healthy status', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('healthy');
    });

    test('POST /echo should echo data', async () => {
        const response = await request(app)
            .post('/echo')
            .send({ data: 'hello' });
        expect(response.status).toBe(200);
        expect(response.body.received).toBe('hello');
    });

    test('GET /version should return version', async () => {
        const response = await request(app).get('/version');
        expect(response.status).toBe(200);
        expect(response.body.version).toBeDefined();
    });

    test('GET /stats should return system stats', async () => {
        const response = await request(app).get('/stats');
        expect(response.status).toBe(200);
        expect(response.body.uptime).toBeDefined();
        expect(response.body.memory).toBeDefined();
    });

    test('GET /ping should return pong', async () => {
        const response = await request(app).get('/ping');
        expect(response.status).toBe(200);
        expect(response.text).toBe('pong');
    });

    // --- API Endpoint Tests ---

    test('POST /api/scan/snippet should analyze and save snippet', async () => {
        const code = `eval(req.query.cmd);`;
        const response = await request(app)
            .post('/api/scan/snippet')
            .send({ code, filename: 'vuln.js' });
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.scan).toBeDefined();
        expect(response.body.scan.metrics.score).toBeLessThan(100);
        expect(response.body.scan.vulnerabilities.length).toBe(1);
    });

    test('GET /api/scans should return scan log list', async () => {
        const response = await request(app).get('/api/scans');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.scans)).toBe(true);
        expect(response.body.scans.length).toBeGreaterThanOrEqual(1);
    });

    test('DELETE /api/scans should clear scan list', async () => {
        const response = await request(app).delete('/api/scans');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        
        const checkResponse = await request(app).get('/api/scans');
        expect(checkResponse.body.scans.length).toBe(0);
    });

    // --- Page Views Tests ---

    test('GET / should render dashboard page', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.text).toContain('Dashboard');
        expect(response.text).toContain('CodePulse');
    });

    test('GET /scan should render interactive playground page', async () => {
        const response = await request(app).get('/scan');
        expect(response.status).toBe(200);
        expect(response.text).toContain('Playground');
    });

    test('GET /history should render logs page', async () => {
        const response = await request(app).get('/history');
        expect(response.status).toBe(200);
        expect(response.text).toContain('History');
    });
});
