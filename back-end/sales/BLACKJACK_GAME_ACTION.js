const RequestType = require("../requesttype")
const utils = require("../utils");


class BlackjackGameActionRequest extends RequestType {
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_casino_blackjack"] != true) return;
        const conn = require("../sales").getDatabase(client.store);let a = await conn.query(`SELECT * FROM shifts WHERE shift_ended = 0`)
        let current_shift = a[0];
        if (!current_shift) {
            ws.send(JSON.stringify({
                type: "BLACKJACK_GAME_ACTION",
                data: {
                    type: "ERROR",
                    id: (incoming.data.id) ? incoming.data.id : 0,
                    message: "You may not manage a blackjack game whilst there's no active shift."
                }
            }))
            return;
        }
        let c = await conn.query(`SELECT * FROM casino_blackjack WHERE game_ended IS null LIMIT 1`)
        let current_game = c[0];
        let players = JSON.parse(current_game.game_players);
        console.log(current_game.game_dealer)
        let dealer = JSON.parse(current_game.game_dealer);
        let total = 0;
        let cards = current_game.game_deck.split(",");
        let last_drawn = current_game.game_last_drawn;
        let action = incoming.data.action;
        let id = (incoming.data.id) ? incoming.data.id : 0;

        let hasEnded = true;
        if (dealer.status < 5) hasEnded = false
        for (const [,player] of Object.entries(players)) {
            if (player.status < 5) {
                hasEnded = false;
                break;
            }
        }
        if (hasEnded && incoming.data.action !== "END_ROUND") return;

