// noinspection JSJQueryEfficiency

let user_list, data, roles;

function page() {
    ws.onmessage = function (e) {
        data = JSON.parse(e.data)
        switch (data.type) {
            case 'EMPLOYEE_LIST':
                //TODO sorting
                user_list = data.data.sort((a, b) => (a.role.role_priority > b.role.role_priority) ? 1 : -1)
                roles = data.roles;
                roles.sort((a, b) => (a.role_priority > b.role_priority) ? 1 : -1)
                setTable(0, 10);
        }
    }
    ws.send(JSON.stringify({type: "EMPLOYEE_LIST"}))

    if (client.role["permission_manage_employees"] == true) $('#new-item').html(`<a href="javascript:void(0)" onClick="newInvite()">New invite</a>`);
}

function setTable(start, amount) {
    let items = `<div class="tab-content" id="orders-table-tab-content">
    <div class="tab-pane fade show active" id="orders-all" role="tabpanel" aria-labelledby="orders-all-tab">
        <div class="app-card app-card-orders-table shadow-sm">
        <div class="table-responsive">
    <table class="table app-table-hover mb-0 text-left">
        <thead>
            <tr>
                <th class="cell">Employee ID</th>
                <th class="cell">Employee Username</th>
                <th class="cell">Employee Role</th>
                <th class="cell">Status</th>
                <th class="cell">Owe Percentage</th>
                <th class="cell">Last Activity</th>
                ${(client.role["permission_manage_employees"] == true) ? '<th class="cell">Manage</th>' : ''}
            </tr>
        </thead>
    <tbody>`
    let x = start
    let p = 0
    for (let i = 0; i < parseInt(amount - 1) + 1; i++) {
        if (!user_list[x]) break;
        let status = `<span class="badge bg-success">Enabled</span>`
        if (user_list[x].legacy_user == true) status = `<span class="badge bg-warning text-dark">Legacy</span>`
        if (user_list[x].disabled == true) status = `<span class="badge bg-danger">Disabled</span>`
        if (user_list[x].invited == true) status = `<span class="badge bg-info">Invited</span>`
        let last_activity = user_list[x].last_activity;
        let last_activity_color = '#5d6778';
        if (last_activity == -1) {
            last_activity = '90+'
            last_activity_color = 'red'
        } else if (last_activity > 45) {
            last_activity_color = 'red'
        } else if (last_activity > 25) {
            last_activity_color = 'orange'
        } else if (last_activity > 15) {
            last_activity_color = 'gold'
        }

        if (user_list[x].invited == false) {
            items += `<tr>
        <td class="cell">#${escapeHtml(user_list[x].user_id)}</td>
        <td class="cell">${escapeHtml(user_list[x].user_name)}</td>
        <td class="cell">${escapeHtml(user_list[x].role.role_name)}</td>
        <td class="cell">${status}</td>
        <td class="cell">${escapeHtml(user_list[x].user_owe + "%")}</td>
        <td class="cell" style="color:${last_activity_color}">${escapeHtml(last_activity + ' days ago')}</td>
        <td class="cell">
        ${(client.role["permission_manage_employees"] == true) ? `<a class="btn-sm app-btn-secondary" href="javascript:void(0)" onclick="modify(${x})" >Modify</a></td>` : ''}</td>`;
        } else {
            items += `<tr>
        <td class="cell">#${escapeHtml(user_list[x].user_id)}</td>
        <td class="cell">${escapeHtml(user_list[x].user_name)}</td>
        <td class="cell">${escapeHtml(user_list[x].role.role_name)}</td>
        <td class="cell">${status}</td>
        <td class="cell">${escapeHtml(user_list[x].user_owe + "%")}</td>
        <td class="cell">n/a</td>
        <td class="cell">
        ${(client.role["permission_manage_employees"] == true) ? `<a class="btn-sm app-btn-secondary" href="javascript:void(0)" onclick="modify(${x})" >Modify</a></td>` : ''}</td>`;
        }
        if (user_list[x]) p++;
        x++;
    }
    items += `</tbody></table></div></div></div></div>`
    $('#item-list').html(items);
    $('#amount-showing').text(`Showing ${p} out of ${user_list.length} entries.`)
    let a_btn = Math.ceil((user_list.length) / amount)
    let c_btn = Math.ceil((start + 1) / amount)
    let pagination = `<nav class="app-pagination pt-3">
    <ul class="pagination justify-content-end"> 
        <li class="page-item ${(c_btn == 1) ? 'disabled' : ''}">
            <a class="page-link" aria-disabled="true" href="javascript:void(0)" onClick="setTable(${(c_btn - 2) * (amount)}, ${amount})">Previous</a>
        </li>`
    if (a_btn > 6) {
        if (c_btn > a_btn - 3) {
            pagination += `<li class="page-item"><a class="page-link" href="javascript:void(0)" onClick='setTable(0, ${amount})'>1</a></li>`
            pagination += `<li class="page-item"><a class="page-link" href="javascript:void(0)">...</a></li>`
            for (let i = a_btn - 5; i < a_btn; i++) {
                if (i < 0) continue;
                pagination += `<li class="page-item ${(c_btn - 1 == i) ? 'active' : ''}"><a class="page-link" href="javascript:void(0)" onClick='setTable(${i * (amount)}, ${amount})'>${i + 1}</a></li>`
            }
        } else if (c_btn <= 3) {
            for (let i = 0; i < 5; i++) {
                if (i < 0) continue;
                pagination += `<li class="page-item ${(c_btn - 1 == i) ? 'active' : ''}"><a class="page-link" href="javascript:void(0)" onClick='setTable(${i * (amount)}, ${amount})'>${i + 1}</a></li>`
            }
            pagination += `<li class="page-item"><a class="page-link" href="javascript:void(0)">...</a></li>`
            pagination += `<li class="page-item"><a class="page-link" href="javascript:void(0)" onClick='setTable(${(a_btn - 1) * (amount)}, ${amount})'>${a_btn}</a></li>`
        } else {
            pagination += `<li class="page-item"><a class="page-link" href="javascript:void(0)" onClick='setTable(0, ${amount})'>1</a></li>`
            pagination += `<li class="page-item"><a class="page-link" href="javascript:void(0)">...</a></li>`
            for (let i = c_btn - 2; i < c_btn + 1 && i < a_btn; i++) {
                if (i < 0) continue;
                pagination += `<li class="page-item ${(c_btn - 1 == i) ? 'active' : ''}"><a class="page-link" href="javascript:void(0)" onClick='setTable(${i * (amount)}, ${amount})'>${i + 1}</a></li>`
            }
            pagination += `<li class="page-item"><a class="page-link" href="javascript:void(0)">...</a></li>`
            pagination += `<li class="page-item"><a class="page-link" href="javascript:void(0)" onClick='setTable(${(a_btn - 1) * (amount)}, ${amount})'>${a_btn}</a></li>`
        }
    } else {
        for (let i = 0; i < a_btn; i++) {
            pagination += `<li class="page-item ${(c_btn - 1 == i) ? 'active' : ''}"><a class="page-link" href="javascript:void(0)" onClick='setTable(${i * (amount)}, ${amount})'>${i + 1}</a></li>`
        }
    }
    pagination += `<li class="page-item ${(c_btn == a_btn) ? 'disabled' : ''}">
    <a class="page-link" href="javascript:void(0)" onClick="setTable(${((c_btn) * (amount))}, ${amount})">Next</a></li></ul></nav>`
    $('#pagination').html(pagination)
    $(function () {
        $(".dropdown-menu").on('click', 'a', function () {
            $(this).parents('.dropdown').find('a').text($(this).text());
        });
    });
}


