const RequestType = require("../requesttype")


class CardRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_casino_cards"] != true) return;
        const conn = require("../sales").getDatabase(client.store);
        let c = await conn.query("SELECT * FROM `casino_cards` WHERE `card_id` = ? LIMIT 1", [incoming.data.id])
        const card = c[0]
        if (!card) {
            ws.send(JSON.stringify({type: "CARD", data: {id: "NOT_FOUND"}}))
        } else {
            ws.send(JSON.stringify({
                type: "CARD",
                data: {
                    id: card.card_id,
                    owner: card.card_owner,
                    balance: card.card_balance,
                    vip: card.card_vip_till,
                    expire: card.card_expire
                }
            }));
        }
    }
}

module.exports = new CardRequest("CARD");