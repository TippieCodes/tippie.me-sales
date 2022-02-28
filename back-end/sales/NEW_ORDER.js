const utils = require("../utils");

const RequestType = require("../requesttype")

class NewOrderRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_sell"] != true) return;
        const conn = require("../sales").getDatabase(client.store);let a = await conn.query(`SELECT * FROM shifts WHERE shift_ended = 0`)
        let current_shift = a[0];
        if (!current_shift) {
            ws.send(JSON.stringify({
                type: 'ERROR',
                data: "You may not make a new order when there is no active shift."
            }))
            return;
        }
        let total = 0
        let stock = await conn.query('SELECT * FROM stock')
        for (let i = 0; i < incoming.data.length; i++) {
            let item = incoming.data[i]
            let stock_item = stock.find(a => a.item_id === item.id)
            total += item.amount * stock_item.sell_price
            await conn.query('UPDATE stock SET stock = ? WHERE (item_id = ?);', [stock_item.stock - item.amount, item.id])
        }
        let stock_updated = await conn.query('SELECT * FROM stock')
        wss.users.filter(user => user.client.store == client.store).forEach(user=> {
            user.ws.send(JSON.stringify({
                type: 'STOCK_LIST',
                data: stock_updated
            }))
        })
        try {
            await conn.query('INSERT INTO orders (order_shift, order_employee, order_items, order_total, order_owe) VALUES (?, ?, ?,?,?);', [current_shift.shift_id, client.user_id, JSON.stringify(incoming.data), total, Math.floor(total * (client.owe_percentage / 100))])
            ws.send(JSON.stringify({type: "OK"}))
        } catch (e) {
            ws.send(JSON.stringify({
                type: 'ERROR',
                data: e
            }))
            console.log(e)
        }
        let personal = await utils.getEmployeeShiftStats(client, conn, client.user_id)
        ws.send(JSON.stringify({
            type: 'SHIFT_PERSONAL_STATS',
            data: personal
        }))

        let global = await utils.getGlobalShiftStats(client, conn)
        let items = await conn.query('SELECT * FROM stock')
        for (let item of incoming.data){
            let itm = items.find(a => a.item_id == item.id)
            if (itm){
                item.name = itm.item_name;
                item.price = itm.sell_price;
            } else {
                item.name = 'undefined';
                item.price = '...'
            }
        }
        let id = await conn.query('SELECT order_id FROM orders ORDER BY order_id DESC LIMIT 1; ')
        id = id[0];
        wss.users.filter(user => user.client.store == client.store).forEach(user=> {
            user.ws.send(JSON.stringify({
                type: 'SHIFT_GLOBAL_STATS',
                data: global
            }))
            user.ws.send(JSON.stringify({
                type: 'NEW_ORDER',
                data:{
                    id: id.order_id,
                    name: client.username,
                    items: incoming.data,
                    total: total
                }
            }))
        })
    }
}
module.exports = new NewOrderRequest("NEW_ORDER");