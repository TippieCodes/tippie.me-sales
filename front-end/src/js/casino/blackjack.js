const status_dictionary = {
    "-1": "Not playing",
    0: "Waiting for bet...",
    1: "Playing",
    2: "Playing Split Hand",
    5: "Standing",
    10: "Won",
    101: "Natural",
    102: "Blackjack",
    11: "Lost",
    113: "Won Sidebet",
    111: "Busted",
    12: "Tie"
}


function page(){
    ws.onmessage = function (e) {
        const data = JSON.parse(e.data)
        if (data.type === "BLACKJACK_GAME"){
            const game = data.data
            console.log(game)
            $("#round-id").text(game.id)
            $("#last-drawn").text((!game.last_drawn) ? "No card drawn" : cardToText(game.last_drawn))
            $("#cards-deck").text(game.deck_size)
            $("#shift-profit").text(game.total)
            const dealer = game.dealer
            $("#open-card").text((!dealer.open_card) ? "No card drawn" : cardToText(dealer.open_card))
            $("#closed-cards").text((!dealer.closed_cards || dealer.closed_cards.length === 0) ? "No card drawn" : cardsToText(dealer.closed_cards))
            $("#dealer-status").text(status_dictionary[dealer.status])
            $("#dealer-value").text(dealer.value)

            if (dealer.status >= 5) {
                $("#dealer-deal").addClass("disabled")
                $("#dealer-stand").addClass("disabled")
            } else {
                $("#dealer-deal").removeClass("disabled");
                $("#dealer-stand").removeClass("disabled")
            }

            let canEnd = true;
            if (dealer.status < 5) canEnd = false;

            const p = $("#players")
            p.html("")
            for (const [,player] of Object.entries(game.players)) {
                if (player === null) continue;
                if (player.status < 5) canEnd = false;
                p.append(` <div class="app-card app-card-chart shadow-sm mt-4">
                            <div class="app-card-header p-3">
                                <div class="row justify-content-between align-items-center">
                                    <div class="col-auto">
                                        <h4 class="app-card-title">Player ${player.id}</h4>
                                    </div><!--//col-->
                                    <div class="col-auto">
                                        <div class="card-header-action">
                                        </div><!--//card-header-actions-->
                                    </div><!--//col-->
                                </div><!--//row-->
                            </div><!--//app-card-header-->
                            <div class="app-card-body shadow-sm">
                                <div class="app-card app-card-basic align-items-start shadow-sm">
                                    <div class="app-card-body px-4" style="width: 100%">
                                        <div class="pt-3">
                                            <b>Player IGN:</b> ${player.name}<br/>
                                            <b>Card Balance:</b> ${player.balance}<br/>
                                            <b>Current Bet:</b> ${(!player.bet) ? "No bet set" : player.bet} ${(player.side_bet === null) ? "" : "<b>Side Bet:</b> "+player.side_bet}<br/>
                                            <b>Cards in hand:</b> ${(player.cards.length === 0) ? "No cards drawn" : cardsToText(player.cards)} ${(player.split_cards.length === 0) ? "" : "<b>Split Cards:</b>" + cardsToText(player.split_cards)}<br/>
                                            <b>Total value:</b> ${player.value} ${(player.split_cards.length === 0) ? "" : "<b>Split Value:</b>" + player.split_value}<br/>
                                            <b>Player Status:</b> ${status_dictionary[player.status]}
                                        </div>
                                        <div class="intro"></div>
                                    </div><!--//app-card-body-->
                                    <div class="app-card-footer p-4 mt-auto">
                                        <input type="number" class="form-control" id="bet-${player.id}" placeholder="Player bet" aria-label="Player bet">
                                        <div class="btn-group pt-2" role="group" aria-label="Basic example">
                                            <button type="button" class="btn app-btn-secondary ${(player.status == 0 ? "":"disabled")}" onclick="setBet(${player.id})">Set Bet</button>
                                            <button type="button" class="btn app-btn-secondary ${(player.can_side_bet == true ? "":"disabled")}" onclick="sideBet(${player.id})">Set Side-Bet</button>
                                            <button type="button" class="btn app-btn-secondary ${(player.can_double_down == true ? "":"disabled")}" onclick="doubleDown(${player.id}))">Double Down</button>
                                            <button type="button" class="btn app-btn-secondary ${(player.can_split_pairs == true ? "":"disabled")}" onclick="splitPairs(${player.id}))">Split Pairs</button>
                                            <button type="button" class="btn app-btn-secondary ${(player.status < 5 && player.status > 0 ? "":"disabled")}" onclick="deal(${player.id})">Deal Card</button>
                                            <button type="button" class="btn app-btn-secondary ${(player.status < 5 && player.status > 0 ? "":"disabled")}" onclick="stand(${player.id})">Stand</button>
                                        </div>
                                        <div class="pt-2"><button type="button" class="btn btn-outline-danger" style="border:1px solid" onclick="removePlayer(${player.id})">Remove Player</button></div>
                                        <span id="${player.id}-response"></span>
                                    </div><!--//app-card-footer-->
                                </div>
                            </div><!--//app-card-body-->
                        </div>`)
            }
            if (!canEnd) {
                $("#end-round").addClass("disabled")
            } else {
                $("#end-round").removeClass("disabled")
            }
        } else if (data.type === "BLACKJACK_ADD_PLAYER"){
            if (data.data.type === "ERROR") {
                $("#game-information-response").text(data.data.message)
                setTimeout(function (){$("#game-information-response").text("")},10000)
            }
        } else if (data.type === "BLACKJACK_GAME_ACTION"){
            if (data.data.type === "ERROR") {
                $(`#${data.data.id}-response`).text(data.data.message)
                setTimeout(function (){$(`#${data.data.id}-response`).text("")},10000)
            }
        } else if (data.type === "BLACKJACK_NEW_GAME") {
            ws.send(JSON.stringify({type:"BLACKJACK_GAME"}))
        } else if (data.type === "BLACKJACK_LAST_GAME") {
            $("#last-round").text(data.data.cards);
        }
    }

    ws.send(JSON.stringify({type: "BLACKJACK_GAME"}))
}

