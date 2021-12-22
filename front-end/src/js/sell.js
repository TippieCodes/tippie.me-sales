let stocklist;
let current_order = []

function page() {
    ws.onmessage = function (e) {
        let data = JSON.parse(e.data)
        if (data.type == 'STOCK_LIST') {
            stocklist = data.data
            stocklist.sort((a, b) => (a.chest_id > b.chest_id) ? 1 : -1)
            updateTable();
        } else if (data.type == 'OK') {
            $('#order-button').text('Order finished!')
            setTimeout(function () {
                $('#order-button').text('Complete order')
                $('#order-button').prop('disabled', false)
                updateCurrentOrder();
            }, 1500)
            current_order = []

        } else if (data.type == 'ERROR') {
            $('#order-button').prop('disabled', false)
            $('#order-error-text').text(data.data)
        } else if (data.type == 'SHIFT_PERSONAL_STATS') {
            $('#no-shift-text').text((data.data.isEnded == '1') ? 'There is no active shift, showing stats of last shift' : '')
            $('#p-total').text('¥' + data.data.total)
            $('#p-orders').text(data.data.orders)
            $('#p-items').text(data.data.items)
            $('#p-owed').text(data.data.owe)
        } else if (data.type == 'SHIFT_GLOBAL_STATS') {
            $('#no-shift-text').text((data.data.isEnded == '1') ? 'There is no active shift, showing stats of last shift' : '')
            $('#g-total').text('¥' + data.data.total)
            $('#g-orders').text(data.data.orders)
            $('#g-items').text(data.data.items)
        } else if (data.type == 'NEW_ORDER') {
            let id = Math.round(Math.random() * 1000)
            let items = ''
            for (item of data.data.items) {
                items += `<br />${item.amount}x ${item.name}`
            }
            $('#recent-orders').prepend(`<div class="app-card-body px-4 pt-0 pb-0" id="${id}" style="width: 100%;border-bottom-color: #e7e9ed;border-bottom-width: 2px;border-bottom-style: solid;height:auto;display:none">
        <div class="app-card-header p-3 border-bottom-0">
            <div class="row align-items-center gx-3">
                <!--//col-->
                <div class="col-auto">
                    <h4 class="app-card-title" id='shift-title'>Order #${data.data.id}</h4>
                </div>
                <!--//col-->
            </div>
        </div>

        <div class="row pb-2" style="width:100%; border-bottom: gray;border-width: 2px;">
            <div class="col-4">
                <b>Order employee:</b><br /> ${data.data.name}
            </div>
            <div class="col-4">
                <b>Order items:</b>${items}
            </div>
            <div class="col-4">
                <b>Order total:</b><br /> ¥${data.data.total}
            </div>
        </div>
    </div>`)
            $(`#${id}`).slideDown();
        } else if (data.type == 'RECENT_ORDERS') {
            let orders = '';
            for (order of data.data.orders) {
                let items = ''
                for (item of order.items) {
                    items += `<br />${item.amount}x ${item.name}`
                }
                orders += `<div class="app-card-body px-4 pt-0 pb-0" style="width: 100%;border-bottom-color: #e7e9ed;border-bottom-width: 2px;border-bottom-style: solid;height:auto;">
            <div class="app-card-header p-3 border-bottom-0">
                <div class="row align-items-center gx-3">
                    <!--//col-->
                    <div class="col-auto">
                        <h4 class="app-card-title" id='shift-title'>Order #${order.id}</h4>
                    </div>
                    <!--//col-->
                </div>
            </div>
    
            <div class="row pb-2" style="width:100%; border-bottom: gray;border-width: 2px;">
                <div class="col-4">
                    <b>Order employee:</b><br /> ${order.name}
                </div>
                <div class="col-4">
                    <b>Order items:</b>${items}
                </div>
                <div class="col-4">
                    <b>Order total:</b><br /> ¥${order.total}
                </div>
            </div>
        </div>`
            }
            $('#recent-orders').html(orders);
        }
    }

    ws.send(JSON.stringify({type: 'STOCK_LIST'}))
    ws.send(JSON.stringify({type: 'LAST_SHIFT_STATS'}))
    updateCurrentOrder();
}

