function page() {
    ws.onmessage = function (e) {
        let data = JSON.parse(e.data)
        console.log(data)
        if (data.type == 'SHIFT') {
            if (data.data == 'NONE') {
                $('#shift-title').text('No active shift!')
                $('#shift-content').html(`<div class="intro">There is no active shift at the moment! If you're a manager and got permission you can start one now.</div>`)
                $('#shift-button').html((client.role["permission_manage_shift"] == true) ? `<button class="btn app-btn-secondary" onclick="startShift()">Start shift</button>` : '')
            } else {
                $('#shift-title').text('Active shift: ' + data.data.shift_name)
                $('#shift-content').html(`<div class="row"><div class="col-auto"><b>Started by</b><div class="intro">${data.startuser.name}</div></div><div class="col-auto"><div class="col-auto"><b>Started at</b><div class="intro">${escapeHtml(new Date(data.data.started_at).toTimeString())}</div></div>`)
                $('#shift-button').html((client.role["permission_manage_shift"] == true) ? `<button class="btn app-btn-secondary" onclick="endShift()">End shift</button>` : '<button class="btn app-btn-secondary" onclick="window.location.href = `sell`">Start selling!</button>')
            }
        } else if (data.type === "OVERVIEW") {
            $('#stat-owe').text(data.data.owe)
            $('#stat-profit').text(data.data.profit)
        }
    }
    ws.send(JSON.stringify({type: 'SHIFT'}))
    ws.send(JSON.stringify({type: "OVERVIEW"}))

    if (true) {
        $('#alert-area').html(`<div class="app-card alert shadow-sm mb-4 border-left-decoration" role="alert">
  <div class="inner">
 <div class="app-card-body p-3 p-lg-4">
  <h3 class="mb-3">PSA: New Domain!</h3>
<div class="row gx-5 gy-3">
       <div class="col-12 col-lg-9">
     
     <div>From this point onwards https://sales.tippie.me/ will be replaced with <b>https://shops.schoolrp.net/</b>. The old domain will simply redirect to the new one, so you don't have to change anything, but it's better to use the new domain instead.</div>
 </div><!--//col-->
   </div><!--//app-card-body-->
   
    </div><!--//inner-->
  </div>`)
    }
  
}

function startShift() {
    if (confirm('Are you sure you want to start a new shift?')) ws.send(JSON.stringify({type: 'START_SHIFT'}))
}

function endShift() {
    if (confirm('Are you sure you want to end the current shift?')) ws.send(JSON.stringify({type: 'END_SHIFT'}))
}