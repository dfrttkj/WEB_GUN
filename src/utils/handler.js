const fs = require('fs');

const directory = './src/events/';
let routes = [];

loadRoutes();


function handleMessage(message) {
    const events = new Map([
        ["connect", routes.filter(obj => Object.keys(obj)[0] === "connectGunAndSave")[0][connectGunAndSave]],
        ["hit", routes.filter(obj => Object.keys(obj)[0] === "registerHit")[0][registerHit]],
        ["kill", routes.filter(obj => Object.keys(obj)[0] === "registerKill")[0][registerKill]],
        ["gamestart", routes.filter(obj => Object.keys(obj)[0] === "startGame")[0]]
    ]);
    console.log(["hit", routes.filter(obj => Object.keys(obj)[0] === "registerKill")[0]]);
    /*
    if (events.has(message.type)) {
        return events.get(message.type)(message);
    }
        */
}

async function loadRoutes() {
    if (fs.existsSync(directory)) {
        routes = fs.readdirSync(directory).filter(file => file.endsWith(".js"));
        for (const key in routes) {
            const importString = '../events/' + routes[key];
            routes[key] = require(importString);
        }
    }
}

