import { WebSocketServer } from "ws";
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';

const __filename = "WEB_GUN";
const __dirname = path.dirname(__filename);
const handlURL = new Map([
    ["/", getAndSendHTML],
    ["/styles/main.css", getAndSendCSS],
    ["/scripts/startPage.js", getAndSendJS],
    ["default", getNotFound]
]);

const HOST = 'localhost';
const PORT = 8080;

const server = createServer((req, res) => {

    if (handlURL.has(req.url)) {
        handlURL.get(req.url)(req, res);
    } else {
        handlURL.get("default")(req, res);
    }
});

const wss = new WebSocketServer({ 
    noServer: true,
    path: "/ESP"
});

function getAndSendHTML(_req, res) {
    try {
        const html = fs.readFileSync(path.resolve(__dirname, './src/Web/index.html'), 'utf-8');
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(html);
    } catch (error) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Internal Server Error');
    }
}

function getAndSendCSS(_req, res) {
    try {
        const css = fs.readFileSync(path.resolve(__dirname, './src/Web/styles/main.css'), 'utf-8');
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.end(css);
    } catch (error) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Internal Server Error');
    }
}

function getAndSendJS(_req, res) {
    try {
        const css = fs.readFileSync(path.resolve(__dirname, './src/Web/scripts/startPage.js'), 'utf-8');
        res.writeHead(200, {'Content-Type': 'text/javascript'});
        res.end(css);
    } catch (error) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Internal Server Error');
    }
}

function getNotFound(_req, res) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
}


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