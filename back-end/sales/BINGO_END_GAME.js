const RequestType = require("../requesttype")

const util = require("../utils")

class BingoEndGameRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_casino_bingo"] != true) return;
        const conn = require("../sales").getDatabase(client.store);let a = await conn.query(`SELECT * FROM shifts WHERE shift_ended = 0`)
        let current_shift = a[0];
        if (!current_shift) {
            ws.send(JSON.stringify({
                type: "BINGO_END_GAME",
                data: {
                    type: "ERROR",
                    message: "You may not end the game when there is no active shift."
                }
            }))
            return;
        }
        let current_game = await conn.query(`SELECT * FROM casino_bingo WHERE game_ended IS null LIMIT 1`)
        if (current_game[0]) {
            await conn.query("UPDATE `casino_bingo` SET `game_ended` = ?, `game_ended_by` = ? WHERE (`game_id` = ?);", [util.mysqlDate(new Date()), client.user_id, current_game[0].game_id])
        }
        await conn.query("INSERT INTO `casino_bingo` (`game_cards`) VALUES ('[]');")
        current_game = await conn.query(`SELECT * FROM casino_bingo WHERE game_ended IS null LIMIT 1`)
        ws.send(JSON.stringify({
            type: "BINGO_END_GAME",
            data: {
                type: "OK",
                new_game_id: current_game[0].game_id
            }
        }))
        wss.users.filter(user => user.client.store == client.store).forEach(user=> {
            user.ws.send(JSON.stringify({type: "BINGO_GAME_UPDATE", cards: [],rolled:"" ,prize:0, game_id: current_game[0].game_id}))
        })
    }
}
module.exports = new BingoEndGameRequest("BINGO_END_GAME");