const { createServer } = require('http');
const WebSocket = require('ws');
const constants = require('./config/constants.js');
const handler = require('./utils/handler.js');
//const {log} = require('./utils/logger.js');
const fs = require('fs');
const api = require('./routes/api.js');

// http server handler
const server = createServer((req, res) => {
    const ip = req.socket.remoteAddress;
    console.log('HTTP', 'Server', `${req.method} ${req.url} from ${ip}`);

    api.handleHttpRequest(req, res);
});

// neuen Websocket
const wss = new WebSocket.WebSocketServer({
    server,
    path: constants.WS_PATH
});

wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log('WS', 'Conn', `New connection established from ${ip}`);
    
    ws.send(JSON.stringify({hi: "hallo"}));

    // Websocket handler
    ws.on('message', (message) => {
        console.log(message.toString());

        let data;
        try {
            data = JSON.parse(message);
            console.log(data);
        } catch (error) {
            console.log("Data could not be read");
        } 

        if (data) {
            handler.handleMessage(message);
        }
        
    });
});

server.listen(constants.PORT, constants.HOST, async () => {
    console.log('INFO', 'System', `Server started on port ${constants.PORT}`);
    console.log('----------------------------------------');
    console.log(`Server running at http://${constants.HOST}:${constants.PORT}`);
});