function addPlayer(){
    ws.send(JSON.stringify({type: "BLACKJACK_ADD_PLAYER", data:{id: $("#add-player-id").val()}}))
}

function removePlayer(id){
    ws.send(JSON.stringify({type: "BLACKJACK_REMOVE_PLAYER", data:{id: id}}))
}

function shuffleDeck(){
    ws.send(JSON.stringify({type:"BLACKJACK_GAME_ACTION", data:{action: "SHUFFLE"}}))
}

function setBet(id){
    ws.send(JSON.stringify({type:"BLACKJACK_GAME_ACTION", data:{action: "BET", id: id, amount: $(`#bet-${id}`).val()}}))
}

function sideBet(id){
    ws.send(JSON.stringify({type:"BLACKJACK_GAME_ACTION", data:{action: "SIDE_BET", id: id, amount: $(`#bet-${id}`).val()}}))
}

function doubleDown(id){
    ws.send(JSON.stringify({type:"BLACKJACK_GAME_ACTION", data:{action: "DOUBLE_DOWN", id: id}}))
}

function splitPairs(id){
    ws.send(JSON.stringify({type:"BLACKJACK_GAME_ACTION", data:{action: "SPLIT_PAIRS", id: id}}))
}

function deal(id){
    ws.send(JSON.stringify({type:"BLACKJACK_GAME_ACTION", data:{action: "DEAL", id: id}}))
}

function stand(id){
    ws.send(JSON.stringify({type:"BLACKJACK_GAME_ACTION", data:{action: "STAND", id: id}}))
}

function endRound(){
    ws.send(JSON.stringify({type:"BLACKJACK_GAME_ACTION", data:{action: "END_ROUND"}}));
}