let cards = []
let rolled = []
let winCondition = "line"
let customWinGrid = [[false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false]]

let gameId;

function page() {
    ws.onmessage = function (e) {
        const data = JSON.parse(e.data)
        if (data.type === "BINGO_SELL_CARD") {
            if (data.data.type === "OK") {
                const new_card = data.data.new_card;
                gameId = data.data.game_id
                $("#cards").val(`§lBINGO CARD ${data.data.game_id}-${new_card.id}

§4|| B  |  I  || N  |  G ||  O |
| ${('0' + new_card.B[0]).slice(-2)} | ${new_card.I[0]} | ${new_card.N[0]} | ${new_card.G[0]} | ${new_card.O[0]} |
| ${('0' + new_card.B[1]).slice(-2)} | ${new_card.I[1]} | ${new_card.N[1]} | ${new_card.G[1]} | ${new_card.O[1]} |
| ${('0' + new_card.B[2]).slice(-2)} | ${new_card.I[2]} | XX | ${new_card.G[2]} | ${new_card.O[2]} |
| ${('0' + new_card.B[3]).slice(-2)} | ${new_card.I[3]} | ${new_card.N[3]} | ${new_card.G[3]} | ${new_card.O[3]} |
| ${('0' + new_card.B[4]).slice(-2)} | ${new_card.I[4]} | ${new_card.N[4]} | ${new_card.G[4]} | ${new_card.O[4]} |

§0█▌▏▏▎▌▏▍▍▌▋▏▏▎▌▌▕▕█

§oTIP: Use snipping tool to mark the numbers!`);
                $("#cards-tip").text("Copy paste this in a book.")
            } else if (data.data.type === "ERROR") {
                $("#cards-tip").text(data.data.message)
                setTimeout(function () {
                    $("#cards-tip").text("")
                }, 10000)
            }
        } else if (data.type === "BINGO_GAME_UPDATE") {
            cards = data.cards
            rolled = data.rolled.split(",")
            for (const i in rolled) {
                if (rolled.hasOwnProperty(i)) rolled[i] = parseInt(rolled[i]);
            }
            gameId = data.game_id
            $('#prize').text(data.prize)
            if (rolled[0] === "") {
                $("#last-rolled").text("No number rolled");
                $("#all-rolled").text("No number rolled")
            } else {
                $("#last-rolled").text(getSection(rolled[rolled.length - 1]) + rolled[rolled.length - 1]);
                $("#all-rolled").text(rolled.join(", "))
            }
            $("#cards-loaded").text(`${cards.length} cards currently loaded.`)
            $("#cards-in-play").text(cards.length)
            $("#game-id").text(gameId)

        } else if (data.type === "BINGO_END_GAME") {
            if (data.data.type === "OK") {
                $("#cards-tip").text("Game successfully ended, next game ID is " + data.data.new_game_id)
            } else {
                $("#cards-tip").text(data.data.message);
            }
            setTimeout(function () {
                $("#cards-tip").text("")
            }, 10000)
        } else if (data.type === "BINGO_ROLL") {
            $("#number-rolling-result").text(data.data.message);
            setTimeout(function () {
                $("#number-rolling-result").text("")
            }, 10000)
        }
    }
    ws.send(JSON.stringify({type: "BINGO_GAME"}))
}


$("#card-grid :input").prop("disabled", true)


async function sellCard(type) {
    ws.send(JSON.stringify({type: "BINGO_SELL_CARD", data: type}))
}

function endGame() {
    if (confirm("Are you sure you want to end the game?")) {
        ws.send(JSON.stringify({type: "BINGO_END_GAME"}))
    }
}

async function uniqueRandomInt(min, max, arr, seed) {
    let t = true
    min = Math.ceil(min);
    max = Math.floor(max);
    if (max - min <= arr.length) return undefined;
    const rng = new RNG(seed);
    for (let i = 0; i < 20; i++) {
        const r = rng.nextRange(min, max + 1);
        if (!arr.includes(r)) {
            return r;
        }
    }
}

