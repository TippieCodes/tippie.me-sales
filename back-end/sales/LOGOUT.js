const utils = require("../utils");

const RequestType = require("../requesttype")

class LogoutRequest extends RequestType{
    onRequest(wss, ws, request, client, data, incoming) {
        const conn = require("../sales").getDatabase(client.store);let token = utils.getCookie(request, 'session_token')
        conn.query(`DELETE FROM sessions WHERE session_token = ?;`, [token])
    }
}
module.exports = new LogoutRequest("LOGOUT");