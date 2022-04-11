const RequestType = require("../requesttype");

class StoreDeleteRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_admin_store_delete"] != true) return;
        const conn = require("../sales").getDatabase(0);
        const result = await conn.query("SELECT * FROM stores WHERE store_id = ?", [incoming.data.store])
        if (!result[0]) {
            ws.send(JSON.stringify({
                type: "STORE_DELETE", data: {
                    message: "This store does not exists."
                }
            }));
            return;
        }

        if (!/sales-[a-z\-]+/.test(result[0].store_database)) {
            ws.send(JSON.stringify({
                type: "STORE_DELETE", data: {
                    message: "Database name of this store is invalid, please contact Tippie#6666."
                }
            }))
            return;
        }

        await conn.query("DROP DATABASE `" + result[0].store_database + "`");
        await conn.query("DELETE FROM stores WHERE store_id = ?", [result[0].store_id]);
        await require("../sales.js").updateStores();
        ws.send(JSON.stringify({
            type: "STORE_DELETE", data: {
                ok: true
            }
        }))
    }
}

module.exports = new StoreDeleteRequest("STORE_DELETE");