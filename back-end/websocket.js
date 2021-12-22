
const WebSocket = require('ws');
const url = require('url');
const fs = require('fs')
const Enmap = require('enmap')
const server = http.createServer();

WebSocket.endpoints = new Enmap();

fs.readdir("./endpoints/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./endpoints/${file}`);
        let endpointName = file.split(".")[0];
        console.log(`Attempting to load endpoint ${endpointName}`);
        WebSocket.endpoints.set(endpointName, props);
        props.onLoad();
    });
});

server.on('upgrade', function upgrade(request, socket, head) {
    const pathname = url.parse(request.url).pathname;
    const endpoint = WebSocket.endpoints.find(endpoint => endpoint.url === pathname);
    if (!endpoint) return socket.destroy();
    endpoint.wss.handleUpgrade(request, socket, head, function done(ws) {
        endpoint.upgrade(ws, request)
    });
});

server.listen(3000)
