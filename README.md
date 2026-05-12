# CodePulse Test Server

A simple Express-based test server with health checks, statistics, and logging.

## Features
- **Health Check**: `/health`
- **Echo**: `/echo` (POST)
- **Version**: `/version`
- **Stats**: `/stats`
- **Ping**: `/ping`
- **Logging**: Integrated request logging middleware.
- **Error Handling**: Graceful 404 responses.

## Getting Started
1. Install dependencies: `npm install`
2. Start server: `node app.js`
3. Default port is `3000`.
