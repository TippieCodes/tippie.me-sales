const RequestType = require("../requesttype")


class BlackJackAddPlayerRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_casino_blackjack"] != true) return;
        const conn = require("../sales").getDatabase(client.store);let a = await conn.query(`SELECT * FROM shifts WHERE shift_ended = 0`)
        let current_shift = a[0];
        if (!current_shift) {
            ws.send(JSON.stringify({
                type: "BLACKJACK_ADD_PLAYER",
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
        if (incoming.data.id in players) {
            ws.send(JSON.stringify({
                type: "BLACKJACK_ADD_PLAYER",
                data: {
                    type: "ERROR",
                    message: "The given card ID is already in the game."
                }
            }))
            return;
        }
        let n = await conn.query(`SELECT * FROM casino_cards WHERE card_id = ?`, [incoming.data.id])
        let new_player = n[0];
        if (!new_player){
            ws.send(JSON.stringify({
                type: "BLACKJACK_ADD_PLAYER",
                data: {
                    type: "ERROR",
                    message: "The given card ID does not exist."
                }
            }))
        } else {
            players[incoming.data.id] = {
                id: incoming.data.id,
                name: new_player.card_owner,
                balance: new_player.card_balance,
                current_bet: null,
                side_bet: null,
                vip: new_player.card_vip_till,
                cards: [],
                split_cards: [],
                split_value: 0,
                value: 0,
                status: 0,
                can_side_bet: false,
                can_double_down: false,
                can_split_pairs: false,
            }
            await conn.query("UPDATE `casino_blackjack` SET `game_players` = ? WHERE (`game_id` = ?);",[JSON.stringify(players), current_game.game_id])

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
                        deck_size: (current_game.game_deck) ? current_game.game_deck.split(",").length : 0,
                        last_drawn: current_game.game_last_drawn,
                        total: total
                    }
                }));
            });
        }
    }
}
module.exports = new BlackJackAddPlayerRequest("BLACKJACK_ADD_PLAYER");