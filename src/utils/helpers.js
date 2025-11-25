import fs from 'fs';
import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import { USERS_FILE } from '../config/constants.js';

// File I/O for Users
export function loadUsers() {
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    } catch (e) {
        return {};
    }
}

export function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Security
export function hash(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Network Utility
export async function getServerIp() {
    try {
        const execAsync = promisify(exec);
        // Attempt to get WLAN IP, fallback if fails
        const { stdout } = await execAsync(`ip -4 addr show wlan0 | grep -oP '(?<=inet\\s)\\d+(\\.\\d+){3}'`).catch(() => ({ stdout: 'localhost' }));
        return stdout.trim() || 'localhost';
    } catch (e) {
        return 'localhost';
    }
}