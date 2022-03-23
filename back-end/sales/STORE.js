const RequestType = require("../requesttype")

class StoreRequest extends RequestType{
    async onRequest(wss, ws, request, client, data, incoming) {
        // const conn = require("../sales").getDatabase(0);
        // let store = await conn.query(`SELECT * FROM stores WHERE store_id = ? LIMIT 1;`, [client.store]);
        ws.send(JSON.stringify({type: "STORE", data: require("../sales").getStore(client.store)}))
    }
}
module.exports = new StoreRequest("STORE");