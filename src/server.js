import { WebSocketServer } from "ws";
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOST = '0.0.0.0';
const PORT = 8080;

const server = createServer((req, res) => {
    if (req.url === '/') {
        const index = fs.readFileSync(path.join(__dirname, 'index.html'));
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(index);
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

const wss = new WebSocketServer({ 
    noServer: true,
    path: "/ESP"
});


/*
ESP (Player X) -> Server
{
    'player': {
        'PlayerID': xx
        'TeamID': xx
    }
    'message': {
        'variable': xx
        'change': xx
        'current': xx
    }
}

Server -> ESP (Player X)
{
    'player': {
        'PlayerID': xx
        'TeamID': xx
    }
    'message': {
        'variable': xx
        'change': xx
        'current': xx
    }
}

*/

wss.on('connection', (ws) => {
    ws.username = null;

    ws.on('message', (data) => {

    });
});

// Start server
server.listen(PORT, HOST, () => {
    console.log(`You can test with: ws:/${HOST}:${PORT}/ESP`);
    console.log(`You can connet to: http://${HOST}:${PORT}`);
});