let ws;

const modules = {
    "casino/bingo": "CASINO",
    "casino/blackjack": "CASINO",
    "casino/cards": "CASINO",
    "casino/war": "CASINO",
    "employees": "SALES",
    "index": "CORE",
    "sell": "SALES",
    "settings": "CORE",
    "shift": "SALES",
    "shifts": "SALES",
    "stock": "SALES",
    "stores": "ADMIN",
    "store": "ADMIN",
}

const permissions = {
    "casino/bingo": "casino_bingo",
    "casino/blackjack": "casino_blackjack",
    "casino/cards": "casino_cards",
    "casino/war": "null",
    "employees": "list_employees",
    "index": "overview",
    "sell": "sell",
    "settings": "none",
    "shift": "list_shifts",
    "shifts": "list_shifts",
    "stock": "list_stock",
    "stores": "admin_store_list",
    "store": "admin_store_info"
}

let client;
let store;

let navBar = {}

function load() {
    deleteCookie("invite_token")
    ws = new WebSocket(vars['websocket_url']);
    ws.onmessage = function (e) {
        let data = JSON.parse(e.data)
        switch (data.type) {
            case 'UNAUTHORIZED':
                window.location.href = root_url + 'login'
                return;
            case 'PONG':
                client = data.data.client;
                store = data.data.store;

                $("#profile-picture").attr('src', `https://mc-heads.net/avatar/${client.username}`);
                $("#username").text(client.username);
                if (client.role["permission_overview"]) {
                    navBar[1] = `<li class="nav-item">
                        <!--//Bootstrap Icons: https://icons.getbootstrap.com/ -->
                        <a class="nav-link" href="${root_url}">
                            <span class="nav-icon">
                                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-house-door"
                                    fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd"
                                        d="M7.646 1.146a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 .146.354v7a.5.5 0 0 1-.5.5H9.5a.5.5 0 0 1-.5-.5v-4H7v4a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .146-.354l6-6zM2.5 7.707V14H6v-4a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v4h3.5V7.707L8 2.207l-5.5 5.5z" />
                                    <path fill-rule="evenodd"
                                        d="M13 2.5V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z" />
                                </svg>
                            </span>
                            <span class="nav-link-text">Overview</span>
                        </a>
                        <!--//nav-link-->
                    </li>`
                }
                if (store[`module_admin`] == true) {
                    if (client.role["permission_admin_store_list"]) {
                        navBar[7] = "<li class=\"nav-item\" id=\"nav-stores\">\n" +
                            "                        <!--//Bootstrap Icons: https://icons.getbootstrap.com/ -->\n" +
                            "                        <a class=\"nav-link\" href=\"" + root_url + "stores\">\n" +
                            "                            <span class=\"nav-icon\">\n" +
                            "                                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-shop\" viewBox=\"0 0 16 16\">\n" +
                            "                                 <path d=\"M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.371 2.371 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976l2.61-3.045zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0zM1.5 8.5A.5.5 0 0 1 2 9v6h1v-5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5h6V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5zM4 15h3v-5H4v5zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3zm3 0h-2v3h2v-3z\"/>\n" +
                            "                                 </svg>" +
                            "                            </span>\n" +
                            "                            <span class=\"nav-link-text\">Stores</span>\n" +
                            "                        </a>\n" +
                            "                        <!--//nav-link-->\n" +
                            "                    </li>\n" +
                            "                    <!--//nav-item-->";
                    }
                }
                if (store[`module_sales`] == true) {
                    if (client.role["permission_list_employees"]) {
                        navBar[6] = "<li class=\"nav-item\" id=\"nav-employees\">\n" +
                            "                        <!--//Bootstrap Icons: https://icons.getbootstrap.com/ -->\n" +
                            "                        <a class=\"nav-link\" href=\"" + root_url + "employees\">\n" +
                            "                            <span class=\"nav-icon\">\n" +
                            "                                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-people\" viewBox=\"0 0 16 16\">\n" +
                            "                                  <path d=\"M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z\"/>\n" +
                            "                                </svg>\n" +
                            "                            </span>\n" +
                            "                            <span class=\"nav-link-text\">Employees</span>\n" +
                            "                        </a>\n" +
                            "                        <!--//nav-link-->\n" +
                            "                    </li>\n" +
                            "                    <!--//nav-item-->";
                    }
                    if (client.role["permission_sell"]) {
                        navBar[2] = `<!--//nav-item-->
                    <li class="nav-item">
                        <!--//Bootstrap Icons: https://icons.getbootstrap.com/ -->
                        <a class="nav-link" href="${root_url}sell">
                            <span class="nav-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cash-stack" viewBox="0 0 16 16">
                                    <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
                                    <path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2H3z"/>
                                  </svg>
                            </span>
                            <span class="nav-link-text">Sell</span>
                        </a>
                        <!--//nav-link-->
                    </li>`
                    }
                    if (client.role["permission_list_stock"]) {
                        navBar[3] = `<li class="nav-item">
                        <!--//Bootstrap Icons: https://icons.getbootstrap.com/ -->
                        <a class="nav-link" href="${root_url}stock">
                            <span class="nav-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                    class="bi bi-box-seam" viewBox="0 0 16 16">
                                    <path
                                        d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2l-2.218-.887zm3.564 1.426L5.596 5 8 5.961 14.154 3.5l-2.404-.961zm3.25 1.7l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z" />
                                </svg>
                            </span>
                            <span class="nav-link-text">Stock</span>
                        </a>
                        <!--//nav-link-->
                    </li>`
                    }
                    if (client.role["permission_list_shifts"]) {
                        navBar[4] = `<li class="nav-item">
                        <!--//Bootstrap Icons: https://icons.getbootstrap.com/ -->
                        <a class="nav-link" href="${root_url}shifts">
                            <span class="nav-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clock-history" viewBox="0 0 16 16">
                                    <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/>
                                    <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/>
                                    <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/>
                                  </svg>
                            </span>
                            <span class="nav-link-text">Shifts</span>
                        </a>
                        <!--//nav-link-->
                    </li>`
                    }
                }
                checkPage();
                //ws.send(JSON.stringify({type: "STORE"}));
                page();
                break;
        }
    }
    ws.onclose = function (e) {
        reconnect(10);
    }
    ws.onopen = function (e) {
        ws.send(JSON.stringify({type: "PING"}));
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
    window.location.href = root_url + 'login'
}

function checkPage() {
    const ws2 = new WebSocket(vars['websocket_url'])
    ws2.onmessage = function (e) {
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
        } else if (data.type == 'STORE'){
            let store = data.data;
            let current = window.location.href.split(window.location.host+root_url)[1].split("?")[0];
            if (current == "") current = "index"
            $(".logo-icon").attr("src", store.logo_url)
            $(`link[rel="shortcut icon"]`).attr("href", store.favicon_url)
            $("title").text(`${store.store_name} Online Area`)
            if (store[`module_${modules[current].toLowerCase()}`] != true) {
                $(".container-xl").first().html(`
                        <h1 class="app-page-title">${current}</h1>
                <div class="alert alert-danger" role="alert">
                    <div class="inner">
                    <div class="app-card-body p-3 p-lg-4">
                    <h3 class="mb-3">Module not enabled!</h3>
                <div class="row gx-5 gy-3">
                    <div class="col-12 col-lg-9">
                        <div>The ${modules[current].toLowerCase()} module is not enabled. If you believe this is a mistake contact your store owner.</div>
                    </div><!--//col-->
                </div><!--//row-->
            </div><!--//app-card-body-->

            </div><!--//inner-->
            </div>`)
            }

            if (client.role[`permission_${permissions[current]}`] != true && permissions[current] != "none") {
                $(".container-xl").first().html(`
                        <h1 class="app-page-title">${escapeHtml(current)}</h1>
                <div class="alert alert-danger" role="alert">
                    <div class="inner">
                    <div class="app-card-body p-3 p-lg-4">
                    <h3 class="mb-3">No permission!</h3>
                <div class="row gx-5 gy-3">
                    <div class="col-12 col-lg-9">
                        <div>You don't have the required permission to view this page. Required permission: ${escapeHtml(permissions[current])}</div>
                    </div><!--//col-->
                </div><!--//row-->
            </div><!--//app-card-body-->

            </div><!--//inner-->
            </div>`)
            }

            if (store[`module_casino`] == true && (client.role["permission_casino_cards"] || client.role["permission_casino_bingo"] || client.role["permission_casino_blackjack"])) {
                navBar[5] = `<li class="nav-item has-submenu">
                    <a id="casino" class="nav-link submenu-toggle" href="javascript:void(0)" data-toggle="collapse"
                       data-target="#submenu-casino" aria-expanded="false" aria-controls="submenu-casino">
						        <span class="nav-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                         class="bi bi-dice-6-fill" viewBox="0 0 16 16">
                                      <path
                                          d="M3 0a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V3a3 3 0 0 0-3-3H3zm1 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm1.5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM12 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM5.5 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM4 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                                    </svg>
                                </span>
                        <span class="nav-link-text">Casino</span>
                        <span class="submenu-arrow">
		                             <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-chevron-down"
                                          fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                         <path fill-rule="evenodd"
                                               d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                                     </svg>
	                             </span><!--//submenu-arrow-->
                    </a><!--//nav-link-->
                    <div id="submenu-casino" class="collapse submenu submenu-1" data-parent="#nav-bar">
                        <ul class="submenu-list list-unstyled">
                            ${(client.role["permission_casino_cards"] == true) ? `<li class="submenu-item"><a class="submenu-link" href="${root_url}casino/cards">Card Management</a></li>` : ""}
                            ${(client.role["permission_casino_bingo"] == true) ? `<li class="submenu-item"><a class="submenu-link" href="${root_url}casino/bingo">Bingo</a></li>` : ""}
                            ${(client.role["permission_casino_blackjack"] == true) ? `<li class="submenu-item"><a class="submenu-link" href="${root_url}casino/blackjack">Blackjack</a></li>` : ""}
                                                <!--<li class="submenu-item"><a class="submenu-link" href="casino/war">War</a></li>-->
                        </ul>
                    </div>
                </li>
                    <!--//nav-item-->`
            }
            loadNavBar();
        }
    }
    ws2.onopen = function (e){
        ws2.send(JSON.stringify({type: "SHIFT"}))
        ws2.send(JSON.stringify({type: "STORE"}))
    }
}

