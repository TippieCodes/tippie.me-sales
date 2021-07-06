

function page(){
    ws.onmessage = function (e) {
        const data = JSON.parse(e.data)
        if (data.type == 'CLIENT') {
            document.getElementById("setting-input-username").value = escapeHtml(data.data.username);
        } else if (data.type == 'CHANGE_PASSWORD') {
            if (data.data == 'OK'){
                $("#btn-change-password").text('Password changed!');
                setTimeout(function () {
                    window.location.href = '/lcn/login.html'
                },2000)
            } else if (data.data == 'INVALID_PASSWORD'){
                $("#btn-change-password").prop('disabled',false);
                shake('btn-change-password');
                $("#change-password-error-text").text('Invalid password!')
            } else if (data.data == 'INVALID_CHECK') {
                $("#btn-change-password").prop('disabled',false);
                shake('btn-change-password');
                $("#change-password-error-text").text(data.message)
            }
        }
    }
    ws.send(JSON.stringify({type:'CLIENT'}))
}
async function changePassword(){
    $("#btn-change-password").prop('disabled',true);
    let old_password = document.getElementById("setting-input-oldpw").value
    let new_password = document.getElementById("setting-input-newpw").value
    ws.send(JSON.stringify({type: 'CHANGE_PASSWORD', data:{
            old_password: old_password,
            new_password: new_password
        }}))
}