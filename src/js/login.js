async function login() {
    const username = document.getElementById('signin-username').value
    const password = document.getElementById('signin-password').value
    if (document.getElementById("RememberPassword").checked){
        setCookie('log_in_c', "true", 0.01)
    } else {
        setCookie('log_in_c', "false", 0.01)
    }
    setCookie('log_in_a', username, 0.01)
    setCookie('log_in_b', password, 0.01)
    const ws = new WebSocket('wss://tippie.me/lcn');
    ws.onerror = function (e) {
        document.getElementById('error-box').innerHTML = 'Login failed! Unexpected error occured!.'
    }
    ws.onmessage = function (e) {
        const data = JSON.parse(e.data);
        deleteCookie('log_in_a')
        deleteCookie('log_in_b')
        deleteCookie('log_in_c')
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
        const ws = new WebSocket('wss://tippie.me/lcn');
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
});