import { loadUsers, saveUsers, hash } from '../utils/helpers.js';
import { log } from '../utils/logger.js'; // Import Logger

export function handleConnection(ws, wss) {
    ws.username = null;

    ws.on('close', () => {
        log('WS', 'Conn', `Connection closed.`);
    });

    ws.on('error', (err) => {
        log('ERROR', 'Socket', `WebSocket error: ${err.message}`);
    });

    ws.on('message', (msg) => {
        // LOG EVERYTHING: Raw incoming message size/content
        console.log('DEBUG', 'Raw', `Received payload: ${msg.toString()}`);

        let data;
        try {
            data = JSON.parse(msg);
        } catch (e) {
            log('ERROR', 'Parser', 'Invalid JSON received', { payload: msg.toString() });
            return;
        }

        switch (data.type) {
            case '1':
                example(ws, data);
                break;

            case '2':
                example(ws, wss, data);
                break;

            default:
                log('WARN', 'Router', `Unknown message type: ${data.type}`);
        }
    });
}

function example(ws, data) {
    log('INFO', '..', `...: ${data}`);
    // do something
    log('INFO', '...', `... successful: ${data}`);
}

function example2(ws, wss, data) {
    if (!ws) {
        log('WARN', '...', '...');
        return;
    }

    log('INFO', '...', `... ${ws}: ${data}`);

    const payload = JSON.stringify({
        type: '...',
        message: data
    });

    let recipients = 0;
    wss.clients.forEach(c => {
        if (c.readyState === 1 && c !== ws) {
            c.send(payload);
            recipients++;
        }
    });

    log('DEBUG', '...', `... ${recipients}`);
}