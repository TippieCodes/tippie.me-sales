const RequestType = require("../requesttype")
const utils = require("../utils");


class CardManagementRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_casino_cards"] != true) return;
        const conn = require("../sales").getDatabase(client.store);
        let a = await conn.query(`SELECT * FROM shifts WHERE shift_ended = 0`)
        let current_shift = a[0];
        if (!current_shift) {
            ws.send(JSON.stringify({
                type: "CARD_MANAGEMENT",
                data: {
                    type: "ERROR",
                    message: "You may not register a card whilst there is no active shift."
                }
            }))
            return;
        }
        let c = await conn.query("SELECT * FROM `casino_cards` WHERE `card_id` = ? LIMIT 1", [incoming.data.id])
        const card = c[0]
        if (incoming.data.action === "DEPOSIT"){
            const amount = incoming.data.amount;
            await conn.query("INSERT INTO `casino_logs` (`shift`, `employee`, `game`, `data`, `total`, `owe`) VALUES (?, ?, 'card', ?, ?, ?);", [current_shift.shift_id, client.user_id, JSON.stringify({action:"deposit", data: {id: card.card_id, amount:amount}}), 0, 0])
            await conn.query("UPDATE `casino_cards` SET `card_balance` = ? WHERE (`card_id` = ?);", [(parseInt(card.card_balance) + parseInt(amount)), card.card_id])
            ws.send(JSON.stringify({type: "CARD", data: {id: card.card_id, owner: card.card_owner, balance: (parseInt(card.card_balance)+ parseInt(amount)), vip: card.card_vip_till, expire: card.card_expire}}));
        } else if (incoming.data.action === "WITHDRAW"){
            const amount = incoming.data.amount;
            await conn.query("INSERT INTO `casino_logs` (`shift`, `employee`, `game`, `data`, `total`, `owe`) VALUES (?, ?, 'card', ?, ?, ?);", [current_shift.shift_id, client.user_id, JSON.stringify({action:"withdraw", data: {id: card.card_id, amount:amount}}), 0, 0])
            await conn.query("UPDATE `casino_cards` SET `card_balance` = ? WHERE (`card_id` = ?);", [(parseInt(card.card_balance) - amount), card.card_id])
            ws.send(JSON.stringify({type: "CARD", data: {id: card.card_id, owner: card.card_owner, balance: (parseInt(card.card_balance)- amount), vip: card.card_vip_till, expire: card.card_expire}}));
        } else if (incoming.data.action === "VIP") {
            await conn.query("INSERT INTO `casino_logs` (`shift`, `employee`, `game`, `data`, `total`, `owe`) VALUES (?, ?, 'card', ?, ?, ?);", [current_shift.shift_id, client.user_id, JSON.stringify({action:"vip", data: {id: card.card_id}}), 60000, 60000*(parseInt(client.owe_percentage+5)/100)])
            await conn.query("UPDATE `casino_cards` SET `card_vip_till` = ? WHERE (`card_id` = ?);", [utils.mysqlDate(new Date(new Date().getTime() + 1000*60*60*24*30)), card.card_id])
            ws.send(JSON.stringify({type: "CARD", data: {id: card.card_id, owner: card.card_owner, balance: card.card_balance, vip: utils.mysqlDate(new Date(new Date().getTime() + 1000*60*60*24*30)), expire: card.card_expire}}));
        }
    }
}
module.exports = new CardManagementRequest("CARD_MANAGEMENT");