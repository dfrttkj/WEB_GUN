import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import constants from './config/constants.js';
import handler from './utils/handler.js';

const server = createServer((req, res) => {
    const ip = req.socket.remoteAddress;
    console.log('HTTP', 'Server', `${req.method} ${req.url} from ${ip}`);
});

const wss = new WebSocketServer({
    server,
    path: constants.WS_PATH
});

wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log('WS', 'Conn', `New connection established from ${ip}`);
});

wss.on('message', (message) => {
    console.log(message.toString());

    let data;
    try {
        data = JSON.parse(message);
    } catch (error) {
        console.log("Data could not be read");
    } 

    if (data) {
        handler.handleMessage(message);
    }
});

server.listen(constants.PORT, constants.HOST, async () => {
    console.log('INFO', 'System', `Server started on port ${constants.PORT}`);
    console.log('----------------------------------------');
    console.log(`Server running at http://${constants.HOST}:${constants.PORT}`);
});