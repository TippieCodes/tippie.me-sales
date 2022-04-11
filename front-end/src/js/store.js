let store_id;
let store_name;

function page() {
    if (client.role["permission_admin_store_modify"] != true)
        $("a:contains('Change')").closest("div").html("")

    if (client.role["permission_admin_store_admin"] == true) {
        const btn = $("#admin-btn");
        btn.html(`<a class="btn app-btn-secondary" href="#">Login as Admin</a>`)
        btn.on('click', function (e) {
            ws.onmessage = function (e) {
                const data = JSON.parse(e.data);
                switch (data.type) {
                    case 'STORE_ADMIN':
                        window.location.href = vars['auth_url'] + "?token=" + data.data.new_token + "&save=0&callback=" + window.location.origin + root_url
                }
            }
            ws.send(JSON.stringify({
                type: "STORE_ADMIN", data: {
                    store: store_id
                }
            }))
        })
    }

    if (client.role["permission_admin_store_delete"] == true) {
        const delete_btn = $("#delete-btn");
        delete_btn.html(`<a class="btn app-btn-secondary app-btn-danger" href="#">Delete Store</a>`);
        delete_btn.on('click', function (e) {
            if (prompt("Please type 'I really want to remove the " + store_name + " store from sales' to confirm you want to remove this store. Please note that this action is IRREVERSIBLE.") == "I really want to remove the " + store_name + " store from sales") {
                ws.onmessage = function (e) {
                    const data = JSON.parse(e.data);
                    switch (data.type) {
                        case 'STORE_DELETE':
                            if (data.data.ok == true) {
                                alert("Successfully removed " + store_name + " from sales.")
                                window.location.href = "../"
                            } else {
                                alert("Could not remove " + store_name + " from sales!\n" + data.data.message)
                            }
                    }
                }
                ws.send(JSON.stringify({
                    type: "STORE_DELETE", data: {
                        store: store_id
                    }
                }))
            } else {
                alert("Okay, " + store_name + " has not been removed.")
            }
        });
    }

    ws.onmessage = function (e) {
        const data = JSON.parse(e.data);
        switch (data.type) {
            case 'STORE_INFO':
                const store = data.data.store;
                store_name = store["store_name"];
                $("#info-store-id").text(store["store_id"])
                $("#info-store-database").text(store["store_database"])
                $("#info-store-name").text(store["store_name"])
                $("#info-store-url-friendly").text(store["store_url_friendly"])

                $("#appearance-store-logo").prop("src", store["logo_url"])
                $("#appearance-store-favicon").prop("src", store["favicon_url"])
                $("#appearance-login-side-image").prop("href", store["login_side_image"])
                $("#appearance-store-header").text(store["login_side_text_header"])
                $("#appearance-store-body").text(store["login_side_text_body"])

                $("#module-admin").prop("checked", store["module_admin"] == true)
                $("#module-core").prop("checked", store["module_core"] == true)
                $("#module-sales").prop("checked", store["module_sales"] == true)
                $("#module-casino").prop("checked", store["module_casino"] == true)
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    store_id = urlParams.get("id");
    ws.send(JSON.stringify({
        type: "STORE_INFO", data: {
            store: store_id
        }
    }))
}

function changeText(title, type) {

    $("#change-text-label-1").text(title)
    const submit_btn = $("#change-text-submit");
    submit_btn.prop("disabled", false)
    submit_btn.text("Change")
    $("#change-text-input-1").val("")
    const form = document.getElementById("change-text-form");
    document.getElementById('change-text-modal-close').onclick = function () {
        form.style.display = 'none';
    }
    window.onclick = function (event) {
        if (event.target == form) {
            form.style.display = "none";
        }
    }
    form.style.display = 'block'
    submit_btn.off('click');
    submit_btn.on("click", function (e) {
        $("#change-text-submit").prop("disabled", true);
        ws.onmessage = function (e) {
            const data = JSON.parse(e.data);
            switch (data.type) {
                case "STORE_UPDATE":
                    if (data.data.ok == true) {
                        submit_btn.text("Saved!")
                        page()
                        setTimeout(function () {
                            form.style.display = "none";
                        }, 1500)
                    } else {
                        submit_btn.prop("disabled", false);
                        shake("change-text-submit");
                        $("#change-text-error").text(data.data.message);
                    }
            }
        }

        ws.send(JSON.stringify({
            type: "STORE_UPDATE", data: {
                type: type,
                store: store_id,
                new_value: $("#change-text-input-1").val()
            }
        }))
    });
}