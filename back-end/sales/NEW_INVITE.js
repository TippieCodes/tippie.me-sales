const RequestType = require("../requesttype")
const sales = require("../sales")
class NewInviteRequest extends RequestType{
    async onRequest(wss, ws, request, client, data, incoming) {
        if (client.role["permission_manage_employees"] != true) return;
        const conn = sales.getDatabase(client.store);
        const store = sales.getStore(client.store)
        let response = {
            type: 'NEW_INVITE',
            data: {
                success: true,
                link: `https://tippie.me/sales/register.html?store=${store.store_url_friendly}&token=`
            }
        }
        const key = makeKey(16);
        try {
            await conn.query('INSERT INTO users (user_name, user_password, user_role, user_owe, invited) VALUES (?, ?, ?, ?, ?)', [incoming.data.username, key, incoming.data.role, incoming.data.owe, 1])
        } catch (e){
            response.data.success = false;
            if (e.errno == 1062) {
                response.data.message = 'Username already exists.'
            } else {
                response.data.message = e.sqlMessage;
            }
        }
        response.data.link += key;
        ws.send(JSON.stringify(response))
    }
}
module.exports = new NewInviteRequest("NEW_INVITE");

function makeKey(length) {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}