function selectPattern() {
    const pattern = $("#pattern").val();
    const grid = $("#card-grid :input")
    grid.prop("checked", false)
    switch (pattern) {
        case "line":
            grid.prop("disabled", true)
            linePatternLoop();
            break;
        case "full":
            grid.prop("disabled", true)
            grid.prop("checked", true)
            break;
        case "borders":
            grid.prop("disabled", true)
            $("[id^=grid-1]").prop("checked", true)
            $("[id^=grid-5]").prop("checked", true)
            $("#card-grid [id$='-1']").prop("checked", true)
            $("#card-grid [id$='-5']").prop("checked", true)
            break;
        case "cross":
            grid.prop("disabled", true)
            $("#grid-1-1").prop("checked", true)
            $("#grid-2-2").prop("checked", true)
            $("#grid-3-3").prop("checked", true)
            $("#grid-4-4").prop("checked", true)
            $("#grid-5-5").prop("checked", true)
            $("#grid-1-5").prop("checked", true)
            $("#grid-2-4").prop("checked", true)
            $("#grid-3-3").prop("checked", true)
            $("#grid-4-2").prop("checked", true)
            $("#grid-5-1").prop("checked", true)
            break;
        case "plus":
            grid.prop("disabled", true)
            $("[id^=grid-3]").prop("checked", true)
            $("#card-grid [id$='-3']").prop("checked", true)
            break;
        case "custom":
            grid.prop("disabled", false)
            break;
    }
}

let loop = 0;
selectPattern();

function linePatternLoop() {
    if ($("#pattern").val() === "line") {
        $("#card-grid :input").prop("checked", false)
        switch (loop) {
            case 0:
                $("[id^=grid-1]").prop("checked", true)
                break;
            case 1:
                $("[id^=grid-2]").prop("checked", true)
                break;
            case 2:
                $("[id^=grid-3]").prop("checked", true)
                break;
            case 3:
                $("[id^=grid-4]").prop("checked", true)
                break;
            case 4:
                $("[id^=grid-5]").prop("checked", true)
                break;
            case 5:
                $("#card-grid [id$='-1']").prop("checked", true)
                break;
            case 6:
                $("#card-grid [id$='-2']").prop("checked", true)
                break;
            case 7:
                $("#card-grid [id$='-3']").prop("checked", true)
                break;
            case 8:
                $("#card-grid [id$='-4']").prop("checked", true)
                break;
            case 9:
                $("#card-grid [id$='-5']").prop("checked", true)
                break;
            case 10:
                $("#grid-1-1").prop("checked", true)
                $("#grid-2-2").prop("checked", true)
                $("#grid-3-3").prop("checked", true)
                $("#grid-4-4").prop("checked", true)
                $("#grid-5-5").prop("checked", true)
                break;
            case 11:
                $("#grid-1-5").prop("checked", true)
                $("#grid-2-4").prop("checked", true)
                $("#grid-3-3").prop("checked", true)
                $("#grid-4-2").prop("checked", true)
                $("#grid-5-1").prop("checked", true)
                loop = -1;
                break;
        }
        loop++;
        setTimeout(function () {
            linePatternLoop()
        }, 1000)
    }
}

function saveWinCondition() {
    const win = $("#pattern").val();
    if (win !== "custom") {
        winCondition = win;
    } else {
        winCondition = "custom";
        customWinGrid =
            [[$("#grid-1-1").is(":checked"), $("#grid-1-2").is(":checked"), $("#grid-1-3").is(":checked"), $("#grid-1-4").is(":checked"), $("#grid-1-5").is(":checked")],
                [$("#grid-2-1").is(":checked"), $("#grid-2-2").is(":checked"), $("#grid-2-3").is(":checked"), $("#grid-2-4").is(":checked"), $("#grid-2-5").is(":checked")],
                [$("#grid-3-1").is(":checked"), $("#grid-3-2").is(":checked"), $("#grid-3-3").is(":checked"), $("#grid-3-4").is(":checked"), $("#grid-3-5").is(":checked")],
                [$("#grid-4-1").is(":checked"), $("#grid-4-2").is(":checked"), $("#grid-4-3").is(":checked"), $("#grid-4-4").is(":checked"), $("#grid-4-5").is(":checked")],
                [$("#grid-5-1").is(":checked"), $("#grid-5-2").is(":checked"), $("#grid-5-3").is(":checked"), $("#grid-5-4").is(":checked"), $("#grid-5-5").is(":checked")]]
    }
    $("#win-condition-result").text("Win condition successfully saved!")
    setTimeout(function () {
        $("#win-condition-result").text("")
    }, 5000)
}

