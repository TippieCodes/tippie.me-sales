
const RequestType = require("../requesttype")
const bcrypt = require("bcrypt")
const utils = require("../utils")

class ChangePasswordRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        const conn = require("../sales").getDatabase(client.store);const old_password = incoming.data.old_password;
        let user = await conn.query(`SELECT * FROM users WHERE user_name = ?;`, [client.username]);
        const valid_password = (user[0]) ? await bcrypt.compare(old_password, user[0].user_password) : false
        if (!valid_password){
            ws.send(JSON.stringify({type: "CHANGE_PASSWORD", data:"INVALID_PASSWORD"}))
        } else {
            const new_password = incoming.data.new_password
            const check = utils.passwordCheck(new_password, client.username)
            if (check === true) {
                const salt = await bcrypt.genSalt(14);
                let hashed_new_password = await bcrypt.hash(new_password, salt);
                try {
                    await conn.query(`UPDATE users SET user_password = ? WHERE (user_id = ?);`, [hashed_new_password, client.user_id])
                    await conn.query("DELETE FROM sessions WHERE (`session_user` = ?);", [client.user_id])
                } catch (e) {
                    ws.send(JSON.stringify({type: "ERROR", data: e.errno}))
                    console.log(e);
                    return;
                }
                ws.send(JSON.stringify({type: "CHANGE_PASSWORD", data: "OK"}))
            } else {
                ws.send(JSON.stringify({type: "CHANGE_PASSWORD", data: "INVALID_CHECK", message: check}))
            }
        }
    }
}
module.exports = new ChangePasswordRequest("CHANGE_PASSWORD");