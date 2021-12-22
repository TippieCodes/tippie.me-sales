class RequestType {
    constructor(name) {
        this.name = name;
    }

    /**
     * @abstract
     */
    onRequest(wss, ws, request, client, data, incoming) {
        throw new Error('Abstract function not initialised.')
    }
}
module.exports = RequestType