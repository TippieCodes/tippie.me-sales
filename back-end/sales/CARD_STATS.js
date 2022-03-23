const RequestType = require("../requesttype")


class CardStatsRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming){
        if (client.role["permission_casino_stats"] != true) return;
        const conn = require("../sales").getDatabase(client.store);
        let c = await conn.query("SELECT * FROM `casino_cards`")
        let stats = {
            total_cards: 0,
            total_balance: 0,
            total_expired_cards: 0,
            total_vip_cards: 0
        }
        for (const card of c) {
            stats.total_cards++;
            stats.total_balance += parseInt(card.card_balance)
            if (new Date(card.card_expire) > new Date()) stats.total_expired_cards++;
            if (card.card_vip_till != null && new Date(card.card_vip_till) > new Date()) stats.total_vip_cards++;
        }
        ws.send(JSON.stringify({type:"CARD_STATS", data: stats}))
    }
}
module.exports = new CardStatsRequest("CARD_STATS");