const RequestType = require("../requesttype");
const Sales = require("../sales");

class OverviewRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_overview"] != true) return;
        const conn = Sales.getDatabase(client.store);
        let last_shift = 0,
            stats = 0;
        if (Sales.getDatabase(client.store)["module_sales"] == true) {
            let a = await conn.query('SELECT * FROM shifts order by started_at DESC LIMIT 1;')
            last_shift = a[0]
            stats = {
                owe: 0,
                profit: 0
            }


            if (Sales.getStore(client.store)["module_casino"] == true) {
                let logs = await conn.query('SELECT * FROM casino_logs WHERE shift = ? AND employee = ?;', [last_shift.shift_id, client.user_id])
                for (const log of logs) {
                    if (log.game === "card") {
                        let data = JSON.parse(log.data)
                        if (data.action === "VIP") {
                            stats.owe += parseInt(log.owe)
                            stats.profit += parseInt(log.total) - parseInt(log.owe)
                        } else if (data.action === "register") {
                            if (isNaN(parseInt(data.data.balance))) continue;
                            stats.owe += parseInt(data.data.balance)
                        } else if (data.action === "deposit") {
                            if (isNaN(parseInt(data.data.amount))) continue;
                            stats.owe += parseInt(data.data.amount)
                        } else if (data.action === "withdraw") {
                            if (isNaN(parseInt(data.data.amount))) continue;
                            stats.owe -= parseInt(data.data.amount)
                        }
                    } else if (log.game === "bingo") {
                        stats.owe += parseInt(log.owe)
                        stats.profit += (0.2 * parseInt(log.total)) - parseInt(log.owe)
                    } else {
                        stats.owe += parseInt(log.owe);
                        stats.profit += parseInt(log.total) - parseInt(log.owe);
                    }
                }
            }

            let orders = await conn.query('SELECT * FROM orders WHERE order_shift = ? AND order_employee = ?;', [last_shift.shift_id, client.user_id])
            for (const order of orders) {
                stats.owe += parseInt(order.order_owe);
                stats.profit += parseInt(order.order_total) - parseInt(order.order_owe)
            }


            ws.send(JSON.stringify({type: "OVERVIEW", data: stats}))
        }
    }
}
module.exports = new OverviewRequest("OVERVIEW");