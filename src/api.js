import fs from 'fs';
import path from 'path';
import { PUBLIC_DIR } from './config/constants.js';
import { log } from './utils/logger.js'; // Import Logger

const fs = require('fs');
const path = require('path');
const {PUBLIC_DIR} = require('./config/constants.js');
const {log} = require('./utils/logger.js');

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
};

export function handleHttpRequest(req, res) {
    let filePath = req.url === '/'
        ? path.join(PUBLIC_DIR, 'config.html')
        : path.join(PUBLIC_DIR, req.url);

    const extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                log('WARN', 'HTTP', `404 Not Found: ${req.url}`);
                res.writeHead(404);
                res.end('404: File Not Found');
            } else {
                log('ERROR', 'HTTP', `500 Internal Error loading ${req.url}`, error);
                res.writeHead(500);
                res.end('500: Internal Server Error');
            }
        } else {
            // success
            log('INFO', 'HTTP', `200 OK: ${req.url} (${contentType})`);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}