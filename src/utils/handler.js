import fs from 'fs';

const directory = './src/routes/';

export default function handleMessage() {
    
}

function loadRoutes() {
    if (fs.existsSync(directory)) {
        const routes = fs.readdirSync(directory).filter(file => file.endsWith(".js"));
        for (const value of routes) {
            const importString = './src/routes/' + value;
        }
    }
}