const fs = require('fs');
const { connectGunAndSave } = require('../routes/gunConnect');
const { registerKill } = require('../routes/kill');

const directory = './src/routes/';
let routes = [];

loadRoutes();


function handleMessage(message) {
    const events = new Map([
        ["connect", routes.filter(obj => Object.keys(obj)[0] === "connectGunAndSave")[0][connectGunAndSave]],
        ["hit", routes.filter(obj => Object.keys(obj)[0] === "connectGunAndSave")[0][connectGunAndSave]],
        ["kill", routes.filter(obj => Object.keys(obj)[0] === "connectGunAndSave")[0][connectGunAndSave]],
        ["gamestart", routes.filter(obj => Object.keys(obj)[0] === "startGame")[0]]
    ]);
    console.log(["hit", routes.filter(obj => Object.keys(obj)[0] === "registerKill")[0]]);
    /*
    if (events.has(message.type)) {
        return events.get(message.type)(message);
    }
        */
}

handleMessage();

async function loadRoutes() {
    if (fs.existsSync(directory)) {
        routes = fs.readdirSync(directory).filter(file => file.endsWith(".js"));
        for (const key in routes) {
            const importString = '../routes/' + routes[key];
            routes[key] = require(importString);
        }
    }
}

