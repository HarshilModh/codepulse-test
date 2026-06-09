const scanner = require('../src/scanner');

describe('Static Security Scanner Unit Tests', () => {

    test('should pass clean/safe code with score 100 and Grade A', () => {
        const safeCode = `
            const x = 10;
            const y = 20;
            function add(a, b) {
                return a + b;
            }
            const result = add(x, y);
            console.log("Result is:", result);
        `;
        const report = scanner.scanSnippet(safeCode, 'safe.js');
        expect(report.vulnerabilities.length).toBe(0);
        expect(report.metrics.score).toBe(100);
        expect(report.metrics.grade).toBe('A');
    });

    test('should detect Unsafe Dynamic Evaluation (eval)', () => {
        const vulnCode = `
            const input = "console.log('hello')";
            eval(input);
            const fn = new Function('a', 'b', 'return a + b');
        `;
        const report = scanner.scanSnippet(vulnCode, 'eval.js');
        expect(report.vulnerabilities.length).toBeGreaterThanOrEqual(1);
        const evalVuln = report.vulnerabilities.find(v => v.ruleId === 'EVAL');
        expect(evalVuln).toBeDefined();
        expect(evalVuln.severity).toBe('CRITICAL');
    });

    test('should detect OS Command Injection', () => {
        const vulnCode = `
            const { exec } = require('child_process');
            function ping(host) {
                exec('ping -c 3 ' + host);
            }
        `;
        const report = scanner.scanSnippet(vulnCode, 'cmd.js');
        expect(report.vulnerabilities.length).toBeGreaterThanOrEqual(1);
        const cmdVuln = report.vulnerabilities.find(v => v.ruleId === 'CMD_INJECTION');
        expect(cmdVuln).toBeDefined();
        expect(cmdVuln.severity).toBe('CRITICAL');
    });

    test('should detect Hardcoded Credential/Key', () => {
        const vulnCode = `
            const stripe_secret = "sk_test_1234567890abcdef_key";
            const PAYPAL_TOKEN = "PPL_1234567890abcdef_token";
        `;
        const report = scanner.scanSnippet(vulnCode, 'keys.js');
        expect(report.vulnerabilities.length).toBe(2);
        const stripeVuln = report.vulnerabilities.find(v => v.code.includes('stripe_secret'));
        expect(stripeVuln).toBeDefined();
        expect(stripeVuln.severity).toBe('HIGH');
    });

    test('should detect Weak Random Number Generator', () => {
        const vulnCode = `
            const rand = Math.random();
        `;
        const report = scanner.scanSnippet(vulnCode, 'rng.js');
        expect(report.vulnerabilities.length).toBe(1);
        const rngVuln = report.vulnerabilities.find(v => v.ruleId === 'WEAK_RNG');
        expect(rngVuln).toBeDefined();
        expect(rngVuln.severity).toBe('LOW');
    });

    test('should detect Path Traversal vulnerability', () => {
        const vulnCode = `
            const fs = require('fs');
            function readFile(userFile) {
                fs.readFile('/var/data/' + userFile, 'utf8', (err, data) => {
                    console.log(data);
                });
            }
        `;
        const report = scanner.scanSnippet(vulnCode, 'path.js');
        expect(report.vulnerabilities.length).toBe(1);
        const pathVuln = report.vulnerabilities.find(v => v.ruleId === 'PATH_TRAVERSAL');
        expect(pathVuln).toBeDefined();
        expect(pathVuln.severity).toBe('HIGH');
    });

    test('should detect SQL Injection vulnerability', () => {
        const vulnCode = `
            const query = "SELECT * FROM users WHERE username = '" + username + "'";
            db.query(query, (err, rows) => {
                console.log(rows);
            });
        `;
        const report = scanner.scanSnippet(vulnCode, 'sql.js');
        expect(report.vulnerabilities.length).toBe(1);
        const sqlVuln = report.vulnerabilities.find(v => v.ruleId === 'SQL_INJECTION');
        expect(sqlVuln).toBeDefined();
        expect(sqlVuln.severity).toBe('HIGH');
    });

    test('should detect XSS vulnerability', () => {
        const vulnCode = `
            app.get('/test', (req, res) => {
                res.send("Hello " + req.query.name);
            });
        `;
        const report = scanner.scanSnippet(vulnCode, 'xss.js');
        expect(report.vulnerabilities.length).toBe(1);
        const xssVuln = report.vulnerabilities.find(v => v.ruleId === 'XSS');
        expect(xssVuln).toBeDefined();
        expect(xssVuln.severity).toBe('HIGH');
    });

    test('should detect NoSQL Injection vulnerability', () => {
        const vulnCode = `
            User.findOne({ username: req.body.username, password: req.body.password }, (err, user) => {
                console.log(user);
            });
        `;
        const report = scanner.scanSnippet(vulnCode, 'nosql.js');
        expect(report.vulnerabilities.length).toBe(1);
        const nosqlVuln = report.vulnerabilities.find(v => v.ruleId === 'NOSQL_INJECTION');
        expect(nosqlVuln).toBeDefined();
        expect(nosqlVuln.severity).toBe('HIGH');
    });

    test('should detect Weak Crypto vulnerability', () => {
        const vulnCode = `
            const hash = crypto.createHash('md5').update('pass').digest('hex');
        `;
        const report = scanner.scanSnippet(vulnCode, 'crypto.js');
        expect(report.vulnerabilities.length).toBe(1);
        const cryptoVuln = report.vulnerabilities.find(v => v.ruleId === 'WEAK_CRYPTO');
        expect(cryptoVuln).toBeDefined();
        expect(cryptoVuln.severity).toBe('MEDIUM');
    });

    test('should detect Insecure CORS vulnerability', () => {
        const vulnCode = `
            app.use(cors({ origin: '*' }));
        `;
        const report = scanner.scanSnippet(vulnCode, 'cors.js');
        expect(report.vulnerabilities.length).toBe(1);
        const corsVuln = report.vulnerabilities.find(v => v.ruleId === 'INSECURE_CORS');
        expect(corsVuln).toBeDefined();
        expect(corsVuln.severity).toBe('HIGH');
    });
});
