function page() {
    ws.onmessage = function (e) {
        let data = JSON.parse(e.data)
        console.log(data)
        if (data.type == 'SHIFT') {
            if (data.data == 'NONE') {
                $('#shift-title').text('No active shift!')
                $('#shift-content').html(`<div class="intro">There is no active shift at the moment! If you're a manager and got permission you can start one now.</div>`)
                $('#shift-button').html((data.permission <= 3) ? `<button class="btn app-btn-secondary" onclick="startShift()">Start shift</button>` : '')
            } else {
                $('#shift-title').text('Active shift: ' + data.data.shift_name)
                $('#shift-content').html(`<div class="row"><div class="col-auto"><b>Started by</b><div class="intro">${data.startuser.name}</div></div><div class="col-auto"><div class="col-auto"><b>Started at</b><div class="intro">${escapeHtml(new Date(data.data.started_at).toTimeString())}</div></div>`)
                $('#shift-button').html((data.permission <= 3) ? `<button class="btn app-btn-secondary" onclick="endShift()">End shift</button>` : '<button class="btn app-btn-secondary" onclick="window.location.href = `sell.html`">Start selling!</button>')
            }
        } else if (data.type === "OVERVIEW") {
            $('#stat-owe').text(data.data.owe)
            $('#stat-profit').text(data.data.profit)
        }
    }
    ws.send(JSON.stringify({type: 'SHIFT'}))
    ws.send(JSON.stringify({type: "OVERVIEW"}))
}

function startShift() {
    if (confirm('Are you sure you want to start a new shift?')) ws.send(JSON.stringify({type:'START_SHIFT'}))
}
function endShift() {
    if (confirm('Are you sure you want to end the current shift?')) ws.send(JSON.stringify({type:'END_SHIFT'}))
}