let item_list, data;

function page() {
    ws.onmessage = function (e) {
        data = JSON.parse(e.data)
        switch (data.type) {
            case 'STOCK_LIST':
                //TODO sorting
                item_list = data.data
                if (client.role["permission_manage_stock"] == true) {
                    let addform = document.getElementById("addform")
                    $('#new-item').html('<a href="javascript:void(0)">New item</a>');
                    document.getElementById('new-item').onclick = function () {
                        addform.style.display = 'block'
                        $('#add-submit').attr('onclick', 'addItem();')
                        $('#add-submit').text('Add item')
                        $('#delete-stock').html('')
                        // document.getElementById('add-category').value = ''
                        document.getElementById('add-menu-item').value = ''
                        document.getElementById('add-item-name').value = ''
                        document.getElementById('add-sell-price').value = ''
                        document.getElementById('add-shipment-price').value = ''
                        document.getElementById('add-stock').value = ''
                        $('#add-category').val('')
                    }
                    document.getElementById('addform-close').onclick = function () {
                        addform.style.display = 'none';
                    }
                    window.onclick = function () {
                        if (event.target == addform) {
                            addform.style.display = "none";
                        }
                    }
                }
                setTable(0, 10);
        }
    }
    ws.send(JSON.stringify({ type: "STOCK_LIST" }))
}