const modal = document.getElementById("model");
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

function modify(id) {
    resetModel();
    const user = user_list[id];
    $('#model-row-default').append(`<div class="col-auto">
                                    <label for="new-username" class="form-label">Username</label>
                                    <input type="text" class="form-control" id="new-username" value="${user['user_name']}">
                                    </div>`)
    $('#model-row-default').append(`<div class="col-auto">
                                    <label for="new-role" class="form-label">Role</label>
                                    <select type="text" class="form-control" id="new-role">
                                    </select>
                                    </div>`)
    for (const role of roles) {
        $('#new-role').append(`<option value="${role.role_id}" ${(user['user_role'] == role['role_id']) ? 'selected' : ''}>${role.role_name}</option>`)
    }
    $('#model-row-default').append(`<div class="col-auto">
                                    <label for="new-owe" class="form-label">Owe Percentage</label>
                                    <input type="number" class="form-control" id="new-owe" value="${user['user_owe']}">
                                    </div>`)
    $('#model-submit').attr('onclick', `updateEmployeeSubmit(${id})`);
    $('#model-submit').text('Update Employee')
    $('#model-submit').after(`<button type="submit" class="btn app-btn-secondary" id="model-submit-disable" style="margin-left: 5px;" onclick="toggleEnabled(${id})">${user['disabled'] == false ? 'Disable' : 'Enable'}</button>`)
    if (user['invited'] != true) {
        $('#model-submit').after(`<button type="submit" class="btn app-btn-primary" id="model-submit-reset-passw" style="margin-left: 5px;" onclick="resetPassword(${id})">Reset Password</button>`)
    } else {
        $('#model-submit').after(`<button type="submit" class="btn app-btn-primary" id="model-submit-copy-link" style="margin-left: 5px;" onclick="copyLink(${id})">Copy Invite Link</button>`)
    }
    modal.style.display = "block";
}

