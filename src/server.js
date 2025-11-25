import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import { handleHttpRequest } from './routes/api.js';
import { handleConnection } from './websocket/handlers.js';
import { getServerIp } from './utils/helpers.js';
import { PORT, HOST } from './config/constants.js';
import { log } from './utils/logger.js'; // Import Logger

const server = createServer((req, res) => {
    // LOG EVERYTHING: Incoming HTTP Request
    const ip = req.socket.remoteAddress;
    log('HTTP', 'Server', `${req.method} ${req.url} from ${ip}`);

    handleHttpRequest(req, res);
});

const wss = new WebSocketServer({
    server,
    path: '/chat'   // ws://HOST:PORT/chat
});

wss.on('connection', (ws, req) => {
    // LOG EVERYTHING: New WebSocket Connection
    const ip = req.socket.remoteAddress;
    log('WS', 'Conn', `New connection established from ${ip}`);

    handleConnection(ws, wss);
});

server.listen(PORT, HOST, async () => {
    const ip = await getServerIp();

    log('INFO', 'System', `Server started on port ${PORT}`);
    console.log('----------------------------------------');
    console.log(`Server running at http://${HOST}:${PORT}`);
});