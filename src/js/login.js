function login() {
    let token = document.getElementById('signin-token').value
    setCookie('log_in', token, 1)
    var ws = new WebSocket('wss://tippie.me/lcn')
    ws.onerror = function (e) {
        document.getElementById('error-box').innerHTML = 'Login failed! Unexpected error occured!.'
    }
    ws.onmessage = function (e) {
        var data = JSON.parse(e.data)
        switch (data.type) {
            case 'UNAUTHORIZED':
                document.getElementById('error-box').innerHTML = 'Login failed! Incorrect token.'
                return;
            case 'LOGIN':
                setCookie('session_token', data.data, 30)
                deleteCookie('log_in')
                window.location.href = '/lcn/'
        }
    }
}
document.addEventListener("DOMContentLoaded", function(){
    let token = getCookie('session_token')
    if (token) {
        var ws = new WebSocket('wss://tippie.me/lcn')
        ws.onerror = function (e) {
            document.getElementById('error-box').innerHTML = 'Login failed! Unexpected error occured!.'
        }
        ws.onmessage = function (e) {
            var data = JSON.parse(e.data)
            if (data.type == 'CONNECTED'){
                window.location.href = '/lcn/'
            } else {
                deleteCookie('session_token')
            }
        }
    }
});