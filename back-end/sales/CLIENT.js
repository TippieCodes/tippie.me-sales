const RequestType = require("../requesttype")

class ClientRequest extends RequestType{
    onRequest(wss, ws, request, client, data, incoming) {
        let response = {
            type: 'CLIENT',
            data: client
        }
        ws.send(JSON.stringify(response))
    }
}
module.exports = new ClientRequest("CLIENT");