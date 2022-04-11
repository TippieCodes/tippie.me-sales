const RequestType = require("../requesttype")
const Sales = require("../sales")

class EmployeeListRequest extends RequestType{
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_list_employees"] != true) return;
        const conn = Sales.getDatabase(client.store);
        let response = {
            type: 'EMPLOYEE_LIST',
            data: null,
            roles: Sales.getStore(client.store).roles
        }
        response.data = await conn.query('SELECT user_id,user_name,user_owe,legacy_user,disabled,invited,user_role FROM users WHERE user_id > 0');
        let date = new Date()
        date.setTime(date.getTime() - 3*30*24*60*60*1000)
        let orders = await conn.query(`SELECT order_employee,order_at FROM orders WHERE order_at > '${date.toISOString().split("T")[0]}' ORDER BY order_id DESC;`);
        let roles = Sales.getStore(client.store).roles
        for (let i = 0; i < response.data.length; i++){
            let id = response.data[i].user_id
            let index = orders.findIndex(a => a.order_employee == id)
            if (index === -1) {
                response.data[i].last_activity = -1
            } else {
                response.data[i].last_activity = Math.round((new Date()-new Date(orders[index].order_at))/(1000*60*60*24))
            }
            response.data[i].role = roles.find(a => a.role_id == response.data[i].user_role)
        }
        ws.send(JSON.stringify(response))
    }
}
module.exports = new EmployeeListRequest("EMPLOYEE_LIST");