function updateCurrentOrder(){
    let total = 0
    let a = `<thead>
    <tr>
        <th scope="col">Amount</th>
        <th scope="col">Item name</th>
        <th scope="col">Item location</th>
        <th scope="col">Total price</th>
        <th scope="col-sm"></th>
    </tr>
</thead>
<tbody>`
if(current_order.length == 0){
    $('#order-button').prop('disabled',true)
    $('#order-error-text').text('Add an item before completing the order.')
} else {
$('#order-button').prop('disabled',false)
$('#order-error-text').text('')
}
    for (item of current_order){
        let b = stocklist.find(a => a.item_id == item.id)
        let price = item.amount*b.sell_price
        total += price
        a += `													<tr>
        <td>${escapeHtml(item.amount)}</td>
        <td>${escapeHtml(b.menu_item)}</td>
        <td class="cell">${escapeHtml(b.chest_id)}</td>
        <td>${escapeHtml(price)}</td>
        <td><a class="btn-sm app-btn-secondary" href="javascript:void(0)"
                onclick="removeFromOrder(${item.id})">Remove</a></td>
    </tr>`
    }
    a += `</tbody>`
    $('#current-order-table').html(a)
    $('#total').text(total)
}

function addToOrder(id) {
    let item = current_order.find(a => a.id == id)
    if (!item) current_order.push({id:id,amount:0})
    let index = current_order.findIndex(a => a.id == id)
    current_order[index].amount += 1
    updateCurrentOrder();
    let stock = stocklist.find(a => a.item_id == id)
    $(`#stockrow-${id}`).text(stock.stock-current_order[index].amount)
    updateStock(stock.id,stock.stock-current_order[index].amount)
    $(`button[onclick="addToOrder(${id})"]`).prop('disabled', (stock.stock - current_order[index].amount < 1))
}

function removeFromOrder(id) {
    let item = current_order.find(a => a.id == id)
    if (!item) return;
    let index = current_order.findIndex(a => a.id == id)
    current_order[index].amount -= 1
    let stock = stocklist.find(a => a.item_id == id)
    $(`#stockrow-${id}`).text(stock.stock-current_order[index].amount)
    updateStock(stock.id,stock.stock-current_order[index].amount)
    $(`button[onclick="addToOrder(${id})"]`).prop('disabled', (stock.stock - current_order[index].amount < 1))
    if (current_order[index].amount < 1) current_order.splice(index, 1);
    updateCurrentOrder();
}

function completeOrder() {
    $('#order-button').prop('disabled',true)
    ws.send(JSON.stringify({type: 'NEW_ORDER', data:current_order}))
}

document.getElementById("sell-search").onkeydown = function (){
    let search = $("#sell-search").val();
    if (search.length > 0 ) {
        stocklist.sort((a, b) => (similarity(a.item_name, search) > similarity(b.item_name, search)) ? -1:1)
    } else {
        stocklist.sort((a, b) => (a.chest_id < b.chest_id) ? -1:1);
    }
    updateTable();
}

function updateStock( id, count ) {
    for (let i in stocklist) {
        if (stocklist[i].id == id) {
            stocklist[i].stock = count;
            break;
        }
    }
}

function updateTable(){
    let a = `												<thead>
        <tr>
            <th class="cell">Item Name</th>
            <th class="cell">Item location</th>
            <th class="cell">Sell price</th>
            <th class="cell">Stock</th>
            <th class="cell"></th>
        </tr>
    </thead>
    <tbody>`
    for (row of stocklist) {
        let index = current_order.findIndex(a => a.id == row.item_id)
        let item = current_order[index]
        if (!item) item = {amount: 0}
        a += `												<tr>
            <td class="cell">${escapeHtml(row.item_name)}</td>
            <td class="cell">${escapeHtml(row.chest_id).slice(-3)}</td>
            <td class="cell">¥${escapeHtml(row.sell_price)}</td>
            <td class="cell" id="stockrow-${row.item_id}">${escapeHtml(row.stock - item.amount)}</td>
            <td class="cell"><button class="btn-sm app-btn-secondary" href="javascript:void(0)" onclick="addToOrder(${row.item_id})"  ${(row.stock - item.amount < 1) ? 'disabled' : ''}>Add</button></td>
            </tr>`
    }
    a += `</tbody>`
    $('#order-table').html(a)
}


