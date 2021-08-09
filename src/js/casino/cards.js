function page(){
    ws.onmessage = function (e) {
        const data = JSON.parse(e.data);
        console.log(data)
        if (data.type === "CARD"){
            if (data.data.id === "NOT_FOUND") {
                $("#card-ID").val("Card not found.");
                $("#manage-card-owner").text("Card not found.");
                $("#manage-card-VIP").text("Card not found.");
                $("#manage-card-balance").text("Card not found.");
                $("#manage-card-expire").text("Card not found.");
            } else {
                $("#card-ID").val(data.data.id)
                $("#manage-card-owner").text(data.data.owner);
                $("#manage-card-balance").text(data.data.balance);
                 const v = new Date(data.data.vip)
                if (v < new Date()) {
                    $("#manage-card-VIP").text("No VIP");
                } else {
                    $("#manage-card-VIP").text(v.getDate()+"/"+(v.getMonth()+1)+"/"+v.getFullYear());
                }
                const d = new Date(data.data.expire)
                $("#manage-card-expire").text(d.getDate()+"/"+(d.getMonth() + 1)+"/"+d.getFullYear())
            }
        } else if (data.type === "REGISTER_CARD") {
            if (data.data.type === "ERROR"){
                $("#cards-tip").text(data.data.message);
                setTimeout(function (){$("#cards-tip").text("");},10000)
            } else {
                $("#cards-tip").text("Card successfully registered and loaded.");
                setTimeout(function (){$("#cards-tip").text("");},10000)
            }
        }
    }
}

function registerCard(){
    const owner = $("#card-owner").val();
    const startingBalance = $("#card-starting-balance").val();
    if (owner === "") {
        $("#cards-tip").text("The card owner cannot be nothing.")
        setTimeout(function (){$("#cards-tip").text("")},10000)
        return;
    }
    ws.send(JSON.stringify({type: "REGISTER_CARD", data: {owner: owner, starting_balance: startingBalance}}))
}

document.getElementById("card-ID").onchange = function () {
    ws.send(JSON.stringify({type: "CARD", data: {id: $("#card-ID").val()}}))
}

function deposit(){
    ws.send(JSON.stringify({type: "CARD_MANAGEMENT", data: {id: $("#card-ID").val(), action: "DEPOSIT", amount: $("#manage-amount").val()}}));
}

function withdraw(){
    ws.send(JSON.stringify({type: "CARD_MANAGEMENT", data: {id: $("#card-ID").val(), action: "WITHDRAW", amount: $("#manage-amount").val()}}));
}

function makeVip(){
    ws.send(JSON.stringify({type: "CARD_MANAGEMENT", data: {id: $("#card-ID").val(), action: "VIP"}}));
}

//region Spin the Wheel

function spinWheel(){
    ws.send(JSON.stringify({type: "LUCKY_WHEEL", action:"SPIN"}))
}

function wonSpin(){
    ws.send(JSON.stringify({type: "LUCKY_WHEEL", action:"WON"}))
}

//endRegion
