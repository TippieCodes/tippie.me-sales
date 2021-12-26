const RequestType = require("../requesttype")


class EmployeeUpdateRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_manage_employees"] != true) return;
        const conn = require("../sales").getDatabase(client.store);
        try {
            await conn.query("UPDATE users SET `user_name` = ?, `user_owe` = ?, `user_role` = ? WHERE (`user_id` = ?);", [incoming.data.username, incoming.data.owe, incoming.data.role, incoming.data.user_id])
            ws.send(JSON.stringify({type: "EMPLOYEE_UPDATE", data: {success: true}}))
        } catch (e){
            let message;
            if (e.errno === 1062) message = "The username given already exists"
            else message = e.message;
            ws.send(JSON.stringify({type: "EMPLOYEE_UPDATE", data: {success: false, message: message}}))
        }
    }
}
module.exports = new EmployeeUpdateRequest("EMPLOYEE_UPDATE");