        if (action === "SHUFFLE"){
            let deck = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "sj", "sq", "sk",
                "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10", "dj", "dq", "dk",
                "h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8", "h9", "h10", "hj", "hq", "hk",
                "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "cj", "cq", "ck"]
            let new_cards = deck.concat(deck).concat(deck).concat(deck).concat(deck).concat(deck)//.concat("x") temporary removed till blank card is completely implememnted
            shuffle(new_cards);
            await conn.query("INSERT INTO `casino_logs` (`shift`, `employee`, `game`, `data`, `total`, `owe`) VALUES (?, ?, 'blackjack', ?, ?, ?);", [current_shift.shift_id, client.user_id, JSON.stringify({reason:"Shuffle", game_id:current_game.game_id}), 0, 0])
            cards=new_cards
            await conn.query("UPDATE `casino_blackjack` SET `game_deck` = ? WHERE (`game_id` = ?);",[cards.join(","),current_game.game_id])
        } else if (action === "BET") {
            let n = await conn.query(`SELECT * FROM casino_cards WHERE card_id = ?`, [id])
            let card = n[0];
            if (incoming.data.amount > parseInt(card.card_balance)) {
                ws.send(JSON.stringify({
                    type: "BLACKJACK_GAME_ACTION",
                    data: {
                        type: "ERROR",
                        id: id,
                        message: "The player cannot bet more than their card balance."
                    }
                }))
                return;
            }
            players[id].balance = parseInt(card.card_balance) - incoming.data.amount
            await conn.query("UPDATE `casino_cards` SET `card_balance` = ? WHERE (`card_id` = ?);", [(parseInt(card.card_balance) - incoming.data.amount), card.card_id])
            await conn.query("INSERT INTO `casino_logs` (`shift`, `employee`, `game`, `data`, `total`, `owe`) VALUES (?, ?, 'blackjack', ?, ?, ?);", [current_shift.shift_id, client.user_id, JSON.stringify({reason:"Bet", game_id:current_game.game_id, card_id:card.card_id}), incoming.data.amount, 0])
            players[id].bet = incoming.data.amount;
            players[id].status = 1
        } else if (action === "SIDE_BET") {
            if (getCardValue(dealer.open_card) === undefined) {
                if (incoming.data.amount > players[id].bet/2) {
                    ws.send(JSON.stringify({
                        type: "BLACKJACK_GAME_ACTION",
                        data: {
                            type: "ERROR",
                            id: id,
                            message: "The side-bet cannot be higher than half of the original bet."
                        }
                    }))
                    return;
                }
                players[id].bet -= incoming.data.amount;
                players[id].side_bet = incoming.data.amount
                players[id].status = 1
            }
            players[id].can_side_bet = false;
        } else if (action === "DOUBLE_DOWN"){
            if (players[id].cards.length === 2 && getTotalValue(player[id].cards, false) >= 9 && getTotalValue(players[id].cards, false) <= 11 ) {
                let n = await conn.query(`SELECT * FROM casino_cards WHERE card_id = ?`, [id])
                let card = n[0];
                if (players[id].bet > parseInt(card.card_balance)) {
                    ws.send(JSON.stringify({
                        type: "BLACKJACK_GAME_ACTION",
                        data: {
                            type: "ERROR",
                            id: id,
                            message: "The player cannot double down when their original bet is lower then their card balance."
                        }
                    }))
                    return;
                }
                await conn.query("UPDATE `casino_cards` SET `card_balance` = ? WHERE (`card_id` = ?);", [(parseInt(card.card_balance) - players[id].bet), card.card_id])
                await conn.query("INSERT INTO `casino_logs` (`shift`, `employee`, `game`, `data`, `total`, `owe`) VALUES (?, ?, 'blackjack', ?, ?, ?);", [current_shift.shift_id, client.user_id, JSON.stringify({reason:"Double Down", game_id:current_game.game_id, card_id:card.card_id}), players[id].bet, 0])
                players[id].bet += players[id].bet
                let drawn = await cards.shift() + "."
                players[id].cards.push(drawn)
                players[id].value = getTotalValueString(players[id].cards)
                last_drawn = drawn;
                await conn.query("UPDATE `casino_blackjack` SET `game_deck` = ?, `game_last_drawn` = ? WHERE (`game_id` = ?);", [cards.join(","), last_drawn, current_game.game_id])
            }
            players[id].can_double_down = false;
        } else if (action === "SPLIT_PAIRS") {
            if (players[id].cards.length === 2 && getCardValue(players[id].cards[0]) === getCardValue(players[id].cards[1])){
                let n = await conn.query(`SELECT * FROM casino_cards WHERE card_id = ?`, [id])
                let card = n[0];
                if (players[id].bet > parseInt(card.card_balance)) {
                    ws.send(JSON.stringify({
                        type: "BLACKJACK_GAME_ACTION",
                        data: {
                            type: "ERROR",
                            id: id,
                            message: "The player cannot split pairs when their original bet is lower then their card balance."
                        }
                    }))
                    return;
                }
                await conn.query("UPDATE `casino_cards` SET `card_balance` = ? WHERE (`card_id` = ?);", [(parseInt(card.card_balance) - players[id].bet), card.card_id])
                await conn.query("INSERT INTO `casino_logs` (`shift`, `employee`, `game`, `data`, `total`, `owe`) VALUES (?, ?, 'blackjack', ?, ?, ?);", [current_shift.shift_id, client.user_id, JSON.stringify({reason:"Split Pairs", game_id:current_game.game_id, card_id:card.card_id}), players[id].bet, 0])
                let hand2 = [players[id].cards.shift()]
                players[id].split_cards = hand2;
                players[id].split_value = getTotalValueString(hand2);
                players[id].bet += players[id].bet;
            }
            players[id].can_split_pairs = false;
        } else if (action === "DEAL") {
            if (id === 0) {
                console.log(dealer)
                if (!dealer.open_card) {
                    dealer.open_card = cards.shift()
                } else {
                    dealer.closed_cards.push(cards.shift())
                }
                dealer.value = getTotalValueString(dealer.closed_cards.concat(dealer.open_card))
                if (getTotalValue(dealer.closed_cards.concat(dealer.open_card),true) === 21){
                    dealer.status = (dealer.closed_cards.length === 1) ? 101 : 102;
                    // for (let [key,player] of Object.entries(players)) {
                    //     if (player.status !== 101) {
                    //         players[key].status = 11
                    //     } else {
                    //         players[key].status = 12
                    //     }
                    // }
                } else if (getTotalValue(dealer.closed_cards.concat(dealer.open_card),false) > 21){
                    dealer.status = 111;
                    // for (let [,player] of Object.entries(players)) {
                    //     if (player.status === 5) {
                    //         player.status = 10
                    //         let n = await conn.query(`SELECT * FROM casino_cards WHERE card_id = ?`, [player.id])
                    //         let card = n[0];
                    //         await conn.query("UPDATE `casino_cards` SET `card_balance` = ? WHERE (`card_id` = ?);", [(parseInt(card.card_balance) + player.bet * 2), card.card_id])
                    //         await conn.query("INSERT INTO `casino_logs` (`shift`, `employee`, `game`, `data`, `total`, `owe`) VALUES (?, ?, 'blackjack', ?, ?, ?);", [current_shift.shift_id, client.user_id, JSON.stringify({reason:"Dealer Busted", game_id:current_game.game_id, card_id:card.card_id}), -2 * player.bet, 0])
                    //     }
                    // }
                }
                await conn.query("UPDATE `casino_blackjack` SET `game_dealer` = ? WHERE (`game_id` = ?);", [JSON.stringify(dealer), current_game.game_id])
            } else {
                if (players[id].status === 2){
                    players[id].split_cards.push(cards.shift())
                    players[id].split_value = getTotalValueString(players[id].split_cards)
                    if (getTotalValue(players[id].split_cards, false) > 21) {
                        players[id].status = 111;
                    }
                } else if (players[id].status === 1){
                    players[id].cards.push(cards.shift())
                    players[id].value = getTotalValueString(players[id].cards)
                    if (getTotalValue(players[id].cards, false) > 21 && players[id].split_cards.length > 0) {
                        players[id].status = 2;
                    } else if (getTotalValue(players[id].cards, false) > 21) {
                        players[id].status = 111;
                    }
                    if (getTotalValue(players[id].cards, true) === 21) {
                        players[id].status = (players[id].cards.length === 2) ? 101 : 102;
                    }
                }
            }
            await conn.query("UPDATE `casino_blackjack` SET `game_deck` = ? WHERE (`game_id` = ?);", [cards.join(","), current_game.game_id])
        } else if (action === "STAND") {
            if (incoming.data.id === 0){
                dealer.status = 5;
                await conn.query("UPDATE `casino_blackjack` SET `game_dealer` = ? WHERE (`game_id` = ?);", [JSON.stringify(dealer), current_game.game_id])
            } else {
                players[id].status = 5
            }
        } else if (action === "END_ROUND") {
            await conn.query("UPDATE `casino_blackjack` SET `game_ended` = ? WHERE (`game_id` = ?);", [utils.mysqlDate(new Date()), current_game.game_id])
            let new_players = {}
            for (let [,player] of Object.entries(players)) {
                if (player === null || player === undefined) continue;
                let n = await conn.query(`SELECT * FROM casino_cards WHERE card_id = ?`, [player.id])
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
                    new_players[player.id] = {
                        id: player.id,
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
                }
            }
            await conn.query("INSERT INTO `casino_blackjack` (`game_players`, `game_deck`) VALUES (?, ?);", [JSON.stringify(new_players), current_game.game_deck])
            wss.users.filter(user => user.client.store == client.store).forEach(user=> {
                user.ws.send(JSON.stringify({type:"BLACKJACK_NEW_GAME"}))
            });
        }

