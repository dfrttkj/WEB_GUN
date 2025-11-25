import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const LOG_DIR = path.resolve('logs');
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

const LOG_FILE = path.join(LOG_DIR, 'server.log');

function getTimestamp() {
    return new Date().toISOString();
}

/**
 * Main logging function
 * @param {string} level - INFO, WARN, ERROR, DEBUG, HTTP, WS
 * @param {string} category - Where the log is coming from (e.g., 'Auth', 'Server')
 * @param {string} message - The main log message
 * @param {any} [data] - Optional object/data to stringify
 */
export function log(level, category, message, data = null) {
    const timestamp = getTimestamp();

    // 1. Format for Console (Visual)
    let consoleOutput = `[${timestamp}] [${level}] [${category}] ${message}`;
    /*
    if (data) {
        console.log(consoleOutput, data);
    } else {
        console.log(consoleOutput);
    }
    */

    // 2. Format for File (Text)
    let fileOutput = `${timestamp} | ${level.padEnd(5)} | ${category.padEnd(10)} | ${message}`;
    if (data) {
        fileOutput += ` | DATA: ${JSON.stringify(data)}`;
    }
    fileOutput += '\n';

    // 3. Write to file
    try {
        fs.appendFileSync(LOG_FILE, fileOutput);
    } catch (err) {
        console.error("FAILED TO WRITE TO LOG FILE", err);
    }
}