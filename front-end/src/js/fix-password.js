async function submitPassword(){
    $('#submit').prop('disabled',true)
    setCookie('fix_password',document.getElementById('username').value,0.01)
    setCookie('fix_password_token',document.getElementById('logintoken').value,0.01)
    setCookie('fix_password_new',await document.getElementById('password').value,0.01)
    const ws = new WebSocket(vars['websocket_url']);
    ws.onmessage = function (e){
        deleteCookie('fix_password')
        deleteCookie('fix_password_token')
        deleteCookie('fix_password_new')
        const data = JSON.parse(e.data)
        if (data.type == 'UNAUTHORIZED'){
            $('#submit').prop('disabled',false)
            shake('submit')
            $('#errortext').text('The username and token provided do not match')
        } else if (data.type == 'NOT_LEGACY') {
            $('#submit').prop('disabled',false)
            shake('submit')
            $('#errortext').text('The account provided has already been fixed.')
        } else if (data.type == 'ERROR'){
            $('#submit').prop('disabled',false)
            shake('submit')
            $('#errortext').text('An unexpected error occurred.')
        } else if (data.type == 'INVALID_CHECK') {
            $('#submit').prop('disabled',false)
            shake('submit')
            $('#errortext').text(data.data)
        } else if (data.type == 'OK') {
            $('submit').text('Password updated!')
            setTimeout(function () {
                window.location.href = root_url + 'login.html'
            }, 2000)
        }
    }

}