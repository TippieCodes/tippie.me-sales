let ws;

function load() {
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
                if (!(client.permlevel > 3)) {
                    $("#menu-accordion").append("                    <li class=\"nav-item\" id=\"nav-employees\">\n" +
                        "                        <!--//Bootstrap Icons: https://icons.getbootstrap.com/ -->\n" +
                        "                        <a class=\"nav-link\" href=\"employees.html\">\n" +
                        "                            <span class=\"nav-icon\">\n" +
                        "                                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-people\" viewBox=\"0 0 16 16\">\n" +
                        "                                  <path d=\"M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z\"/>\n" +
                        "                                </svg>\n" +
                        "                            </span>\n" +
                        "                            <span class=\"nav-link-text\">Employees</span>\n" +
                        "                        </a>\n" +
                        "                        <!--//nav-link-->\n" +
                        "                    </li>\n" +
                        "                    <!--//nav-item-->");
                }
                checkShift();

                let url_elements = window.location.href.split("/")
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
        }
    }
    ws.onclose = function (e) {
        reconnect(10);
    }
    ws.onerror = function (e) {
        reconnect(10);
    }
}
function reconnect(seconds){
    if (seconds === 0) {
        $('#shift-text').text(`Connection lost: Reconnecting...`)
        return load();
    }
    $('#shift').attr('class', 'circle orange blink center pl-2')
    $('#shift-text').text(`Connection lost: Reconnecting in ${seconds} seconds...`)
    setTimeout(function(){
        reconnect(seconds-1)
    },1000);
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
        page();
    }
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({type: 'SHIFT'}))
    } else {
        setTimeout(function(){checkShift()},500)
    }
}