function copyLink(id){
    const user = user_list[id];
    $('#model-submit-copy-link').attr('disabled', true)
    ws.onmessage = function (e) {
        const data = JSON.parse(e.data);
        if (data.type != 'EMPLOYEE_UPDATE') {
            return;
        }
        if (data.data.success == true) {
            const invite = origin + "/register" + "?id="+client.store+"&token="+data.data.invite;
            copyTextToClipboard(invite, a => {
                if (a == true) {
                    $('#model-submit-copy-link').text('Invite copied to clipboard')
                    setTimeout(function () {
                        model.style.display = "none"
                        page();
                    }, 2500)
                } else {
                    $('#model-submit-copy-link').text('Invite successfully created')
                    $('#error-text').text("Invite: " + invite)
                }
            })

            $('#model-submit-copy-link').text('Employee Updated!')
            setTimeout(function () {
                model.style.display = "none"
                page();
            }, 2500)

        } else {
            shake("model-submit-copy-link")
            $('#model-submit-copy-link').attr('disabled', false)
            $('#error-text').text(data.data.message)
        }
    }
    ws.send(JSON.stringify({
        type: "EMPLOYEE_UPDATE",
        data: {
            type: 'COPY_INVITE',
            user_id: user.user_id
        }
    }))
}

function updateEmployeeSubmit(id) {
    const user = user_list[id];
    $('#model-submit').attr('disabled', true)
    ws.onmessage = function (e) {
        const data = JSON.parse(e.data);
        if (data.type != 'EMPLOYEE_UPDATE') {
            return;
        }
        if (data.data.success == true) {

            $('#model-submit').text('Employee Updated!')
            setTimeout(function () {
                model.style.display = "none"
                page();
            }, 2500)

        } else {
            shake("model-submit")
            $('#model-submit').attr('disabled', false)
            $('#error-text').text(data.data.message)
        }
    }
    ws.send(JSON.stringify({
        type: "EMPLOYEE_UPDATE",
        data: {
            user_id: user.user_id,
            username: $("#new-username").val(),
            role: $("#new-role").val(),
            owe: $("#new-owe").val(),
            disabled: user['disabled']
        }
    }))
}

function toggleEnabled(id) {
    const user = user_list[id];
    if (!confirm(`Are you sure you want to ${(user['disabled'] == true) ? 'enable' : 'disable'} Employee ${user['user_name']}?`)) return;
    $('#model-submit-disable').attr('disabled', true)
    ws.onmessage = function (e) {
        const data = JSON.parse(e.data);
        if (data.type != 'EMPLOYEE_UPDATE') {
            return;
        }
        if (data.data.success == true) {

            $('#model-submit-disable').text((user['disabled'] == true) ? 'Enabled!' : 'Disabled!')
            setTimeout(function () {
                model.style.display = "none"
                page();
            }, 2500)

        } else {
            shake("model-submit-disable")
            $('#model-submit-disable').attr('disabled', false)
            $('#error-text').text(data.data.message)
        }
    }
    ws.send(JSON.stringify({
        type: "EMPLOYEE_UPDATE",
        data: {
            user_id: user.user_id,
            username: user['user_name'],
            role: user['user_role'],
            owe: user['user_owe'],
            disabled: (user['disabled'] == true) ? 0 : 1
        }
    }))
}


