const utils = require("../utils");

const RequestType = require("../requesttype")

class ShiftListRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_list_shifts"] != true) return;
        const conn = require("../sales").getDatabase(client.store);
        let response = {
            type: 'SHIFT_LIST',
            data: {
                shifts: null
            }
        }
        response.data.shifts = await conn.query('SELECT * FROM shifts');
        let users = await conn.query('SELECT user_id, user_name FROM users')
        for (let shift of response.data.shifts) {

            let sn = users.find(a => a.user_id == shift.started_by)
            let en = users.find(a => a.user_id == shift.ended_by)
            shift.started_by_name = (sn) ? sn.user_name : 'n/a'
            shift.ended_by_name = (en) ? en.user_name : 'n/a'
            if (!en) shift.stat_sales = '***'
        }
        ws.send(JSON.stringify(response))
    }
}
module.exports = new ShiftListRequest("SHIFT_LIST");