const RequestType = require("../requesttype")
const utils = require('../utils')
const bcrypt = require("bcrypt");


class EmployeeUpdateRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_manage_employees"] != true) return;
        const conn = require("../sales").getDatabase(client.store);

        if (incoming.data.user_id <= 0) {
            ws.send(JSON.stringify({
                type: "EMPLOYEE_UPDATE",
                data: {success: false, message: 'System users cannot be modified'}
            }));
            return;
            or
        }
        if (incoming.data.type === 'COPY_INVITE') {
            try {
                let user = await conn.query('SELECT user_password,invited FROM users WHERE user_id = ? LIMIT 1', [incoming.data.user_id])
                if (user[0]['invited'] != true) {
                    ws.send(JSON.stringify({
                        type: "EMPLOYEE_UPDATE",
                        data: {success: false, message: 'This employee is not invited.'}
                    }))
                    return;
                }
                ws.send(JSON.stringify({
                    type: "EMPLOYEE_UPDATE",
                    data: {success: true, invite: user[0]['user_password']}
                }))
            } catch (e) {
                ws.send(JSON.stringify({type: "EMPLOYEE_UPDATE", data: {success: false, message: e.message}}))
            }
        } else if (incoming.data.type === 'PASSWORD_RESET') {
            try {
                let user = await conn.query('SELECT user_name,invited FROM users WHERE user_id = ? LIMIT 1', [incoming.data.user_id])
                console.log(user)
                if (user['invited'] == true) {
                    ws.send(JSON.stringify({type: "EMPLOYEE_UPDATE", data: {success: false, message: 'Not possible'}}))
                    return;
                }
                const check = utils.passwordCheck(incoming.data.new, user[0]['user_name']);
                let hash;
                if (check === true) {
                    let salt = await bcrypt.genSalt(14);
                    console.log(`Hashing ${incoming.data.new}...`)
                    hash = await bcrypt.hash(incoming.data.new, salt)
                    console.log(`Created hash ${hash}`)
                } else {
                    ws.send(JSON.stringify({type: "EMPLOYEE_UPDATE", data: {success: false, message: check}}))
                    return;
                }
                await conn.query("UPDATE users SET `user_password` = ? WHERE (`user_id` = ?);", [hash, incoming.data.user_id])
                ws.send(JSON.stringify({type: "EMPLOYEE_UPDATE", data: {success: true}}))
            } catch (e) {
                ws.send(JSON.stringify({type: "EMPLOYEE_UPDATE", data: {success: false, message: e.message}}))
            }
        } else {
            try {
                await conn.query("UPDATE users SET `user_name` = ?, `user_owe` = ?, `user_role` = ?, `disabled` = ? WHERE (`user_id` = ?);", [incoming.data.username, incoming.data.owe, incoming.data.role, incoming.data.disabled, incoming.data.user_id])
                ws.send(JSON.stringify({type: "EMPLOYEE_UPDATE", data: {success: true}}))
            } catch (e) {
                let message;
                if (e.errno === 1062) message = "The username given already exists"
                else message = e.message;
                ws.send(JSON.stringify({type: "EMPLOYEE_UPDATE", data: {success: false, message: message}}))
            }
        }
    }
}
module.exports = new EmployeeUpdateRequest("EMPLOYEE_UPDATE");