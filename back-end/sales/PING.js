const RequestType = require("../requesttype")

class PingRequest extends RequestType {
    onRequest(wss, ws, request, client, data, incoming) {
        ws.send(JSON.stringify({
            type: 'PONG', data: {
                client: client,
                store: require("../sales").getStore(client.store)
            }
        }));
    }
}

module.exports = new PingRequest("PING");