async function rollNumber() {
    ws.send(JSON.stringify({type: "BINGO_ROLL"}))
//    const number = await uniqueRandomInt(1, 75, rolled);
//    const section = getSection(number);
//    if (number === undefined){
//        $("#last-rolled").text("All numbers are rolled");
//        return
//    }
//    rolled.push(number);
//    $("#last-rolled").text(section+number);
//    $("#all-rolled").text(rolled.join(", "))
}

function getSection(number) {
    return (number <= 15) ? "B" : ((number <= 30) ? "I" : ((number <= 45) ? "N" : ((number <= 60) ? "G" : "O")))
}

//function importNumbers(){
//    const string = $("#cards").val();
//    if (string === ""){
//        $("#number-rolling-result").text("Import area was found empty, make sure to use the create, import and export cards text area")
//        setTimeout(function(){$("#number-rolling-result").text("")},10000)
//    } else if (/^[\d]+(,[\d]+)*$/.test(string)) {
//        rolled = string.split(",");
//        for (const number of rolled) {
//            if (number < 1 || number > 75){
//                $("#number-rolling-result").text("List in import area contained an invalid number, bingo only has numbers between 1 and 75.")
//                setTimeout(function(){$("#number-rolling-result").text("")},10000)
//                return;
//            }
//        }
//        $("#last-rolled").text(getSection(rolled[rolled.length -1])+rolled[rolled.length -1]);
//        $("#all-rolled").text(rolled.join(", "))
//        $("#number-rolling-result").text(rolled.length + " rolled numbers imported.")
//        setTimeout(function(){$("#number-rolling-result").text("")},10000)
//    } else {
//        $("#number-rolling-result").text("Import area did not have a valid comma separated list.")
//        setTimeout(function(){$("#number-rolling-result").text("")},10000)
//    }
//    setTimeout(function(){$("#number-rolling-result").text("")},10000)
//}

function copyBook() {
    const id = $("#card-id").val();
    const new_card = cards.find(a => a.id == id);
    if (new_card == undefined) {
        $("#manage-card-result").text("Given card ID does not exist.")
        setTimeout(function () {
            $("#manage-card-result").text("")
        }, 10000)
        return;
    }
    $("#cards").val(`§lBINGO CARD ${gameId}-${new_card.id}

§4|| B  |  I  || N  |  G ||  O |
| ${('0' + new_card.B[0]).slice(-2)} | ${new_card.I[0]} | ${new_card.N[0]} | ${new_card.G[0]} | ${new_card.O[0]} |
| ${('0' + new_card.B[1]).slice(-2)} | ${new_card.I[1]} | ${new_card.N[1]} | ${new_card.G[1]} | ${new_card.O[1]} |
| ${('0' + new_card.B[2]).slice(-2)} | ${new_card.I[2]} | XX | ${new_card.G[2]} | ${new_card.O[2]} |
| ${('0' + new_card.B[3]).slice(-2)} | ${new_card.I[3]} | ${new_card.N[3]} | ${new_card.G[3]} | ${new_card.O[3]} |
| ${('0' + new_card.B[4]).slice(-2)} | ${new_card.I[4]} | ${new_card.N[4]} | ${new_card.G[4]} | ${new_card.O[4]} |

§0█▌▏▏▎▌▏▍▍▌▋▏▏▎▌▌▕▕█

§oTIP: Use snipping tool to mark the numbers!`);
    $("#cards-tip").text("Copy paste this in a book.")
    $("#cards-loaded").text(`${cards.length} cards currently loaded.`)
    $("#manage-card-result").text("Book contents copied to create, import and export cards text area")
}

function checkBingo() {
    const id = $("#card-id").val();
    const card = cards.find(a => a.id == id);
    if (card == undefined) {
        $("#manage-card-result").text("Given card ID does not exist.")
        setTimeout(function () {
            $("#manage-card-result").text("")
        }, 10000)
        return;
    }
    if (checkWinCondition(card)) {
        $("#manage-card-result").html("Bingo card " + id + " has <b>BINGO!!!</b>")
    } else {
        $("#manage-card-result").text("Bingo card " + id + " does not have bingo.")
    }
}

