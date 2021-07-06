let ws;

function load() {
    var url_elements = window.location.href.split("/")
    if (window.location.href.split("")[window.location.href.split("").length - 1] == "#") {
        window.location.href = window.location.href.slice(0, -1);
    } else if (url_elements[url_elements.length - 1] == "" && url_elements[url_elements.length - 2] != "lcn") {
        window.location.href = window.location.href.slice(0, -1);
    } else if (url_elements[url_elements.length - 2] == "lcn" && window.location.href.split("")[window.location.href.split("").length - 1] == "/") {
        $(`a[href="index.html"]`).addClass(`active`);
    } else if (url_elements[url_elements.length - 1].includes("?")) {
        $(`a[href="${url_elements[url_elements.length - 1].split("?")[0]}"]`).addClass(`active`)
    } else if ((url_elements[url_elements - 2] != "lcn" && url_elements[url_elements.length - 1] == "")) {
        return $(`a[href="${url_elements[url_elements.length - 1]}"]`).addClass(`active`);
    } else if (url_elements[url_elements.length - 1] == 'app.html') {
        $(`a[href="apps.html"]`).addClass(`active`);
    } else {
        $(`a[href="${url_elements[url_elements.length - 1]}"]`).addClass(`active`);
    }

    ws = new WebSocket('wss://tippie.me/lcn');
    ws.onmessage = function (e) {
        let data = JSON.parse(e.data)
        switch (data.type) {
            case 'UNAUTHORIZED':
                window.location.href = '/lcn/login.html'
                return;
            case 'CONNECTED':
                let client = data.data
                $("#profile-picture").attr('src', `https://cravatar.eu/helmavatar/${client.username}/100.png`);
                $("#username").text(client.username);
                checkShift();
                page();
        }
    }
}
function logout() {
    ws.send(JSON.stringify({ type: 'LOGOUT' }))
    ws.close();
    deleteCookie('session_token');
    window.location.href = '/lcn/login.html'
}

function checkShift() {
    ws.onmessage = function (e) {
        let data = JSON.parse(e.data)
        console.log(data)
        if (data.type == 'SHIFT'){
            if (data.data == 'NONE') {
                $('#shift').attr('class', 'circle gray center pl-2')
                $('#shift-text').text('No shift')
            } else {
                $('#shift').attr('class', 'circle red blink center pl-2')
                $('#shift-text').text('Current shift: ' + data.data.shift_name)
                //TODO dropdown for other shift information
            }
        }
    }
    ws.send(JSON.stringify({type: 'SHIFT'}))
}