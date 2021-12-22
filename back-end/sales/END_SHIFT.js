const utils = require("../utils");

const RequestType = require("../requesttype")

class EndShiftRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_manage_shift"] != true) return;
        const conn = require("../sales").getDatabase(client.store);
        let a = await conn.query(`SELECT * FROM shifts WHERE shift_ended = 0`)
        let current_shift = a[0];
        let global = await utils.getGlobalShiftStats(conn, a[0].shift_id);

        if (a[0]) await conn.query(`UPDATE shifts SET shift_ended = '1', ended_by = ?, ended_at = '${utils.mysqlDate(new Date(new Date().getTime() + 1000 * 60 * 60))}',
            stat_orders = ?, stat_items = ?, stat_sales = ?, employee_list = ?, stat_owe = ? WHERE (shift_id = ?);`, [client.user_id, global.orders, global.items, global.total, JSON.stringify(global.employees), global.owed, current_shift.shift_id])
        wss.users.filter(user => user.client.store == client.store).forEach(user=> {
            user.ws.send(JSON.stringify({type: 'SHIFT', data: 'NONE'}))
            user.ws.send(JSON.stringify({type: 'SHIFT_GLOBAL_STATS', data: global}))
        })
    }
}
module.exports = new EndShiftRequest("END_SHIFT");