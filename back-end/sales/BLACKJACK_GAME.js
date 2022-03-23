const RequestType = require("../requesttype")


class BlackjackGameRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_casino_blackjack"] != true) return;
        const conn = require("../sales").getDatabase(client.store);
        let c = await conn.query(`SELECT * FROM casino_blackjack WHERE game_ended IS null LIMIT 1`)
        let current_game = c[0];
        let players = JSON.parse(current_game.game_players);
        let total = 0;
        let a = await conn.query(`SELECT * FROM shifts WHERE shift_ended = 0`)
        let current_shift = a[0];
        if (current_shift) {
            let logs = await conn.query("SELECT * FROM casino_logs WHERE `game` = 'blackjack' AND `shift` = ?;", [current_shift.shift_id])
            let last_round = {}
            for (const log of logs) {
                total += parseInt(log.total);

                const data = JSON.parse(log.data)
                if (data.game_id === current_game.game_id - 1) {
                    if (data.card_id === undefined || data.card_id === null) continue;
                    if (!(data.card_id in last_round)) last_round[data.card_id] = 0;
                    last_round[data.card_id] += parseInt(log.total);
                }
            }
            console.log(last_round)
            let string = "/itc &c[&4&LCARD BALANCES&c] "
            for (const [key, value] of Object.entries(last_round)){
                let n = await conn.query(`SELECT * FROM casino_cards WHERE card_id = ?`, [key])
                let card = n[0];
                string += `&7&O${card.card_owner}: &6${card.card_balance} (${((value <= 0) ? ("+" + -1*value) : "-"+value)}) `
            }

            ws.send(JSON.stringify({
                type: "BLACKJACK_LAST_GAME",
                data: {
                    cards: string
                }
            }));
        }
        ws.send(JSON.stringify({
            type: "BLACKJACK_GAME",
            data: {
                id: current_game.game_id,
                dealer: JSON.parse(current_game.game_dealer),
                players: players,
                deck_size: (!current_game.game_deck) ? 0 : current_game.game_deck.split(",").length,
                last_drawn: current_game.game_last_drawn,
                total: total
            }
        }));
    }
}
module.exports = new BlackjackGameRequest("BLACKJACK_GAME");