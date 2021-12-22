const RequestType = require("../requesttype")


class BingoSellCardRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_casino_bingo"] != true) return;
        const conn = require("../sales").getDatabase(client.store);
        let a = await conn.query(`SELECT * FROM shifts WHERE shift_ended = 0`)
        let current_shift = a[0];
        if (!current_shift) {
            ws.send(JSON.stringify({
                type: "BINGO_SELL_CARD",
                data: {
                    type: "ERROR",
                    message: "You may not end the game when there is no active shift."
                }
            }))
            return;
        }

        let current_game = await conn.query(`SELECT * FROM casino_bingo WHERE game_ended IS null LIMIT 1`)
        let cards = JSON.parse(current_game[0].game_cards)
        let total, type = parseInt(incoming.data);
        if (type === 1) {
           total = 10000;
        } else if (type === 2) {
            total = 5000;
        } else if (type === 3) {
            total = 0
        } else {
            ws.send(JSON.stringify({
                type: "BINGO_SELL_CARD",
                data: {
                    type: "ERROR",
                    message: "The sold card type is invalid."
                }
            }))
            return;
        }
        const owe = Math.floor((0.2*total)*(parseInt(client.owe_percentage)/100));
        await conn.query("INSERT INTO `casino_logs` (`shift`, `employee`, `game`, `data`, `total`, `owe`) VALUES (?, ?, 'bingo', ?, ?, ?);", [current_shift.shift_id, client.user_id, type, total, owe])
        let new_card = {
            id: null,
            B: [],
            I: [],
            N: [],
            G: [],
            O: []
        }
        new_card.id = cards.length+1;

        new_card.B.push(await uniqueRandomInt(1,15,new_card.B));
        new_card.B.push(await uniqueRandomInt(1,15,new_card.B));
        new_card.B.push(await uniqueRandomInt(1,15,new_card.B));
        new_card.B.push(await uniqueRandomInt(1,15,new_card.B));
        new_card.B.push(await uniqueRandomInt(1,15,new_card.B));

        new_card.I.push(await uniqueRandomInt(16,30,new_card.I));
        new_card.I.push(await uniqueRandomInt(16,30,new_card.I));
        new_card.I.push(await uniqueRandomInt(16,30,new_card.I));
        new_card.I.push(await uniqueRandomInt(16,30,new_card.I));
        new_card.I.push(await uniqueRandomInt(16,30,new_card.I));

        new_card.N.push(await uniqueRandomInt(31,45,new_card.N));
        new_card.N.push(await uniqueRandomInt(31,45,new_card.N));
        new_card.N.push(0);
        new_card.N.push(await uniqueRandomInt(31,45,new_card.N));
        new_card.N.push(await uniqueRandomInt(31,45,new_card.N));

        new_card.G.push(await uniqueRandomInt(46,60,new_card.G));
        new_card.G.push(await uniqueRandomInt(46,60,new_card.G));
        new_card.G.push(await uniqueRandomInt(46,60,new_card.G));
        new_card.G.push(await uniqueRandomInt(46,60,new_card.G));
        new_card.G.push(await uniqueRandomInt(46,60,new_card.G));

        new_card.O.push(await uniqueRandomInt(61,75,new_card.O));
        new_card.O.push(await uniqueRandomInt(61,75,new_card.O));
        new_card.O.push(await uniqueRandomInt(61,75,new_card.O));
        new_card.O.push(await uniqueRandomInt(61,75,new_card.O));
        new_card.O.push(await uniqueRandomInt(61,75,new_card.O));

        cards.push(new_card)
        await conn.query("UPDATE `casino_bingo` SET `game_cards` = ?, `game_prize` = ? WHERE (`game_id` = ?);", [JSON.stringify(cards),parseInt(current_game[0].game_prize)+(0.8*total) ,current_game[0].game_id])
        ws.send(JSON.stringify({type: "BINGO_SELL_CARD",
            data: {
                type: "OK",
                game_id: current_game[0].game_id,
                new_card: new_card,
            }
        }))
        wss.users.filter(user => user.client.store == client.store).forEach(user=> {
            user.ws.send(JSON.stringify({type: "BINGO_GAME_UPDATE", cards: cards, rolled: current_game[0].game_rolled, prize:parseInt(current_game[0].game_prize)+(0.8*total), game_id: current_game[0].game_id}))
        });
    }
}
module.exports = new BingoSellCardRequest("BINGO_SELL_CARD");

async function uniqueRandomInt(min, max, arr){
    let t = true
    min = Math.ceil(min);
    max = Math.floor(max);
    if (max - min <= arr.length ) return undefined;
    while (t===true){
        const r = Math.floor(Math.random() * (max - min) + min);
        if (!arr.includes(r)){
            t = false;
            return r;
        }
    }
}