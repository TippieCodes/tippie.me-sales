const urlParams = new URLSearchParams(window.location.search)
let item_list, data;
function page() {
    $('#shift-id').text(urlParams.get('id'))
    ws.onmessage = function (e) {
        const data = JSON.parse(e.data)
        if (data.type == 'SHIFT_INFO') {
            console.log(data)
            $('#stat-total').text('$' + data.data.sales);
            $('#stat-owe').text('$' + data.data.owe);
            $('#stat-orders').text(data.data.orders);
            $('#stat-items').text(data.data.items);
            item_list = data.data.order_list;
            setTable(0, 20);
        }
    }
    ws.send(JSON.stringify({ type: 'SHIFT_INFO', id: urlParams.get('id') }))
}

function setTable(start, amount) {
    let items = `<div class="tab-content" id="orders-table-tab-content">
    <div class="tab-pane fade show active" id="orders-all" role="tabpanel" aria-labelledby="orders-all-tab">
        <div class="app-card app-card-orders-table shadow-sm">
        <div class="table-responsive">
    <table class="table app-table-hover mb-0 text-left">
        <thead>
            <tr>
                <th class="cell">Order ID</th>
                <th class="cell">Order Employee</th>
                <th class="cell">Order Date</th>
                <th class="cell">Items Sold</th>
                <th class="cell">Total Sales</th>
                <th class="cell">Total Owe</th>
                <th class="cell"></th>
            </tr>
        </thead>
    <tbody>`
    let x = start
    let p = 0
    for (let i = 0; i < parseInt(amount - 1) + 1; i++) {
        if (!item_list[x]) break;
        items += `<tr>
        <td class="cell">#${escapeHtml(item_list[x].order_id)}</td>
        <td class="cell">${escapeHtml(item_list[x].employee_name)}</td>
        <td class="cell">${escapeHtml(new Date(item_list[x].order_at).toDateString())}</td>
        <td class="cell">${escapeHtml(item_list[x].order_items.length)}</td>
        <td class="cell">¥${escapeHtml(item_list[x].order_total)}</td>
        <td class="cell">¥${escapeHtml(item_list[x].order_owe)}</td>
        <td class="cell"><a class="btn-sm app-btn-secondary" href="javascript:void(0)" onclick="$('#items-row-${x}').slideToggle()" >Inspect</a></td>
        </tr>`

        let item_list_items = `<tr><td colspan="7" class="cell p-0 b-0" style="border-bottom-width: 0;"><div id="items-row-${x}" style="display:none;border-bottom-width: 1px;">
        <table class="table app-table-hover mb-0 text-left" style="background-color:#e3e3e3">
        <thead><tr>
        <th class="cell">Item ID</th>
        <th class="cell">Item Name</th>
        <th class="cell">Item Price</th>
        <th class="cell">Amount Sold</th>
        </tr></thead><tbody>`;
        for (item of item_list[x].order_items) {
            item_list_items += `<tr>
        <td class=cell>#${item.id}</td>
        <td class=cell>${item.name}</td>
        <td class=cell>¥${item.price}</td>
        <td class=cell>${item.amount}</td>
        </tr>`;
        }
        item_list_items += `</tbody></table></div></td></tr>`
        items += item_list_items;
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
}