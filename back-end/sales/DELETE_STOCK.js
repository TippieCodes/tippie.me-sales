const utils = require("../utils");

const RequestType = require("../requesttype")

class DeleteStockRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_manage_stock"] != true) return;
        const conn = require("../sales").getDatabase(client.store);
        try {
            await conn.query(`DELETE FROM stock WHERE (item_id = ?);`, [incoming.data.id])
        } catch (e) {
            ws.send(JSON.stringify({type: "ERROR", data: e.errno}))
            console.log(e);
            return;
        }
        ws.send(JSON.stringify({type: "OK"}))
    }
}
module.exports = new DeleteStockRequest("DELETE_STOCK");