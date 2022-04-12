const RequestType = require("../requesttype")


class BingoRollRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_casino_bingo"] != true) return;
        const conn = require("../sales").getDatabase(client.store);
        let a = await conn.query(`SELECT * FROM shifts WHERE shift_ended = 0`)
        let current_shift = a[0];
        if (!current_shift) {
            ws.send(JSON.stringify({
                type: "BINGO_ROLL",
                data: {
                    type: "ERROR",
                    message: "You may not end the game when there is no active shift."
                }
            }))
            return;
        }

        let current_game = await conn.query(`SELECT * FROM casino_bingo WHERE game_ended IS null LIMIT 1`)
        let rolled = current_game[0].game_rolled.split(",");
        for (const i in rolled) {
            if (rolled.hasOwnProperty(i)) rolled[i] = parseInt(rolled[i]);
        }
        rolled = rolled.filter(a => a >= 1 && a <= 75);
        let next = await uniqueRandomInt(1, 75, rolled);
        if (next === undefined) {
            ws.send(JSON.stringify({
                type: "BINGO_ROLL", data: {
                    type: "ERROR",
                    message: "All numbers have been rolled."
                }
            }))
        } else {
            rolled.push(next);
            await conn.query("UPDATE `casino_bingo` SET `game_rolled` = ? WHERE (`game_id` = ?);", [rolled.join(","), current_game[0].game_id])
            wss.users.filter(user => user.client.store == client.store).forEach(user => {
                user.ws.send(JSON.stringify({
                    type: "BINGO_GAME_UPDATE",
                    cards: JSON.parse(current_game[0].game_cards),
                    rolled: rolled.join(","),
                    prize: current_game[0].game_prize,
                    game_id: current_game[0].game_id
                }))
            })
        }
    }
}

module.exports = new BingoRollRequest("BINGO_ROLL");

async function uniqueRandomInt(min, max, arr) {
    min = Math.ceil(min);
    max = Math.floor(max);
    if (max - min <= arr.length) return undefined;
    for (let i = 0; i < 20; i++) {
        const r = Math.floor(Math.random() * (max - min) + min);
        if (!arr.includes(r)) {
            return r;
        }
    }
}