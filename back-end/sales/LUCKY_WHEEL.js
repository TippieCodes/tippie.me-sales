const RequestType = require("../requesttype")


class LuckyWheelRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {

    }
}
module.exports = new LuckyWheelRequest("LUCKY_WHEEL");