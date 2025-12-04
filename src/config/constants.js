import path from 'path';

export const PORT = process.env.PORT || 8080;
export const HOST = process.env.HOST || '0.0.0.0';
export const WS_PATH = process.env.PATH || '/'
export const USERS_FILE = path.resolve('users.json');
export const PUBLIC_DIR = path.resolve('public');
