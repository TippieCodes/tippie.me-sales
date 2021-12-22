let item_list, data, roles;
function page() {
    ws.onmessage = function (e) {
        data = JSON.parse(e.data)
        switch (data.type) {
            case 'EMPLOYEE_LIST':
                //TODO sorting
                item_list = data.data.sort((a,b) => (a.role.role_priority > b.role.role_priority)? 1 : -1)
                roles = data.roles;
                roles.sort((a,b) => (a.role_priority > b.role_priority) ? 1 : -1)
                setTable(0, 10);
        }
    }
    ws.send(JSON.stringify({ type: "EMPLOYEE_LIST" }))
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
        if (!item_list[x]) break;
        let status = `<span class="badge bg-success">Enabled</span>`
        if (item_list[x].legacy_user == true) status = `<span class="badge bg-warning text-dark">Legacy</span>`
        if (item_list[x].disabled == true) status = `<span class="badge bg-danger">Disabled</span>`
        if (item_list[x].invited == true) status = `<span class="badge bg-info">Invited</span>`
        let last_activity = item_list[x].last_activity;
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

        if (item_list[x].invited == false) {
            items += `<tr>
        <td class="cell">#${escapeHtml(item_list[x].user_id)}</td>
        <td class="cell">${escapeHtml(item_list[x].user_name)}</td>
        <td class="cell">${escapeHtml(item_list[x].role.role_name)}</td>
        <td class="cell">${status}</td>
        <td class="cell">${escapeHtml(item_list[x].user_owe + "%")}</td>
        <td class="cell" style="color:${last_activity_color}">${escapeHtml(last_activity + ' days ago')}</td>
        <td class="cell">
        ${(client.role["permission_manage_employees"] == true) ? `<div class="dropdown">
        <a class="btn-sm app-btn-secondary dropdown-toggle" aria-expanded="false" data-toggle="dropdown" aria-haspopup="true" >Disable</a>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
        <a class="dropdown-item" href="javascript:void(0)" onclick="resetPassword(${item_list[x].user_id})">Reset Password</a>
        <a class="dropdown-item" href="javascript:void(0)" onclick="updateUsername(${item_list[x].user_id})">Change Username</a>
        <a class="dropdown-item" href="javascript:void(0)" onclick="updateRole(${item_list[x].user_id})">Change Role</a>
        <a class="dropdown-item" href="javascript:void(0)" onclick="updateOwe(${item_list[x].user_id})">Change Owe</a>
        ${(item_list[x].disabled == false) ? '<a class="dropdown-item" style="color:red" href="javascript:void(0)" onclick="disableAccount(${item_list[x].user_id})">Disable</a>' :
                '<a class="dropdown-item" style="color:green" href="javascript:void(0)" onclick="enableAccount(${item_list[x].user_id})">Enable</a>'}
        </div></div>`:''}</td>`;
        } else {
            items += `<tr>
        <td class="cell">#${escapeHtml(item_list[x].user_id)}</td>
        <td class="cell">${escapeHtml(item_list[x].user_name)}</td>
        <td class="cell">${escapeHtml(item_list[x].role.role_name)}</td>
        <td class="cell">${status}</td>
        <td class="cell">${escapeHtml(item_list[x].user_owe + "%")}</td>
        <td class="cell">n/a</td>
        <td class="cell">
        ${(client.role["permission_manage_employees"] == true) ? `<div class="dropdown">
        <a class="btn-sm app-btn-secondary dropdown-toggle" aria-expanded="false" data-toggle="dropdown" aria-haspopup="true" >Disable</a>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
        <a class="dropdown-item" href="javascript:void(0)" onclick="copyInvite(${item_list[x].user_id})">Copy Invite</a>
        <a class="dropdown-item" href="javascript:void(0)" onclick="updateUsername(${item_list[x].user_id})">Change Username</a>
        <a class="dropdown-item" href="javascript:void(0)" onclick="updateRole(${item_list[x].user_id})">Change Role</a>
        <a class="dropdown-item" href="javascript:void(0)" onclick="updateOwe(${item_list[x].user_id})">Change Owe</a>
        <a class="dropdown-item" style="color:red" href="javascript:void(0)" onclick="deleteInvite(${item_list[x].user_id})">Delete invite</a>'
        </div></div>`:''}</td>`;
        }
        if (item_list[x]) p++;
        x++;
    }
    items += `</tbody></table></div></div></div></div>`
    $('#item-list').html(items);
    $('#amount-showing').text(`Showing ${p} out of ${item_list.length} entries.`)
    let a_btn = Math.ceil((item_list.length) / amount)
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
            for (let i = a_btn - 5;i < a_btn; i++) {
                if (i < 0) continue;
                pagination += `<li class="page-item ${(c_btn - 1 == i) ? 'active' : ''}"><a class="page-link" href="javascript:void(0)" onClick='setTable(${i * (amount)}, ${amount})'>${i + 1}</a></li>`
            }
        } else if (c_btn <= 3) {
            for (let i = 0 ;i < 5; i++) {
                if (i < 0) continue;
                pagination += `<li class="page-item ${(c_btn - 1 == i) ? 'active' : ''}"><a class="page-link" href="javascript:void(0)" onClick='setTable(${i * (amount)}, ${amount})'>${i + 1}</a></li>`
            }
            pagination += `<li class="page-item"><a class="page-link" href="javascript:void(0)">...</a></li>`
            pagination += `<li class="page-item"><a class="page-link" href="javascript:void(0)" onClick='setTable(${(a_btn-1) * (amount)}, ${amount})'>${a_btn}</a></li>`
        } else {
            pagination += `<li class="page-item"><a class="page-link" href="javascript:void(0)" onClick='setTable(0, ${amount})'>1</a></li>`
            pagination += `<li class="page-item"><a class="page-link" href="javascript:void(0)">...</a></li>`
            for (let i = c_btn - 2; i < c_btn + 1 && i < a_btn; i++) {
                if (i < 0) continue;
                pagination += `<li class="page-item ${(c_btn - 1 == i) ? 'active' : ''}"><a class="page-link" href="javascript:void(0)" onClick='setTable(${i * (amount)}, ${amount})'>${i + 1}</a></li>`
            }
            pagination += `<li class="page-item"><a class="page-link" href="javascript:void(0)">...</a></li>`
            pagination += `<li class="page-item"><a class="page-link" href="javascript:void(0)" onClick='setTable(${(a_btn-1) * (amount)}, ${amount})'>${a_btn}</a></li>`
        }
    } else {
        for (let i = 0; i < a_btn; i++) {
            pagination += `<li class="page-item ${(c_btn - 1 == i) ? 'active' : ''}"><a class="page-link" href="javascript:void(0)" onClick='setTable(${i * (amount)}, ${amount})'>${i + 1}</a></li>`
        }
    }
    pagination += `<li class="page-item ${(c_btn == a_btn) ? 'disabled' : ''}">
    <a class="page-link" href="javascript:void(0)" onClick="setTable(${((c_btn) * (amount))}, ${amount})">Next</a></li></ul></nav>`
    $('#pagination').html(pagination)
    $(function(){
        $(".dropdown-menu").on('click', 'a', function(){
            $(this).parents('.dropdown').find('a').text($(this).text());
        });
    });
}


