const RequestType = require("../requesttype")

const utils = require("../utils")

class RegisterCardRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_casino_cards"] != true) return;
        const conn = require("../sales").getDatabase(client.store);let a = await conn.query(`SELECT * FROM shifts WHERE shift_ended = 0`)
        let current_shift = a[0];
        if (!current_shift) {
            ws.send(JSON.stringify({
                type: "REGISTER_CARD",
                data: {
                    type: "ERROR",
                    message: "You may not register a card whilst there is no active shift."
                }
            }))
            return;
        }
        let c = await conn.query("INSERT INTO `casino_cards` (`card_owner`, `card_balance`, `card_expire`) VALUES (?, ?, ?); SELECT LAST_INSERT_ID();",[incoming.data.owner, incoming.data.starting_balance, utils.mysqlDate(new Date(new Date().getTime() + 1000*60*60*24*30*3))]);
        let b = await conn.query("SELECT * FROM `casino_cards` WHERE `card_id` = ?;", [c.insertId])
        let card = b[0]
        await conn.query("INSERT INTO `casino_logs` (`shift`, `employee`, `game`, `data`, `total`, `owe`) VALUES (?, ?, 'card', ?, ?, ?);", [current_shift.shift_id, client.user_id, JSON.stringify({action:"register", data: {id: card.card_id, owner: incoming.data.owner, balance: incoming.data.starting_balance, vip: false}}), 0, 0])
        ws.send(JSON.stringify({type: "REGISTER_CARD", data: {type: "OK"}}))
        ws.send(JSON.stringify({type: "CARD", data: {id: card.card_id, owner: card.card_owner, balance: card.card_balance, vip: card.card_vip_till, expire: card.card_expire}}))
    }
}
module.exports = new RegisterCardRequest("REGISTER_CARD");