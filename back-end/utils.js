function getCookie(request, name) {
    const value = `; ${request.headers.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function mysqlDate(date) {
    return date.getUTCFullYear() + '-' +
        ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
        ('00' + date.getUTCDate()).slice(-2) + ' ' +
        ('00' + date.getUTCHours()).slice(-2) + ':' +
        ('00' + date.getUTCMinutes()).slice(-2) + ':' +
        ('00' + date.getUTCSeconds()).slice(-2);
}

async function getEmployeeShiftStats(conn, employee_id, shift_id) {

    let a = (!shift_id) ? await conn.query('SELECT * FROM shifts order by started_at DESC LIMIT 1;') : await conn.query('SELECT * FROM shifts order WHERE order_id = ?', [shift_id])
    let shiftid = a[0].shift_id
    let personal = {
        total: 0,
        orders: 0,
        items: 0,
        owe: 0,
        isEnded: a[0].shift_ended
    }
    let shift_orders = await conn.query('SELECT * FROM orders WHERE order_shift = ? AND order_employee = ?', [shiftid, employee_id])
    for (let i = 0; i < shift_orders.length; i++) {
        let order = shift_orders[i];
        let items = JSON.parse(order.order_items)
        personal.total += order.order_total
        personal.orders++;
        personal.owe += order.order_owe
        for (let b = 0; b < items.length; b++) {
            personal.items += items[b].amount
        }
    }
    return personal;
}

async function getGlobalShiftStats(conn,shift_id) {
    let a = (!shift_id) ? await conn.query('SELECT * FROM shifts order by started_at DESC LIMIT 1;') : await conn.query('SELECT * FROM shifts WHERE shift_id = ?;', [shift_id.toString()])
    let shiftid = a[0].shift_id
    let global = {
        total: 0,
        owed: 0,
        orders: 0,
        items: 0,
        employees: [],
        isEnded: a[0].shift_ended
    }
    let shift_orders = await conn.query('SELECT * FROM orders WHERE order_shift = ?', [shiftid])
    for (let i = 0; i < shift_orders.length; i++) {
        let order = shift_orders[i];
        if (!global.employees.includes(order.order_employee)) global.employees.push(order.order_employee);
        let items = JSON.parse(order.order_items)
        global.total += order.order_total
        global.owed += order.order_owe
        global.orders++;
        for (let b = 0; b < items.length; b++) {
            global.items += items[b].amount
        }
    }
    return global;
}

function passwordCheck(password, username){
    if (password.length <= 6){
        return 'Your password must be 6 characters or more'
    } else if (!/[a-z]/.test(password)) {
        return 'Your password must contain at least 1 lowercase letter.'
    } else if (!/[A-Z]/.test(password)) {
        return 'Your password must contain at least 1 uppercase letter.'
    } else if (!/[0-9]/.test(password)) {
        return 'Your password must contain at least 1 number.'
    } else if (password == username) {
        return 'Your password must diffrent from your username.'
    } else {
        return true;
    }
}

module.exports = {
    getCookie, mysqlDate, getEmployeeShiftStats, getGlobalShiftStats, passwordCheck
}