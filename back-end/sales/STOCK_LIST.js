const utils = require("../utils");

const RequestType = require("../requesttype")

class StockListRequest extends RequestType{
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_list_stock"] != true) return;
        const conn = require("../sales").getDatabase(client.store);
        let response = {
            type: 'STOCK_LIST',
            data: []
        }
        response.data = await conn.query('SELECT * FROM stock');
        ws.send(JSON.stringify(response))
    }
}
module.exports = new StockListRequest("STOCK_LIST");