        let canEnd = true;
        if (dealer.status < 5) canEnd = false
        for (const [,player] of Object.entries(players)) {
            if (player.status < 5) {
                canEnd = false;
                break;
            }
        }

        for (const [id,player] of Object.entries(players)) {
            if (player.status !== 1) continue;
            if (getCardValue(dealer.open_card) === undefined && player.side_bet === null){
                players[id].can_side_bet = true;
            }
            if(player.cards.length === 2 && getCardValue(player.cards[0]) === getCardValue(player.cards[1]) && player.split_cards.length === 0) {
                players[id].can_split_pairs = true;
            }
            if (8 < getTotalValue(player.cards,false) && getTotalValue(player.cards,false) < 12 && cards.length === 2) {
                players[id].can_double_down = true;
            }
        }

        if (canEnd){
            if (dealer.status === 101) {
                for (const [id,player] of Object.entries(players)) {
                    players[id].bet = parseInt(player.bet);
                    player.bet = parseInt(player.bet)
                    let n = await conn.query(`SELECT * FROM casino_cards WHERE card_id = ?`, [id])
                    let card = n[0];
                    if (player.status >= 5) {
                        players[id].status = 11;
                        if (player.side_bet > 0) {
                            players[id].status = 13;
                            await conn.query("UPDATE `casino_cards` SET `card_balance` = ? WHERE (`card_id` = ?);", [(parseInt(card.card_balance) + player.side_bet * 2), card.card_id])
                            await conn.query("INSERT INTO `casino_logs` (`shift`, `employee`, `game`, `data`, `total`, `owe`) VALUES (?, ?, 'blackjack', ?, ?, ?);", [current_shift.shift_id, client.user_id, JSON.stringify({
                                reason: "Won Sidebet",
                                game_id: current_game.game_id,
                                card_id: card.card_id
                            }), -1 * player.side_bet * 2, 0])
                        }
                    } else if (player.status === 101) {
                        players[id].status = 12;
                        let n = await conn.query(`SELECT * FROM casino_cards WHERE card_id = ?`, [player.id])
                        let card = n[0];

                        await conn.query("UPDATE `casino_cards` SET `card_balance` = ? WHERE (`card_id` = ?);", [(parseInt(card.card_balance) + player.bet), card.card_id])
                        await conn.query("INSERT INTO `casino_logs` (`shift`, `employee`, `game`, `data`, `total`, `owe`) VALUES (?, ?, 'blackjack', ?, ?, ?);", [current_shift.shift_id, client.user_id, JSON.stringify({
                            reason: "Tie",
                            game_id: current_game.game_id,
                            card_id: card.card_id
                        }), -1 * player.bet, 0])

                        if (player.side_bet > 0) {
                            players[id].status = 13;
                            await conn.query("UPDATE `casino_cards` SET `card_balance` = ? WHERE (`card_id` = ?);", [(parseInt(card.card_balance) + player.side_bet * 2), card.card_id])
                            await conn.query("INSERT INTO `casino_logs` (`shift`, `employee`, `game`, `data`, `total`, `owe`) VALUES (?, ?, 'blackjack', ?, ?, ?);", [current_shift.shift_id, client.user_id, JSON.stringify({
                                reason: "Won Sidebet",
                                game_id: current_game.game_id,
                                card_id: card.card_id
                            }), -1 * player.side_bet * 2, 0])
                        }
                    }
                }
            } else if (dealer.status === 5 || dealer.status === 102) {
                for (const [id,player] of Object.entries(players)) {
                    players[id].bet = parseInt(player.bet);
                    player.bet = parseInt(player.bet)
                    let n = await conn.query(`SELECT * FROM casino_cards WHERE card_id = ?`, [player.id])
                    let card = n[0];
                    if (player.status === 5 || player.status === 102) {
                        if (player.split_cards > 0) {
                            let split_bet = player.bet*.5;
                            player.bet = player.bet*.5;
                            if (player.split_value > dealer.value) {
                                await conn.query("UPDATE `casino_cards` SET `card_balance` = ? WHERE (`card_id` = ?);", [(parseInt(card.card_balance) + split_bet*2), card.card_id])
                                await conn.query("INSERT INTO `casino_logs` (`shift`, `employee`, `game`, `data`, `total`, `owe`) VALUES (?, ?, 'blackjack', ?, ?, ?);", [current_shift.shift_id, client.user_id, JSON.stringify({
                                    reason: "Won Split-Hand",
                                    game_id: current_game.game_id,
                                    card_id: card.card_id
                                }), -2 * split_bet, 0])
                            } else if (player.split_value === dealer.value) {
                                await conn.query("UPDATE `casino_cards` SET `card_balance` = ? WHERE (`card_id` = ?);", [(parseInt(card.card_balance) + split_bet), card.card_id])
                                await conn.query("INSERT INTO `casino_logs` (`shift`, `employee`, `game`, `data`, `total`, `owe`) VALUES (?, ?, 'blackjack', ?, ?, ?);", [current_shift.shift_id, client.user_id, JSON.stringify({
                                    reason: "Tie Split-Hand",
                                    game_id: current_game.game_id,
                                    card_id: card.card_id
                                }), -1 * split_bet, 0])
                            }
                        }
                        if (player.value > dealer.value) {
                            players[id].status = 10
                            await conn.query("UPDATE `casino_cards` SET `card_balance` = ? WHERE (`card_id` = ?);", [(parseInt(card.card_balance) + player.bet*2), card.card_id])
                            await conn.query("INSERT INTO `casino_logs` (`shift`, `employee`, `game`, `data`, `total`, `owe`) VALUES (?, ?, 'blackjack', ?, ?, ?);", [current_shift.shift_id, client.user_id, JSON.stringify({
                                reason: "Won",
                                game_id: current_game.game_id,
                                card_id: card.card_id
                            }), -2 * player.bet, 0])
                        } else if (player.value === dealer.value) {
                            players[id].status = 12
                            await conn.query("UPDATE `casino_cards` SET `card_balance` = ? WHERE (`card_id` = ?);", [(parseInt(card.card_balance) + player.bet), card.card_id])
                            await conn.query("INSERT INTO `casino_logs` (`shift`, `employee`, `game`, `data`, `total`, `owe`) VALUES (?, ?, 'blackjack', ?, ?, ?);", [current_shift.shift_id, client.user_id, JSON.stringify({
                                reason: "Won",
                                game_id: current_game.game_id,
                                card_id: card.card_id
                            }), -1 * player.bet, 0])
                        } else {
                            players[id].status = 11
                        }
                    }
                }
            } else if (dealer.status === 111){
                for (const [id,player] of Object.entries(players)) {
                    players[id].bet = parseInt(player.bet);
                    player.bet = parseInt(player.bet)
                    if (player.status === 5 || player.status === 101 || player.status === 102) {
                        let n = await conn.query(`SELECT * FROM casino_cards WHERE card_id = ?`, [player.id])
                        let card = n[0];
                        if (player.split_cards.length > 0) {
                            player.bet = player.bet*0.5;
                            if (getTotalValue(player.split_cards, false) > 21) {
                                //do nothing
                            } else {
                                await conn.query("UPDATE `casino_cards` SET `card_balance` = ? WHERE (`card_id` = ?);", [(parseInt(card.card_balance) + (2*player.bet)), card.card_id])
                                await conn.query("INSERT INTO `casino_logs` (`shift`, `employee`, `game`, `data`, `total`, `owe`) VALUES (?, ?, 'blackjack', ?, ?, ?);", [current_shift.shift_id, client.user_id, JSON.stringify({
                                    reason: "Won Split Hand",
                                    game_id: current_game.game_id,
                                    card_id: card.card_id
                                }), (-2 * player.bet), 0])
                            }
                        }
                        await conn.query("UPDATE `casino_cards` SET `card_balance` = ? WHERE (`card_id` = ?);", [(parseInt(card.card_balance) + (2*player.bet)), card.card_id])
                        await conn.query("INSERT INTO `casino_logs` (`shift`, `employee`, `game`, `data`, `total`, `owe`) VALUES (?, ?, 'blackjack', ?, ?, ?);", [current_shift.shift_id, client.user_id, JSON.stringify({
                            reason: "Won Split Hand",
                            game_id: current_game.game_id,
                            card_id: card.card_id
                        }), (-2 * player.bet), 0])
                        players[id].status = 10;
                    }
                }
            }
        }


