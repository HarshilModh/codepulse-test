# CodePulse Scanner Dashboard

A full-stack static code quality and security analysis application. CodePulse scans JavaScript source code for common security vulnerabilities, evaluates code complexity metrics, persists historical scan reports, and displays them on a premium dark-mode dashboard with real-time process analytics.

---

## Features

- **Static Code Analysis Engine**: Scans code for critical flaws:
  - OS Command Injection (`exec`, `spawn` with dynamic parameter concats)
  - Unsafe Evaluation (`eval()`, `new Function()`)
  - Hardcoded Secrets (API tokens, auth keys, credential variables)
  - Weak RNGs (e.g. usage of cryptographically unsafe `Math.random()`)
  - Path Traversal (unsafe file read/write lookups)
- **Interactive Security Playground**: Write or paste snippets, select vulnerability preset templates, and view line-by-line highlights of security issues.
- **Premium Glassmorphic Dashboard UI**: High-fidelity dark mode with neon accents (Cyan, Indigo, Rose, Amber), responsive layouts, and modern typography.
- **Real-Time Analytics**: Built-in Server-Sent Events (SSE) system streaming memory heap, CPU load, and uptime directly into a custom HTML5 canvas graph.
- **Persistent JSON Store**: Robust file-locked database tracking history logs securely.
- **Full Test Suite**: Integration and unit tests implemented using Jest & Supertest.
- **Backwards Compatibility**: Retains support for health check, statistics, version, echo, and ping endpoints.

---

## Directory Structure

```
├── app.js                   # Main application entry point
├── package.json             # App configurations, dependencies, & test scripts
├── src/
│   ├── db.js                # Atomic JSON database manager
│   ├── scanner.js           # Static analysis security scanner engine
│   └── routes/
│       ├── api.js           # API routes (Scanning, History logs, Metrics SSE)
│       └── views.js         # Frontend page views router
├── public/
│   ├── css/
│   │   └── style.css        # Glassmorphic responsive dark stylesheet
│   └── js/
│       ├── dashboard.js     # Live metric chart controller & workspace scanning
│       └── scan.js          # Interactive snippet scanning & code highlighter
├── views/
│   ├── partials/
│   │   ├── header.ejs       # Common sidebar navigation layout
│   │   └── footer.ejs       # Dynamic system clock & footer scripts
│   ├── dashboard.ejs        # Dashboard statistics & activity overview
│   ├── scan.ejs             # Code sandbox security playground
│   └── history.ejs          # Historical scan reports details & file analysis
└── tests/
    ├── app.test.js          # App API endpoints integration tests
    └── scanner.test.js      # Scanner engine unit security tests
```

---

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run tests**:
   ```bash
   npm test
   ```

3. **Start the server**:
   ```bash
   node app.js
   ```

4. **Access UI**: Open `http://localhost:3000` in your browser.

---

## API Documentation

### Page Routing
- `GET /` - Overview Dashboard
- `GET /scan` - Interactive Sandbox
- `GET /history` - Scan log files list

### API Endpoints
- `POST /api/scan/snippet` - Scan code text snippet input
- `POST /api/scan/workspace` - Run full repository scan
- `GET /api/scans` - Retrieve history logs
- `DELETE /api/scans` - Clear database scan records
- `GET /api/metrics/realtime` - Server-Sent Events stream for process statistics

### Compatibility Endpoints
- `GET /health` - Health check status
- `POST /echo` - Bounce back request payload
- `GET /version` - Package version info
- `GET /stats` - Raw execution stats
- `GET /ping` - Response "pong"
test
test
# trigger codepulse Tue Jun  9 19:57:02 EDT 2026
# codepulse test Tue Jun  9 20:02:28 EDT 2026
# codepulse Tue Jun  9 20:08:58 EDT 2026
# PR comment test Tue Jun  9 20:18:11 EDT 2026
trigger analysis on PR
