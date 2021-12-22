const WebSocket = require('ws')

class Endpoint {
    /**
     * Constructor of a new websocket endpoint, must be called after extending this class for your own endpoint as following
     * @code module.exports = new ExampleEndpoint('/')
     * then the websocket will be read once a request is done on that url, wss://websocket.example/ws .
     */
    constructor() {
        this.wss = new WebSocket.Server({noServer: true});
        this.wss.users = []
        this.wss.on('connection', (ws, request) => {
            this.authenticate(ws, request, (client, err) => {
                if (err || !client) {
                    ws.send(JSON.stringify({type: 'UNAUTHORIZED', data: err}))
                    ws.close()
                    return;
                }
                let user = {
                    ws: ws,
                    client: client
                }
                this.wss.users.push(user)
                ws.on('close', () => {
                    const index = this.wss.users.indexOf(user)
                    if (index > -1) this.wss.users.splice(index,1)
                });
                ws.send(JSON.stringify({type: 'CONNECTED', data: client}));
                this.connection(ws, request, client)
            })
        });
    }

    authenticate(ws, request, callback) {
        let err = undefined
        let client = {
            name: "anonymous"
        }
        callback.call(err, client);
    }

    upgrade(ws, request) {
        this.wss.emit('connection', ws, request);
    }

    /**
     * @abstract
     */
    message(wss, ws, request, client, data) {
        throw new Error('Abstract function not initialised.')
    }

    /**
     * Called when the websocket endpoint is loaded, use this to start any other services interacting with the websocket such as a REST api or Discord bot.
     */
    onLoad() {

    }
    

    connection(ws, request, client) {
        ws.on('message', (data) => {
            this.message(this.wss, ws, request, client, data)
        });
    };

}
module.exports = Endpoint