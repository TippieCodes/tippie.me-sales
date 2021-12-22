const RequestType = require("../requesttype")


class BlackJackRemovePlayerRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_casino_blackjack"] != true) return;
        const conn = require("../sales").getDatabase(client.store);let a = await conn.query(`SELECT * FROM shifts WHERE shift_ended = 0`)
        let current_shift = a[0];
        if (!current_shift) {
            ws.send(JSON.stringify({
                type: "BLACKJACK_REMOVE_PLAYER",
                data: {
                    type: "ERROR",
                    message: "You may not add a player whilst there's no active shift."
                }
            }))
            return;
        }
        let c = await conn.query(`SELECT * FROM casino_blackjack WHERE game_ended IS null LIMIT 1`)
        let current_game = c[0];
        let players = JSON.parse(current_game.game_players);
        if (!incoming.data.id in players) {

        } else {
            delete players[incoming.data.id]
            await conn.query("UPDATE `casino_blackjack` SET `game_players` = ? WHERE (`game_id` = ?);", [JSON.stringify(players), current_game.game_id])

            let logs = await conn.query("SELECT * FROM casino_logs WHERE `game` = 'blackjack' AND `shift` = ?;", [current_shift.shift_id])
            let total = 0
            for (const log of logs) {
                total += parseInt(log.total);
            }
            wss.users.filter(user => user.client.store == client.store).forEach(user=> {
                user.ws.send(JSON.stringify({
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
            });
        }
    }
}
module.exports = new BlackJackRemovePlayerRequest("BLACKJACK_REMOVE_PLAYER");