function loadNavBar(){
    const nav_element = $("#nav-bar")
    nav_element.html("")
    for (const element of Object.values(navBar)){
        nav_element.append(element);
    }
    let url_elements = window.location.href.split("/")
    if (url_elements.length > 4 && url_elements[4].toLowerCase() == "casino"){
        $(`#casino`).addClass("active");
        $(`#casino`).attr("aria-expanded", "true");
        $(`#submenu-casino`).addClass("show");
        $(`#app-nav-main a`).attr('href', function(index, href) {
            if (href.indexOf('http') === 0 || href.indexOf('javascript:void(0)') === 0) {
                return href;
            } else {
                return '../' + href;
            }
        });
    }
    if (window.location.href.split("")[window.location.href.split("").length - 1] == "#") {
        window.location.href = window.location.href.slice(0, -1);
    } else if (url_elements[url_elements.length - 1] == "" && url_elements[url_elements.length - 2] != root_url_name) {
        //window.location.href = window.location.href.slice(0, -1);
    } else if (url_elements[url_elements.length - 2] == root_url_name && window.location.href.split("")[window.location.href.split("").length - 1] == "/") {
        $(`a[href="/"]`).addClass(`active`);
    } else if (url_elements[url_elements.length - 1].includes("?")) {
        $(`a[href="${url_elements[url_elements.length - 1].split("?")[0]}"]`).addClass(`active`)
    } else if ((url_elements[url_elements - 2] != root_url_name && url_elements[url_elements.length - 1] == "")) {
        return $(`a[href="${url_elements[url_elements.length - 1]}"]`).addClass(`active`);
    } else if (url_elements[url_elements.length - 1] == 'app') {
        $(`a[href="apps"]`).addClass(`active`);
    } else {
        $(`a[href$="${url_elements[url_elements.length - 1]}"]`).addClass(`active`);
    }
}
