const utils = require("../utils");

const RequestType = require("../requesttype")

class ShiftRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_view_shift"] != true) return;
        const conn = require("../sales").getDatabase(client.store);
        let a = await conn.query(`SELECT * FROM shifts WHERE shift_ended = 0`)
        let current_shift = a[0];
        if (!current_shift) {
            ws.send(JSON.stringify({type: 'SHIFT', data: 'NONE'}))
            return;
        }
        let b = await conn.query(`SELECT user_name FROM users WHERE user_id = ?`, [current_shift.started_by])
        let started_by = b[0].user_name
        ws.send(JSON.stringify({
            type: 'SHIFT',
            data: current_shift,
            startuser: {name: started_by, id: current_shift.started_by}
        }))
    }
}
module.exports = new ShiftRequest("SHIFT");