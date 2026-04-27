const { execSync } = require('child_process');
const fs = require('fs');

// Vulnerability: OS Command Injection
function backupDatabase(dbName) {
    // Dangerous: taking user input directly into an OS command
    console.log("Starting backup for: " + dbName);
    const result = execSync(`mysqldump -u root -p password ${dbName} > backup.sql`);
    return result.toString();
}

// Dead Code:
const MAX_BACKUPS = 5;
function cleanupBackups() {
    console.log("Cleaning up backups...");
}

module.exports = { backupDatabase };
