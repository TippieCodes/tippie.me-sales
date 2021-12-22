const utils = require("../utils");

const RequestType = require("../requesttype")

class StartShiftRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_manage_shift"] != true) return;
        const conn = require("../sales").getDatabase(client.store);
        await conn.query('INSERT INTO shifts (shift_name, started_by) VALUES (?, ?);', ['Opening', client.user_id])
        let a = await conn.query(`SELECT * FROM shifts WHERE shift_ended = 0`)
        let current_shift = a[0];
        let global = await utils.getGlobalShiftStats(conn);
        wss.users.filter(user => user.client.store == client.store).forEach(user => {
                user.ws.send(JSON.stringify({
                    type: 'SHIFT',
                    data: current_shift,
                    startuser: {name: client.username, id: client.user_id},
                }))
                user.ws.send(JSON.stringify({type: 'SHIFT_GLOBAL_STATS', data: global}))
                utils.getEmployeeShiftStats(conn, user.client.user_id).then(a => {
                    user.ws.send(JSON.stringify({type: 'SHIFT_PERSONAL_STATS', data: a}))
                });
            });
    }
}
module.exports = new StartShiftRequest("START_SHIFT");