const RequestType = require("../requesttype");
const {readFileSync} = require("fs");

class StoreDeleteRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_admin_store_create"] != true) return;
        const conn = require("../sales").getDatabase(0);


        const database = incoming.data.database;
        if (!/sales-[a-z\-]+/.test(database)) {
            ws.send(JSON.stringify({
                type: "STORE_CREATE", data: {
                    message: "Database name is invalid. Database name must start with 'sales-' and only contain lowercase letters or '-'."
                }
            }))
            return;
        }
        await conn.query("INSERT INTO STORES (a,b,c) VALUES (?, ?, ?)", [incoming.data.store]) //TODO: Check what's actually needed here

        const createScript = readFileSync("create-databases.sql")
        const finalScript = createScript.toString().replaceAll("{database}", database)
        await conn.query(finalScript)
        ws.send(JSON.stringify({
            type: "STORE_CREATE", data: {
                ok: true
            }
        }))
    }
}

module.exports = new StoreDeleteRequest("STORE_DELETE");