function register(){
    $("#submit").prop('disabled',true);
    if ($("#password").val() !== $("#repeat-password").val()){
        shake("submit")
        $('#error-text').text('Passwords do not match.')
        $("#submit").prop('disabled',false);
    }
    setCookie("invite_token", $('#invite-token').val(),0.1)
    setCookie("register_password",$('#password').val(),0.1)
    const ws = new WebSocket("wss://tippie.me/lcn")
    ws.onmessage = function (e) {
        deleteCookie("invite_token")
        deleteCookie("register_password")
        const data = JSON.parse(e.data)
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
}

function checkToken(){
    setCookie("invite_token", $('#invite-token').val())
    const ws = new WebSocket("wss://tippie.me/lcn")
    ws.onmessage = function (e){
        const data = JSON.parse(e.data)
        if (data.type == "CORRECT_TOKEN") {
            $('#username').val(data.data)
        } else {
            $('#username').val("Incorrect Token")
        }
    }
}

document.addEventListener("DOMContentLoaded", function(){
    deleteCookie("invite_token")
    deleteCookie("register_password")
    const urlParams = new URLSearchParams(window.location.search)
    $("#invite-token").val(urlParams.get("token"))
    checkToken();
})