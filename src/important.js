const { createServer } = require('http');
const ws = require('ws');
const constants = require('./config/constants.js');
const handler = require('./utils/handler.js');
const routesHandler = require('./routes/HTMLRoutes.js');
//const {log} = require('./utils/logger.js');
const fs = require('fs');

const routes = new Map([
    ["/create", routesHandler.sendCreateHTML],
    ["/home", routesHandler.sendHomeHTML],
    ["/leaderboard", routesHandler.sendLeaderboardHTML],
    ["/styles/create.css", routesHandler.sendCreateCSS],
    ["/scripts/create/main.js", routesHandler.sendCreateJS]
]);

// http server handler
const server = createServer((req, res) => {
    const ip = req.socket.remoteAddress;
    console.log('HTTP', 'Server', `${req.method} ${req.url} from ${ip}`);

    if (routes.has(req.url)) {
        routes.get(req.url)(req, res);
    } else {
        routesHandler.sendNotfound(req, res);
    }
});

// neuen Websocket
const wss = new ws.WebSocketServer({
    server,
    path: constants.WS_PATH
});

wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log('WS', 'Conn', `New connection established from ${ip}`);

    // Websocket handler
    wss.on('message', (message) => {
        console.log(message.toString());

        let data;
        try {
            data = JSON.parse(message);
        } catch (error) {
            log("Data could not be read");
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