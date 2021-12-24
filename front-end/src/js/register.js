let xhttp = new XMLHttpRequest();
xhttp.open("GET", vars['api'] + "/stores", false);
xhttp.send(null);
const stores = JSON.parse(xhttp.responseText)

function register(){
    $("#submit").prop('disabled',true);
    if ($("#password").val() !== $("#repeat-password").val()){
        shake("submit")
        $('#error-text').text('Passwords do not match.')
        $("#submit").prop('disabled',false);
    }
    setCookie("register_password",$('#password').val(),0.1)

    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", vars['api'] + `/register/${$("#store-select").val()}/${$('#invite-token').val()}`, false);
    xhttp.setRequestHeader("Content-Type", "text/plain");
    xhttp.send(null);
    const data = JSON.parse(xhttp.responseText)

    if (data.type == 'UNAUTHORIZED'){
        $('#submit').prop('disabled',false)
        shake('submit')
        $('#error-text').text('The token provided is not a valid invite token.')
    } else if (data.type == 'ERROR'){
        $('#submit').prop('disabled',false)
        shake('submit')
        $('#error-text').text('An unexpected error occurred.')
    } else if (data.type == 'INVALID_CHECK') {
        $('#submit').prop('disabled',false)
        shake('submit')
        $('#error-text').text(data.data)
    } else if (data.type == 'OK') {
        $('#submit').text('Account created!')
        $('#error-text').text('')
        setTimeout(function () {
            window.location.href = root_url + 'login.html'
        }, 2000)
    }
}

function checkToken(){
    let xhttp = new XMLHttpRequest();
    xhttp.open("GET", vars['api'] + `/register/${$("#store-select").val()}/${$('#invite-token').val()}`, false);
    xhttp.send(null);
    const data = JSON.parse(xhttp.responseText)
    if (data.type == "CORRECT_TOKEN") {
        $('#username').val(data.data)
    } else {
        $('#username').val("Incorrect Token")
    }
}

// noinspection JSUnresolvedVariable
document.addEventListener("DOMContentLoaded", function(){
    for (let store of stores) {
        // noinspection JSUnresolvedVariable
        $("#store-select").append(`<option value=${store.store_id}>${store.store_name}</option>`)
    }
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has("id")) {
        $(`#store-select option[value=${urlParams.get("id")}]`).attr("selected",true)
    } else if (urlParams.has("store")) { // noinspection JSUnresolvedVariable
        let store = stores.find(a => a.store_url_friendly == urlParams.get("store"))
        if (store) { // noinspection JSUnresolvedVariable
            $(`#store-select option[value=${store.store_id}]`).attr("selected",true)
        }
    } else {
        $(`#store-select option[value=0]`).attr("selected",true)
    }
    deleteCookie("invite_token")
    deleteCookie("register_password")
    deleteCookie("store")
    $("#invite-token").val(urlParams.get("token"))
    checkToken();
})

document.getElementById("store-select").onchange = function(){checkToken()}