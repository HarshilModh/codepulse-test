const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../data/db.json');

/**
 * Initializes the database file and directory if they do not exist.
 */
function init() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({ scans: [] }, null, 2));
    }
}

/**
 * Reads data from the JSON database.
 * @returns {Object} Database content
 */
function readData() {
    init();
    try {
        const content = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(content);
    } catch (err) {
        console.error("Error reading database:", err);
        return { scans: [] };
    }
}

/**
 * Writes data safely to the database using an atomic write-then-rename approach.
 * @param {Object} data - Content to write
 * @returns {boolean} Success status
 */
function writeData(data) {
    init();
    try {
        const tempFile = DB_FILE + '.tmp';
        fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
        fs.renameSync(tempFile, DB_FILE);
        return true;
    } catch (err) {
        console.error("Error writing database:", err);
        return false;
    }
}

/**
 * Retrieves all scan logs in reverse chronological order.
 * @returns {Array} Scan records
 */
function getScans() {
    return readData().scans || [];
}

/**
 * Adds a new scan log to the database.
 * @param {Object} scan - Scan record metadata and findings
 * @returns {Object} Newly created scan record with ID and timestamp
 */
function addScan(scan) {
    const data = readData();
    if (!data.scans) data.scans = [];
    
    const newScan = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
        timestamp: new Date().toISOString(),
        ...scan
    };
    
    data.scans.unshift(newScan); // Prepend to show newest first
    
    // Limit to latest 100 entries to prevent file size bloat
    if (data.scans.length > 100) {
        data.scans = data.scans.slice(0, 100);
    }
    
    writeData(data);
    return newScan;
}

/**
 * Clears all scan logs.
 * @returns {boolean} Success status
 */
function clearScans() {
    return writeData({ scans: [] });
}

module.exports = {
    init,
    getScans,
    addScan,
    clearScans
};
