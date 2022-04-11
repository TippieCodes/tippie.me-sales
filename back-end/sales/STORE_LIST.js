const RequestType = require("../requesttype");

class StoreListRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_admin_store_list"] != true) return;
        const conn = require("../sales").getDatabase(0);
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

module.exports = new StoreListRequest("STORE_LIST");