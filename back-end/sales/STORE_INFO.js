const RequestType = require("../requesttype");

class StoreInfoRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_admin_store_info"] != true) return;
        const conn = require("../sales").getDatabase(incoming.data.store);
        if (!conn) return;
        const store = await require("../sales").getDatabase(0).query('SELECT * FROM stores WHERE store_id = ?', [incoming.data.store]);
        /*const order_info = await conn.query('SELECT COUNT(*) AS order_count, SUM(order_total) AS order_total, SUM(order_owe) AS order_owe FROM orders');
        const stock_info = await conn.query('SELECT COUNT(*) AS stock_count FROM stock');
        const employee_info = await conn.query('SELECT COUNT(*) AS employee_count WHERE disabled = 0 FROM users');
        const shift_info = await conn.query('SELECT COUNT(*) AS shift_count');*/
        let response = {
            type: 'STORE_INFO',
            data: {
                store: store[0] /*,
                employees: {
                    count: employee_info[0].employee_count
                },
                stock: {
                    count: stock_info[0].stock_count
                },
                orders: {
                    count: order_info[0].order_count,
                    total: order_info[0].order_total,
                    owe: order_info[0].order_owe
                },
                shifts: {
                    count: shift_info[0].shift_count
                } */
            }
        }
        ws.send(JSON.stringify(response))
    }
}

module.exports = new StoreInfoRequest("STORE_INFO");