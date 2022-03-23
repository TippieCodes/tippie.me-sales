const utils = require("../utils");

const RequestType = require("../requesttype")

class ShiftInfoRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_view_shift"] != true) return;
        const conn = require("../sales").getDatabase(client.store);
        let response = {
            type: 'SHIFT_INFO',
            data: null
        }
        let shift_info = await conn.query('SELECT * FROM shifts WHERE shift_id = ? LIMIT 1', [incoming.id])
        shift_info = shift_info[0]
        if (shift_info.stat_orders != null) {
            response.data = {
                orders: shift_info.stat_orders,
                items: shift_info.stat_items,
                sales: shift_info.stat_sales,
                owe: shift_info.stat_owe,
                order_list: []
            }
        }
        response.data.order_list = await conn.query('SELECT * FROM orders WHERE order_shift = ?', [incoming.id])
        let users = await conn.query('SELECT user_id, user_name FROM users')
        for (let order of response.data.order_list){
            let employee_name = users.find(a => a.user_id == order.order_employee)
            order.employee_name = (employee_name) ? employee_name.user_name : 'n/a'
        }

        let items = await conn.query('SELECT * FROM stock')
        for (let order of response.data.order_list){
            order.order_items = JSON.parse(order.order_items);
            for (let item of order.order_items){
                let itm = items.find(a => a.item_id == item.id)
                if (itm){
                    item.name = itm.item_name;
                    item.price = itm.sell_price;
                } else {
                    item.name = 'undefined';
                    item.price = '...'
                }
            }
        }
        ws.send(JSON.stringify(response));
    }
}
module.exports = new ShiftInfoRequest("SHIFT_INFO");