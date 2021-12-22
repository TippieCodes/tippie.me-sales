const RequestType = require("../requesttype")

class UpdateStockRequest extends RequestType{
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_manage_stock"] != true) return;
        const conn = require("../sales").getDatabase(client.store);
        try {
            await conn.query(`UPDATE stock SET category = ?, menu_item = ?, item_name = ?, sell_price = ?, shipment_price = ?, stock = ?, chest_id = ? WHERE (item_id = ?);`, [incoming.data.category, incoming.data.menuitem, incoming.data.itemname, incoming.data.sellprice, incoming.data.shipmentprice, incoming.data.stock,incoming.data.chest, incoming.data.id])
        } catch (e) {
            ws.send(JSON.stringify({type: "ERROR", data: e.errno}))
            console.log(e);
            return;
        }
        ws.send(JSON.stringify({type: "OK"}))
    }
}
module.exports = new UpdateStockRequest("UPDATE_STOCK");