function checkWinCondition(card) {
    rolled.push(0)
    if (winCondition === "line") {
        let r = true
        for (const number of card.B) {
            if (!rolled.includes(number)) {
                r = false;
                break;
            }
        }
        if (r === true) {
            rolled.pop();
            return true;
        }
        r = true
        for (const number of card.I) {
            if (!rolled.includes(number)) {
                r = false;
                break;
            }
        }
        if (r === true) {
            rolled.pop();
            return true;
        }
        r = true
        for (const number of card.N) {
            if (!rolled.includes(number)) {
                r = false;
                break;
            }
        }
        if (r === true) {
            rolled.pop();
            return true;
        }
        r = true
        for (const number of card.G) {
            if (!rolled.includes(number)) {
                r = false;
                break;
            }
        }
        if (r === true) {
            rolled.pop();
            return true;
        }
        r = true
        for (const number of card.O) {
            if (!rolled.includes(number)) {
                r = false;
                break;
            }
        }
        if (r === true) {
            rolled.pop();
            return true;
        }
        if (rolled.includes(card.B[0]) && rolled.includes(card.I[0]) && rolled.includes(card.N[0]) && rolled.includes(card.G[0]) && rolled.includes(card.O[0])) {
            rolled.pop();
            return true;
        }
        if (rolled.includes(card.B[1]) && rolled.includes(card.I[1]) && rolled.includes(card.N[1]) && rolled.includes(card.G[1]) && rolled.includes(card.O[1])) {
            rolled.pop();
            return true;
        }
        if (rolled.includes(card.B[2]) && rolled.includes(card.I[2]) && rolled.includes(card.N[2]) && rolled.includes(card.G[2]) && rolled.includes(card.O[2])) {
            rolled.pop();
            return true;
        }
        if (rolled.includes(card.B[3]) && rolled.includes(card.I[3]) && rolled.includes(card.N[3]) && rolled.includes(card.G[3]) && rolled.includes(card.O[3])) {
            rolled.pop();
            return true;
        }
        if (rolled.includes(card.B[4]) && rolled.includes(card.I[4]) && rolled.includes(card.N[4]) && rolled.includes(card.G[4]) && rolled.includes(card.O[4])) {
            rolled.pop();
            return true;
        }
        if (rolled.includes(card.B[0]) && rolled.includes(card.I[1]) && rolled.includes(card.N[2]) && rolled.includes(card.G[3]) && rolled.includes(card.O[4])) {
            rolled.pop();
            return true;
        }
        if (rolled.includes(card.B[4]) && rolled.includes(card.I[3]) && rolled.includes(card.N[2]) && rolled.includes(card.G[1]) && rolled.includes(card.O[0])) {
            rolled.pop();
            return true;
        }
    } else if (winCondition === "full") {
        let r = true
        for (const number of card.B) {
            if (!rolled.includes(number)) {
                r = false;
                break;
            }
        }
        for (const number of card.I) {
            if (!rolled.includes(number)) {
                r = false;
                break;
            }
        }
        for (const number of card.N) {
            if (!rolled.includes(number)) {
                r = false;
                break;
            }
        }
        for (const number of card.G) {
            if (!rolled.includes(number)) {
                r = false;
                break;
            }
        }
        for (const number of card.O) {
            if (!rolled.includes(number)) {
                r = false;
                break;
            }
        }
        if (r === true) {
            rolled.pop();
            return true;
        }
    } else if (winCondition === "borders") {
        if (rolled.includes(card.B[0]) && rolled.includes(card.I[0]) && rolled.includes(card.N[0]) && rolled.includes(card.G[0]) && rolled.includes(card.O[0]) &&
            rolled.includes(card.B[4]) && rolled.includes(card.I[4]) && rolled.includes(card.N[4]) && rolled.includes(card.G[4]) && rolled.includes(card.O[4]) &&
            rolled.includes(card.B[1]) && rolled.includes(card.B[2]) && rolled.includes(card.B[3]) &&
            rolled.includes(card.O[1]) && rolled.includes(card.O[2]) && rolled.includes(card.O[3])) {
            rolled.pop();
            return true;
        }
    } else if (winCondition === "cross") {
        if (rolled.includes(card.B[0]) && rolled.includes(card.I[1]) && rolled.includes(card.N[2]) && rolled.includes(card.G[3]) && rolled.includes(card.O[4]) &&
            rolled.includes(card.B[4]) && rolled.includes(card.I[3]) && rolled.includes(card.N[2]) && rolled.includes(card.G[1]) && rolled.includes(card.O[0])) {
            rolled.pop();
            return true;
        }
    } else if (winCondition === "plus") {
        if (rolled.includes(card.B[3]) && rolled.includes(card.I[3]) && rolled.includes(card.N[3]) && rolled.includes(card.G[3]) && rolled.includes(card.O[3]) &&
            rolled.includes(card.N[1]) && rolled.includes(card.N[2]) && rolled.includes(card.N[4]) && rolled.includes(card.N[0])) {
            rolled.pop();
            return true;
        }
    } else if (winCondition === "custom") {
        if (customWinGrid[0][0]) {
            if (!rolled.includes(card.B[0])) {
                rolled.pop();
                return false;
            }
        }
        if (customWinGrid[1][0]) {
            if (!rolled.includes(card.B[1])) {
                rolled.pop();
                return false;
            }
        }
        if (customWinGrid[2][0]) {
            if (!rolled.includes(card.B[2])) {
                rolled.pop();
                return false;
            }
        }
        if (customWinGrid[3][0]) {
            if (!rolled.includes(card.B[3])) {
                rolled.pop();
                return false;
            }
        }
        if (customWinGrid[4][0]) {
            if (!rolled.includes(card.B[4])) {
                rolled.pop();
                return false;
            }
        }

        if (customWinGrid[0][1]) {
            if (!rolled.includes(card.I[0])) {
                rolled.pop();
                return false;
            }
        }
        if (customWinGrid[1][1]) {
            if (!rolled.includes(card.I[1])) {
                rolled.pop();
                return false;
            }
        }
        if (customWinGrid[2][1]) {
            if (!rolled.includes(card.I[2])) {
                rolled.pop();
                return false;
            }
        }
        if (customWinGrid[3][1]) {
            if (!rolled.includes(card.I[3])) {
                rolled.pop();
                return false;
            }
        }
        if (customWinGrid[4][1]) {
            if (!rolled.includes(card.I[4])) {
                rolled.pop();
                return false;
            }
        }

        if (customWinGrid[0][2]) {
            if (!rolled.includes(card.N[0])) {
                rolled.pop();
                return false;
            }
        }
        if (customWinGrid[1][2]) {
            if (!rolled.includes(card.N[1])) {
                rolled.pop();
                return false;
            }
        }
        if (customWinGrid[2][2]) {
            if (!rolled.includes(card.N[2])) {
                rolled.pop();
                return false;
            }
        }
        if (customWinGrid[3][2]) {
            if (!rolled.includes(card.N[3])) {
                rolled.pop();
                return false;
            }
        }
        if (customWinGrid[4][2]) {
            if (!rolled.includes(card.N[4])) {
                rolled.pop();
                return false;
            }
        }

        if (customWinGrid[0][3]) {
            if (!rolled.includes(card.G[0])) {
                rolled.pop();
                return false;
            }
        }
        if (customWinGrid[1][3]) {
            if (!rolled.includes(card.G[1])) {
                rolled.pop();
                return false;
            }
        }
        if (customWinGrid[2][3]) {
            if (!rolled.includes(card.G[2])) {
                rolled.pop();
                return false;
            }
        }
        if (customWinGrid[3][3]) {
            if (!rolled.includes(card.G[3])) {
                rolled.pop();
                return false;
            }
        }
        if (customWinGrid[4][3]) {
            if (!rolled.includes(card.G[4])) {
                rolled.pop();
                return false;
            }
        }

        if (customWinGrid[0][4]) {
            if (!rolled.includes(card.O[0])) {
                rolled.pop();
                return false;
            }
        }
        if (customWinGrid[1][4]) {
            if (!rolled.includes(card.O[1])) {
                rolled.pop();
                return false;
            }
        }
        if (customWinGrid[2][4]) {
            if (!rolled.includes(card.O[2])) {
                rolled.pop();
                return false;
            }
        }
        if (customWinGrid[3][4]) {
            if (!rolled.includes(card.O[3])) {
                rolled.pop();
                return false;
            }
        }
        if (customWinGrid[4][4]) {
            if (!rolled.includes(card.O[4])) {
                rolled.pop();
                return false;
            }
        }
        rolled.pop();
        return true;
    }
    rolled.pop()
    return false;
}