const modal = document.getElementById("model");
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

function resetPassword(id){
    resetModel();
    $('#model-row-default').append(`<div class="col-auto">
                                    <label for="setting-input-1" class="form-label">New Password</label>
                                    <input type="password" class="form-control" id="new-password" value="">
                                    </div>`)
    $('#model-submit').prop(`onClick', 'resetPasswordSubmit(${id})`)
    $('#model-submit').text('Reset password')
    modal.style.display = "block";
}

function resetPasswordSubmit(id){
    let password = $('#new-password').val();
    $('#model-submit').attr('disabled', true);
    ws.onmessage = function (e){
        const data = JSON.parse(e.data)
        if (data.type == 'ERROR'){
            $('#model-submit').prop('disabled',false)
            shake('model-submit')
            $('#errortext').text('An unexpected error occurred.')
        } else if (data.type == 'INVALID_CHECK') {
            $('#model-submit').prop('disabled',false)
            shake('model-submit')
            $('#errortext').text(data.data)
        } else if (data.type == 'OK') {
            $('submit').text('Password updated!')
            setTimeout(function () {
                model.style.disabled = 'none';
            }, 2000)
        }
    }
    ws.send(JSON.stringify({type:'RESET_PASSWORD', data:{id:id,new:password}}))
}

function resetModel(){
    $('#model-content').html(`<div class='row mb-3' id="model-row-default">
            </div>
            <button type="submit" class="btn app-btn-primary" id='model-submit' onclick="placeholderfunction();">Add item</button><span class='ml-2' id='error-text' style="color:red;"></span><span id='model-close' class="close" onclick="modal.style.display = 'none';">&times;</span>`)
}

function newInvite(){
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

function newInviteSubmit(){
    $('#model-submit').attr('disabled', true)
    ws.onmessage = function(e){
        const data = JSON.parse(e.data);
        if (data.type != 'NEW_INVITE'){
            return;
        }
        if (data.data.success == true){
            copyTextToClipboard(data.data.link, a => {
                if (a == true) {
                    $('#model-submit').text('Invite copied to clipboard')
                    setTimeout(function () {
                        model.style.display = "none"
                        page();
                    }, 2500)
                } else {
                    $('#model-submit').text('Invite successfully created')
                    $('#error-text').text("Invite: " +data.data.link)
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