function resetPassword(id){
    resetModel();
    const user = user_list[id];
    $('#model-row-default').append(`<div class="col-auto">
                                    <label for="new-username" class="form-label">Username</label>
                                    <input type="text" class="form-control" id="new-username" value="${user['user_name']}" disabled>
                                    </div>`)
    $('#model-row-default').after(`<div class="row mb-3" id="model-row-default">
                                    <div class="col-auto">
                                    <label for="new-username" class="form-label">Repeat new Password</label>
                                    <input type="password" class="form-control" id="new-passw" style="width: 500px" value="">
                                    </div></div>`)
    $('#model-row-default').after(`<div class="row mb-3" id="model-row-default">
                                    <div class="col-auto">
                                    <label for="new-username" class="form-label">New Password</label>
                                    <input type="password" class="form-control" id="new-passw1" style="width: 500px" value="">
                                    </div></div>`)
    $('#model-submit').attr('onclick', `resetPasswordSubmit(${id})`);
    $('#model-submit').text('Reset Password')
    modal.style.display = "block";
}

function resetPasswordSubmit(id) {
    let password = $('#new-password').val();
    $('#model-submit').attr('disabled', true);
    const newpassw = $('#new-passw').val();
    const repeatedpassw = $('#new-passw1').val();

    if (newpassw !== repeatedpassw) {
        shake('model-submit')
        $('#model-submit').prop('disabled', false)
        $('#error-text').text('The repeated password is not the same.')
        return;
    }
    ws.onmessage = function (e) {
        const data = JSON.parse(e.data);
        if (data.type != 'EMPLOYEE_UPDATE') {
            return;
        }
        if (data.data.success == true) {

            $('#model-submit').text('Password updated!')
            setTimeout(function () {
                model.style.display = "none"
                page();
            }, 2500)

        } else {
            shake("model-submit")
            $('#model-submit').attr('disabled', false)
            $('#error-text').text(data.data.message)
        }
    }
    ws.send(JSON.stringify({type: 'EMPLOYEE_UPDATE', data: {type: 'PASSWORD_RESET', user_id: user_list[id]['user_id'], new: newpassw}}))
}

function resetModel() {
    $('#model-content').html(`<div class='row mb-3' id="model-row-default">
            </div>
            <button type="submit" class="btn app-btn-primary" id='model-submit' onclick="placeholderfunction();">Add item</button><span class='ml-2' id='error-text' style="color:red;"></span><span id='model-close' class="close" onclick="modal.style.display = 'none';">&times;</span>`)
}

function newInvite() {
    resetModel();
    $('#model-row-default').append(`<div class="col-auto">
                                    <label for="new-username" class="form-label">Username</label>
                                    <input type="text" class="form-control" id="new-username" value="">
                                    </div>`)
    $('#model-row-default').append(`<div class="col-auto">
                                    <label for="new-role" class="form-label">Role</label>
                                    <select type="text" class="form-control" id="new-role">
                                    </select>
                                    </div>`)
    for (const role of roles) {
        $('#new-role').append(`<option value="${role.role_id}">${role.role_name}</option>`)
    }
    $('#model-row-default').append(`<div class="col-auto">
                                    <label for="new-owe" class="form-label">Owe Percentage</label>
                                    <input type="number" class="form-control" id="new-owe" value="60">
                                    </div>`)
    $('#model-submit').attr('onclick', 'newInviteSubmit()');
    $('#model-submit').text('Create new invite')
    modal.style.display = "block";
}

function newInviteSubmit() {
    $('#model-submit').attr('disabled', true)
    ws.onmessage = function (e) {
        const data = JSON.parse(e.data);
        if (data.type != 'NEW_INVITE') {
            return;
        }
        if (data.data.success == true) {
            const invite = origin + "/register" + "?id="+client.store+"&token="+data.data.invite;
            copyTextToClipboard(invite, a => {
                if (a == true) {
                    $('#model-submit').text('Invite copied to clipboard')
                    setTimeout(function () {
                        model.style.display = "none"
                        page();
                    }, 2500)
                } else {
                    $('#model-submit').text('Invite successfully created')
                    $('#error-text').text("Invite: " + invite)
                }
            })
        } else {
            shake("model-submit")
            $('#model-submit').attr('disabled', false)
            $('#error-text').text(data.data.message)
        }
    }
    ws.send(JSON.stringify({
        type: "NEW_INVITE",
        data: {
            username: $("#new-username").val(),
            role: $("#new-role").val(),
            owe: $("#new-owe").val()
        }
    }))
}