        await conn.query("UPDATE `casino_blackjack` SET `game_players` = ? WHERE (`game_id` = ?);", [JSON.stringify(players), current_game.game_id])
        let logs = await conn.query("SELECT * FROM casino_logs WHERE `game` = 'blackjack' AND `shift` = ?;", [current_shift.shift_id])
        for (const log of logs) {
            total += parseInt(log.total);
        }
        wss.users.filter(user => user.client.store == client.store).forEach(user=> {
            user.ws.send(JSON.stringify({
                type: "BLACKJACK_GAME",
                data: {
                    id: current_game.game_id,
                    dealer: dealer,
                    players: players,
                    deck_size: cards.length,
                    last_drawn: last_drawn,
                    total: total
                }
            }));
        })
    }
}
module.exports = new BlackjackGameActionRequest("BLACKJACK_GAME_ACTION");

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (0 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

function getCardValue(card){
    if (card === null) return 0;
    if (card.endsWith(".")) card = card.splice(0, -1)
    if (card.endsWith("1")) return undefined
    if (card.endsWith("q") || card.endsWith("j") || card.endsWith("k")) return 10
    return parseInt(card.substring(1))
}

function getTotalValue(cards, ace11) {
    let r = 0;
    for (const card of cards) {
        r += (getCardValue(card)) ? getCardValue(card) : ((ace11) ? 11 : 1)
    }
    return (isNaN(parseInt(r))) ? 0 : parseInt(r);
}

function getTotalValueString(cards) {
    let r = 0;
    let a = true;
    for (const card of cards) {
        r += (getCardValue(card)) ? getCardValue(card) : ((a) ? 11 : 1)
        if (!getCardValue(card)) a = false;
    }
    if (!a){
        let w = r - 10
        if (r > 21) {
            return w;
        }
        return w + " / " + r
    }
    return r;
}