const RequestType = require("../requesttype")

class AddStockRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        const conn = require("../sales").getDatabase(client.store);
        if (client.role["permission_manage_stock"] != true) return;
        try {
            await conn.query(`INSERT INTO stock (category, menu_item, item_name, sell_price, shipment_price, stock, chest_id) VALUES (?, ?, ?, ?, ?, ?, ?);`, [incoming.data.category, incoming.data.menuitem, incoming.data.itemname, incoming.data.sellprice, incoming.data.shipmentprice, incoming.data.stock, incoming.data.chest])
        } catch (e) {
            ws.send(JSON.stringify({type: "ERROR", data: e.errno}))
            console.log(e)
            return;
        }
        ws.send(JSON.stringify({type: "OK"}))
    }
}
module.exports = new AddStockRequest("ADD_STOCK");