const RequestType = require("../requesttype");

class StoreUpdateRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_admin_store_modify"] != true) return;
        const conn = require("../sales").getDatabase(0);
        const types = ["store_name", "store_url_friendly", "logo_url", "favicon_url", "login_side_image", "login_side_text_header", "login_side_text_body"]
        if (!types.includes(incoming.data.type)) {
            ws.send(JSON.stringify({
                type: "STORE_UPDATE", data: {
                    message: "This type cannot be modified."
                }
            }))
            return;
        }
        try {
            await conn.query('UPDATE stores SET ' + incoming.data.type + ' = ? WHERE store_id = ?', [incoming.data.new_value, incoming.data.store]);
            ws.send(JSON.stringify({
                type: "STORE_UPDATE", data: {
                    ok: true
                }
            }))
        } catch (e) {
            ws.send(JSON.stringify({
                type: "STORE_UPDATE", data: {
                    message: e.message
                }
            }))
        }
        let response = {
            type: 'STORE_LIST',
            data: {
                stores: null
            }
        }
        response.data.stores = await conn.query('SELECT store_id, store_name, store_url_friendly FROM stores');
        ws.send(JSON.stringify(response))
    }
}

module.exports = new StoreUpdateRequest("STORE_UPDATE");