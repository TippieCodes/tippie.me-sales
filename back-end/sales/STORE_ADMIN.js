const RequestType = require("../requesttype");
const utils = require("../utils");

class StoreAdminRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_admin_store_admin"] != true) return;
        const token = Math.floor(new Date().getTime() * Math.random() * 100)
        const expiry = new Date(new Date().getTime() + (1000 * 60 * 60)); // Valid for 1 hour, for some reason it always takes UTC
        await require("../sales").getDatabase(0).query(`INSERT INTO sessions (session_token, session_user, session_expiry, session_store) VALUES (?,?,?,?);`, [token, 0, utils.mysqlDate(expiry), incoming.data.store])
        let response = {
            type: 'STORE_ADMIN',
            data: {
                new_token: token
            }
        }
        ws.send(JSON.stringify(response))
    }
}

module.exports = new StoreAdminRequest("STORE_ADMIN");