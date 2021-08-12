var xhttp = new XMLHttpRequest();
xhttp.open("GET", "https://tippie.me/sales/api/stores", false); 
xhttp.send(null);
const stores = JSON.parse(xhttp.responseText)

async function login() {
    const username = document.getElementById('signin-username').value
    const password = document.getElementById('signin-password').value
    setCookie('store', $("#store-select").val(), 0.01)
    if (document.getElementById("RememberPassword").checked){
        setCookie('log_in_c', "true", 0.01)
    } else {
        setCookie('log_in_c', "false", 0.01)
    }
    setCookie('log_in_a', username, 0.01)
    setCookie('log_in_b', password, 0.01)
    const ws = new WebSocket('wss://tippie.me/sales');
    ws.onerror = function (e) {
        document.getElementById('error-box').innerHTML = 'Login failed! Unexpected error occured!.'
    }
    ws.onmessage = function (e) {
        const data = JSON.parse(e.data);
        deleteCookie('log_in_a')
        deleteCookie('log_in_b')
        deleteCookie('log_in_c')
        deleteCookie('store')
        switch (data.type) {
            case 'UNAUTHORIZED':
                document.getElementById('error-box').innerHTML = 'Login failed! Incorrect token.'
                return;
            case 'LOGIN':
                setCookie('session_token', data.data, 30)
                window.location.href = root_url
        }
    }
}
document.addEventListener("DOMContentLoaded", function(){
    let token = getCookie('session_token')
    if (token) {
        const ws = new WebSocket('wss://tippie.me/sales');
        ws.onerror = function (e) {
            document.getElementById('error-box').innerHTML = 'Login failed! Unexpected error occured!.'
        }
        ws.onmessage = function (e) {
            var data = JSON.parse(e.data)
            if (data.type == 'CONNECTED'){
                window.location.href = root_url
            } else {
                deleteCookie('session_token')
            }
        }
    }

    for (let store of stores) {
        $("#store-select").append(`<option value=${store.store_id}>${store.store_name}</option>`)
    }
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has("id")) {
        $(`#store-select option[value=${urlParams.get("id")}]`).attr("selected",true)
    } else if (urlParams.has("store")) {
        let store = stores.find(a => a.store_url_friendly == urlParams.get("store"))
        if (store) $(`#store-select option[value=${store.store_id}]`).attr("selected",true)
    } else {
        $(`#store-select option[value=0]`).attr("selected",true)
    }
    loadStoreLogin();
});

function loadStoreLogin(){
    let selected = $("#store-select").val()
    let store = stores.find(a => a.store_id == selected)
    $("#text-1").text("the " + store.store_name + " online area.")
    $(".logo-icon").attr("src", store.logo_url)
    $(".auth-background-holder").attr("style", "background: url("+store.login_side_image+") no-repeat center center")
    $(`link[rel="shortcut icon"]`).attr("href", store.favicon_url)
    $('#side-text-header').text(store.login_side_text_header)
    $('#side-text-body').text(store.login_side_text_body)
}

document.getElementById("store-select").onchange = function(){loadStoreLogin()};