function setTable(start, amount) {
    let items = `<div class="tab-content" id="orders-table-tab-content">
    <div class="tab-pane fade show active" id="orders-all" role="tabpanel" aria-labelledby="orders-all-tab">
        <div class="app-card app-card-orders-table shadow-sm">
        <div class="table-responsive">
    <table class="table app-table-hover mb-0 text-left">
        <thead>
            <tr>
                <th class="cell">Item ID</th>
                <th class="cell">Menu item</th>
                <th class="cell">Item Name</th>
                <th class="cell">Chest Location</th>
                <th class="cell">Sell price</th>
                <th class="cell">Shipment Price</th>
                <th class="cell">Stock</th>
                ${(client.role["permission_manage_stock"] == true) ? '<th class="cell"></th>' : ''}
            </tr>
        </thead>
    <tbody>`
    let x = start
    let p = 0
    for (let i = 0; i < parseInt(amount - 1) + 1; i++) {
        if (!item_list[x]) break;
        items += `<tr>
        <td class="cell">#${escapeHtml(item_list[x].item_id)}</td>
        <td class="cell">${escapeHtml(item_list[x].menu_item)}</td>
        <td class="cell">${escapeHtml(item_list[x].item_name)}</td>
        <td class="cell">${escapeHtml(item_list[x].chest_id)}</td>
        <td class="cell">¥${escapeHtml(item_list[x].sell_price)}</td>
        <td class="cell">¥${escapeHtml(item_list[x].shipment_price)}</td>
        <td class="cell">${escapeHtml(item_list[x].stock)}</td>
        ${(client.role["permission_manage_stock"] == true) ? `<td class="cell"><a class="btn-sm app-btn-secondary" href="javascript:void(0)" onclick="editItem(${item_list[x].item_id})" >Edit</a></td>` : ''}
        </tr>`;
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
}

function addItem() {
    $('#add-submit').attr('onclick', '')
    $('#add-submit').addClass('disabled')
    let category = document.getElementById('add-category')
    let menuitem = document.getElementById('add-menu-item')
    let itemname = document.getElementById('add-item-name')
    let sellprice = document.getElementById('add-sell-price')
    let shipmentprice = document.getElementById('add-shipment-price')
    let stock = document.getElementById('add-stock')
    ws.onmessage = function (e) {
        data = JSON.parse(e.data)
        console.log(data)
        if (data.type === 'OK') {
            $('#add-submit').attr('onclick', 'addItem();')
            $('#add-submit').removeClass('disabled')
            menuitem.value = ''
            itemname.value = ''
            sellprice.value = ''
            shipmentprice.value = ''
            stock.value = ''
            $('#error-text').text('')
            document.getElementById('add-submit').innerHTML = 'Added!'
            setTimeout(function () {
                document.getElementById("addform").style.display = 'none'
                document.getElementById('add-submit').innerHTML = 'Add item'
                page();
            }, 1000);
        } else if (data.type === 'ERROR') {
            $('#add-submit').attr('onclick', 'addItem();')
            $('#add-submit').removeClass('disabled')
            $('#error-text').text('Error occured! See console for details.')
            console.log(data.data)
        }
    }
     let request = {
         type: 'ADD_STOCK',
         data: {
             category: category.value,
             menuitem: menuitem.value,
             itemname: itemname.value,
             sellprice: sellprice.value,
             shipmentprice: shipmentprice.value,
             stock: stock.value,
             chest: $('#add-chest').val()
         }
     }
     ws.send(JSON.stringify(request))
}

function editItem(id) {
    let category = document.getElementById('add-category')
    let menuitem = document.getElementById('add-menu-item')
    let itemname = document.getElementById('add-item-name')
    let sellprice = document.getElementById('add-sell-price')
    let shipmentprice = document.getElementById('add-shipment-price')
    let stock = document.getElementById('add-stock')
    let item = item_list.find(a => a.item_id == id)
    $('#add-submit').attr('onclick', `saveItem(${id});`)
    $('#add-submit').text('Update item')
    $('#delete-stock').html(`<button type="submit" class="btn app-btn-secondary" id='delete-item' onclick="deleteItem(${id});">Delete item</button>`)
    category.value = item.category
    menuitem.value = item.menu_item
    itemname.value = item.item_name
    sellprice.value = item.sell_price
    shipmentprice.value = item.shipment_price
    stock.value = item.stock
    $('#add-chest').val(item.chest_id)
    document.getElementById("addform").style.display = 'block';
}

function saveItem(id) {
    $('#add-submit').attr('onclick', '')
    $('#add-submit').addClass('disabled')
    let category = document.getElementById('add-category')
    let menuitem = document.getElementById('add-menu-item')
    let itemname = document.getElementById('add-item-name')
    let sellprice = document.getElementById('add-sell-price')
    let shipmentprice = document.getElementById('add-shipment-price')
    let stock = document.getElementById('add-stock')
    ws.onmessage = function (e) {
        data = JSON.parse(e.data)
        console.log(data)
        if (data.type === 'OK') {
            $('#add-submit').attr('onclick', 'addItem();')
            $('#add-submit').removeClass('disabled')
            category.value = ''
            menuitem.value = ''
            itemname.value = ''
            sellprice.value = ''
            shipmentprice.value = ''
            stock.value = ''
            $('#add-chest').val('000')
            $('#error-text').text('')
            document.getElementById('add-submit').innerHTML = 'Saved!'
            setTimeout(function () {
                document.getElementById("addform").style.display = 'none'
                document.getElementById('add-submit').innerHTML = 'Update item'
                page();
            }, 1000);
        } else if (data.type === 'ERROR') {
            $('#add-submit').attr('onclick', 'saveItem();')
            $('#add-submit').removeClass('disabled')
            $('#error-text').text('Error occured! See console for details.')
            console.log(data.data)
        }
    }
    let request = {
        type: 'UPDATE_STOCK',
        data: {
            id: id,
            category: category.value,
            menuitem: menuitem.value,
            itemname: itemname.value,
            sellprice: sellprice.value,
            shipmentprice: shipmentprice.value,
            stock: stock.value,
            chest: $("#add-chest").val()
        }
    }
    ws.send(JSON.stringify(request))
}


function deleteItem(id) {
    $('#delete-item').addClass('disabled')
    let category = document.getElementById('add-category')
    let menuitem = document.getElementById('add-menu-item')
    let itemname = document.getElementById('add-item-name')
    let sellprice = document.getElementById('add-sell-price')
    let shipmentprice = document.getElementById('add-shipment-price')
    let stock = document.getElementById('add-stock')
    ws.onmessage = function (e) {
        data = JSON.parse(e.data)
        console.log(data)
        if (data.type === 'OK') {
            category.value = ''
            menuitem.value = ''
            itemname.value = ''
            sellprice.value = ''
            shipmentprice.value = ''
            stock.value = ''
            $('#error-text').text('')
            $('#add-chest').val('000')
            document.getElementById('delete-item').innerHTML = 'Deleted!'
            setTimeout(function () {
                document.getElementById("addform").style.display = 'none'
                document.getElementById('delete-item').innerHTML = 'Delete item'
                $('#delete-item').removeClass('disabled')
                page();
            }, 1000);
        } else if (data.type === 'ERROR') {
            $('#delete-item').attr('onclick', `deleteItem(${id});`)
            $('#delete-item').removeClass('disabled')
            $('#error-text').text('Error occurred! See console for details.')
            console.log(data.data)
        }
    }
    let request = {
        type: 'DELETE_STOCK',
        data: {
            id: id,
        }
    }
    ws.send(JSON.stringify(request))
}