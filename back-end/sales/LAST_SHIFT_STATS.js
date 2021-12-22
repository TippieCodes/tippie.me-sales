const utils = require("../utils");

const RequestType = require("../requesttype")

class LastShiftStatsRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_shift_stats"] != true) return;
        const conn = require("../sales").getDatabase(client.store);let a = await conn.query('SELECT * FROM shifts order by started_at DESC LIMIT 1;')
        let last_shift = a[0]
        let global = {
            total: 0,
            orders: 0,
            items: 0,
            isEnded: a[0].shift_ended
        }
        let personal = {
            total: 0,
            orders: 0,
            items: 0,
            owe: 0,
            isEnded: a[0].shift_ended
        }
        let shift_orders = await conn.query('SELECT * FROM orders WHERE order_shift = ? ORDER BY order_id DESC', [last_shift.shift_id])
        for (let i = 0; i < shift_orders.length; i++) {
            let order = shift_orders[i];
            let items = JSON.parse(order.order_items)
            if (order.order_employee.toString() === client.user_id.toString()) {
                personal.total += order.order_total
                personal.orders++;
                personal.owe += order.order_owe
                for (let o = 0; o < items.length; o++) {
                    personal.items += items[o].amount
                }
            }
            global.total += order.order_total
            global.orders++;
            for (let c = 0; c < items.length; c++) {
                global.items += items[c].amount
            }
        }

        const items = await conn.query('SELECT * FROM stock');
        const users = await conn.query('SELECT user_id, user_name FROM users')
        for (let order of shift_orders){
            let n = users.find(a => a.user_id == order.order_employee);
            order.name = (n) ? n.user_name : 'n/a'
            order.id = order.order_id;
            order.items = JSON.parse(order.order_items)
            for (let item of order.items){
                let itm = items.find(a => a.item_id == item.id)
                if (itm){
                    item.name = itm.item_name;
                    item.price = itm.sell_price;
                } else {
                    item.name = 'n/a';
                    item.price = '...'
                }
            }
            order.total = order.order_total
        }
        ws.send(JSON.stringify({
            type: 'RECENT_ORDERS',
            data:{
                orders: shift_orders
            }
        }))
        ws.send(JSON.stringify({
            type: 'SHIFT_PERSONAL_STATS',
            data: personal
        }))
        ws.send(JSON.stringify({
            type: 'SHIFT_GLOBAL_STATS',
            data: global
        }))
    }
}
module.exports = new LastShiftStatsRequest("LAST_SHIFT_STATS");