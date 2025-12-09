import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import constants from './config/constants.js';

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

wss.on('message', ()=>{
    
})

server.listen(constants.PORT, constants.HOST, async () => {
    console.log('INFO', 'System', `Server started on port ${constants.PORT}`);
    console.log('----------------------------------------');
    console.log(`Server running at http://${constants.HOST}:${constants.PORT}`);
});