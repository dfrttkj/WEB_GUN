const fs = require("fs");

//#region create website
function sendCreateHTML(_req, res) {
    const html = fs.readFileSync("./public/create.html");
    res.statusCode = 200;
    res.setHeader("content-type", "text/html");
    res.end(html);

}

function sendCreateCSS(_req, res) {
    const css = fs.readFileSync("./public/styles/create.css");
    res.statusCode = 200;
    res.setHeader("content-type", "text/css");
    res.end(css);
}

function sendCreateJS(_req, res) {
    const js = fs.readFileSync("./public/scripts/create.js");
    res.statusCode = 200;
    res.setHeader("content-type", "application/javascript");
    res.end(js);
}
//#endregion

function sendHomeHTML(_req, res) {
    const html = fs.readFileSync("./public/home.html");
    res.statusCode = 200;
    res.setHeader("content-type", "text/html");
    res.end(html);
}

function sendLeaderboardHTML(_req, res) {
    const html = fs.readFileSync("./public/leaderboard.html");
    res.statusCode = 200;
    res.setHeader("content-type", "text/html");
    res.end(html);
}

function sendNotfound(_req, res) {
    res.statusCode = 404
    res.setHeader("content-type", "text/plain");
    res.end("not found");
}

module.exports = {
    sendCreateCSS,
    sendCreateHTML,
    sendHomeHTML,
    sendLeaderboardHTML,
    sendNotfound,
    sendCreateJS
}