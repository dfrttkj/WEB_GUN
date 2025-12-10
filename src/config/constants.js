const path = require("path");

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const WS_PATH = process.env.PATH || '/';
const USERS_FILE = path.resolve('users.json');
const PUBLIC_DIR = path.resolve('public');

module.exports = {
    PORT,
    HOST,
    WS_PATH,
    USERS_FILE,
    PUBLIC_DIR
}