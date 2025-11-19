import { WebSocketServer } from "ws";
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';

const __filename = "WEB_GUN";
const __dirname = path.dirname(__filename);

const HOST = 'localhost';
const PORT = 8080;

const server = createServer((req, res) => {
    switch (req.url) {
      case '/':
        try {
            const html = fs.readFileSync('./Web/index.html', 'utf-8');
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(html);
        } catch (error) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Internal Server Error');
        }
        break;
      
      case '/styles/main.css':
        try {
            const css = fs.readFileSync('./Web/styles/main.css', 'utf-8');
            res.writeHead(200, {'Content-Type': 'text/css'});
            res.end(css);
        } catch (error) {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('CSS not found');
        }
        break;

        default:
        res.statusCode = 404;
        res.setHeader('content-type', 'text/plain');
        res.write('not found');
        res.write('!');
        res.end();
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

let website = [];
let ESP = {};

wss.on('connection', (ws) => {
    ws.username = null;

    ws.on('message', (data) => {
        const name = JSON.parse(data);
    });
});

// Start server
server.listen(PORT, HOST, () => {
    console.log(`You can test with: ws:/${HOST}:${PORT}/ESP`);
    console.log(`You can connet to: http://${HOST}:${PORT}`);
});