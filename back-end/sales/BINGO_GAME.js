const RequestType = require("../requesttype")


class BingoGameRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_casino_bingo"] != true) return;
        const conn = require("../sales").getDatabase(client.store);
        let current_game = await conn.query(`SELECT * FROM casino_bingo WHERE game_ended IS null LIMIT 1`)
        ws.send(JSON.stringify({
            type: "BINGO_GAME_UPDATE",
            cards: JSON.parse(current_game[0].game_cards),
            rolled: current_game[0].game_rolled,
            prize: current_game[0].game_prize,
            game_id: current_game[0].game_id
        }))
    }
}
module.exports = new BingoGameRequest("BINGO_GAME");