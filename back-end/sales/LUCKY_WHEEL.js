const RequestType = require("../requesttype")


class LuckyWheelRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_casino_cards"] != true) return;
        const conn = require("../sales").getDatabase(client.store);
        let c = await conn.query('SELECT * FROM shifts order by started_at DESC LIMIT 1;')
        let current_shift = c[0]["shift_id"];
        let is_active = c[0]["shift_ended"] === 0;
        if (incoming.action == 'SPIN') {
            if (!is_active) {
                ws.send(JSON.stringify({
                    type: "LUCKY_WHEEL",
                    data: {type: 'ERROR', message: 'You cannot do this when there\'s no active shift'}
                }))
                return;
            }
            let employee_owe = await conn.query('SELECT SUM(owe) AS owe FROM casino_logs WHERE shift = ? AND game = "lucky_wheel" AND employee = ? AND data = \'0\';', [current_shift, client.user_id]);
            await conn.query('INSERT INTO `casino_logs` (`shift`, `employee`, `game`, `data`, `total`, `owe`) VALUES (?, ?, \'lucky_wheel\',\'0\' ,\'15000\',?);', [current_shift, client.user_id, (employee_owe[0]['owe'] > 60000 ? 14000 : 9000)])
        } else if (incoming.action == "WON") {
            if (!is_active) {
                ws.send(JSON.stringify({
                    type: "LUCKY_WHEEL",
                    data: {type: 'ERROR', message: 'You cannot do this when there\'s no active shift'}
                }))
                return;
            }
            await conn.query('INSERT INTO `casino_logs` (`shift`, `employee`, `game`, `data`, `total`, `owe`) VALUES (?, ?, \'lucky_wheel\',\'1\', \'-500000\',\'-500000\');', [current_shift, client.user_id])
        }
        let a = await conn.query(`
SELECT (SELECT COUNT(*) FROM casino_logs WHERE shift = ? AND data = '0' AND game = "lucky_wheel") AS shift_count, 
(SELECT COUNT(*) FROM casino_logs WHERE shift = ? AND data = '1' AND game = "lucky_wheel") AS shift_won,
(SELECT COUNT(*) FROM casino_logs WHERE data = '0' AND game = "lucky_wheel") AS total_count,
(SELECT COUNT(*) FROM casino_logs WHERE data = '1' AND game = "lucky_wheel") AS total_won;`, [current_shift, current_shift])
        let shift_bought = a[0]['shift_count'];
        let shift_won = a[0]['shift_won'];
        let total_bought = a[0]['total_count'];
        let total_won = a[0]['total_won'];

        ws.send(JSON.stringify({
            type: "LUCKY_WHEEL", data: {
                type: "UPDATE", content: {
                    shift_bought: shift_bought,
                    shift_won: shift_won,
                    total_bought: total_bought,
                    total_won: total_won
                }
            }
        }))
    }
}

module.exports = new LuckyWheelRequest("LUCKY_WHEEL");