require('dotenv').config()
const Endpoint = require('./endpoint')
const utils = require('./utils')
const Database = require('./database')
const Enmap = require('enmap')
const fs = require('fs')
const bcrypt = require('bcrypt');

const express = require('express');
const api = express();
const cors = require("cors");
var bodyParser = require('body-parser')

const corsOptions = {
    origin: [new RegExp(process.env.API_ALLOWED_ORIGINS)]
}

let databases = new Map();
let stores = new Map();
let server;


const conn = new Database(process.env.GLOBAL_DB)

conn.init({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS}
)

const modules = {
    "ADD_STOCK": "CORE",
    "BINGO_END_GAME": "CASINO",
    "BINGO_GAME": "CASINO",
    "BINGO_ROLL": "CASINO",
    "BINGO_SELL_CARD": "CASINO",
    "BLACKJACK_ADD_PLAYER": "CASINO",
    "BLACKJACK_GAME": "CASINO",
    "BLACKJACK_GAME_ACTION": "CASINO",
    "BLACKJACK_REMOVE_PLAYER": "CASINO",
    "CARD": "CASINO",
    "CARD_MANAGEMENT": "CASINO",
    "CARD_STATS" : "CASINO" ,
    "CHANGE_PASSWORD" : "CORE",
    "CLIENT" : "CORE",
    "DELETE_STOCK" : "CORE",
    "EMPLOYEE_LIST" : "CORE",
    "EMPLOYEE_UPDATE" : "CORE",
    "END_SHIFT" : "CORE",
    "LAST_SHIFT_STATS" : "CORE",
    "LOGOUT" : "CORE",
    "LUCKY_WHEEL" : "CASINO",
    "NEW_INVITE" : "CORE",
    "NEW_ORDER" : "CORE",
    "OVERVIEW" : "CORE",
    "REGISTER_CARD" : "CASINO",
    "SHIFT" : "CORE",
    "SHIFT_INFO" : "CORE" ,
    "SHIFT_LIST" : "CORE",
    "START_SHIFT" : "CORE",
    "STOCK_LIST" : "CORE",
    "STORE" : "CORE",
    "UPDATE_STOCK" : "CORE"
}

const requestTypes = new Enmap();


fs.readdir("./sales/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./sales/${file}`);
        props.module = modules[props.name]
        let typeName = file.split(".")[0];
        console.log(`Attempting to load request type ${typeName} for websocket sales`);
        requestTypes.set(typeName, props);
    });
});

class SalesEndpoint extends Endpoint {
    async authenticate(ws, request, callback) {
        let err = null
        let client = null
        let store_id = utils.getCookie(request, "store");
        let db = this.getDatabase(store_id);
        if (utils.getCookie(request, 'invite_token') && utils.getCookie(request,'register_password')){
            const token = utils.getCookie(request, 'invite_token');
            const password = utils.getCookie(request,'register_password')
            let user = await db.query(`SELECT * FROM users WHERE user_password = ? AND invited = 1 LIMIT 1;`, [token]);
            if (!user[0]){
                ws.send(JSON.stringify({type:"UNAUTHORIZED"}))
            } else {
                const check = utils.passwordCheck(password, user[0].user_name);
                if (check === true) {
                    let salt = await bcrypt.genSalt(14);
                    let hash = await bcrypt.hash(password, salt)
                    try {
                        await db.query('UPDATE users SET user_password = ?, legacy_user = 0, invited = 0 WHERE (user_id = ?);', [hash, user[0].user_id])
                        ws.send(JSON.stringify({type: "OK"}))
                    } catch (e) {
                        ws.send(JSON.stringify({type: "ERROR"}))
                        console.log(e)
                    }
                } else {
                    ws.send(JSON.stringify({type: "INVALID_CHECK", data: check}))
                }
            }
            ws.close()
            return;
        }
        if (utils.getCookie(request, 'invite_token')){
            const token = utils.getCookie(request, 'invite_token');
            const result = await db.query('SELECT user_name FROM users WHERE user_password = ? AND invited = 1', [token])
            if (result[0]){
                ws.send(JSON.stringify({
                    type: "CORRECT_TOKEN",
                    data: result[0].user_name
                }))
            } else {
                ws.send(JSON.stringify({
                    type: "UNAUTHORIZED"
                }))
            }
            ws.close()
            return;
        }
        if (utils.getCookie(request, 'log_in_a') && utils.getCookie(request, 'log_in_b')) {
            const username = utils.getCookie(request, 'log_in_a')
            const password = utils.getCookie(request, 'log_in_b')
            let user = await db.query(`SELECT * FROM users WHERE user_name = ?;`, [username]);
            const valid_password = (user[0]) ? await bcrypt.compare(password, user[0].user_password) : false;
            const expiry = new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * ((utils.getCookie(request,'log_in_c') == 'true') ? 31 : 1)));
            if (valid_password && user[0].disabled == false && user[0].invited == false) {
                let token = Math.floor(new Date().getTime() * Math.random() * 100)
                await conn.query(`INSERT INTO sessions (session_token, session_user, session_expiry, session_store) VALUES (?,?,?,?);`, [token, user[0].user_id, utils.mysqlDate(expiry), store_id])
                let response = {
                    type: 'LOGIN',
                    data: token
                }
                ws.send(JSON.stringify(response))
                let role = stores.get(parseInt(store_id)).roles.find(role => role.role_id == user[0].user_role)
                client = {
                    user_id: user[0].user_id,
                    username: user[0].user_name,
                    role: role,
                    permlevel: role.role_priority,
                    owe_percentage: parseInt(user[0].user_owe),
                    store: store_id
                }
                return callback.call(err, client)
            }
        }
        let result = await conn.query(`SELECT * FROM sessions WHERE session_token = ?;`, [utils.getCookie(request, 'session_token')]);
        if (result[0]) {
            let expire_date = new Date(result[0].session_expiry)
            if (expire_date < Date.now()) {
                await conn.query(`DELETE FROM sessions WHERE session_id = ?;`, [result[0].session_id])
                return callback.call(err, client);
            }
            db = this.getDatabase(result[0].session_store)
            store_id=result[0].session_store;
            let user = await db.query(`SELECT * FROM users WHERE user_id = ?;`, [result[0].session_user]);
            if (!user[0] || user[0].disabled == true || user[0].invited == true) {
                await conn.query(`DELETE FROM sessions WHERE session_id = ?;`, [result[0].session_id])
                return callback.call(err, client);
            }
            let role = stores.get(parseInt(store_id)).roles.find(role => role.role_id == user[0].user_role)
            client = {
                user_id: result[0].session_user,
                username: user[0].user_name,
                role: role,
                permlevel: role.role_priority,
                owe_percentage: parseInt(user[0].user_owe),
                store: store_id
            }
        }
        callback.call(err, client)
    }

    async message(wss, ws, request, client, data) {
        let incoming;
        try {
            incoming = JSON.parse(data);
        } catch (e) {
            let response = {
                type: 'ERROR',
                data: e
            }
            ws.send(response)
            return;
        }
        console.log(`RECEIVED '${incoming.type}' REQUEST`)

        const requestType = requestTypes.find(type => type.name === incoming.type);
        if (!requestType) {
            console.log(`REQUEST '${incoming.type}' IS INVALID`)
            ws.send('Invalid request.')
        } else {
            let store = stores.get(parseInt(client.store));
            if (store[`module_${requestType.module.toLowerCase()}`] != true) {
                ws.send(JSON.stringify({type: "INACTIVE_MODULE"}));
            } else {
                requestType.onRequest(wss, ws, request, client, data, incoming);
            }
        }
    }

    getDatabase(storeId){
        return databases.get(parseInt(storeId))
    }

    async onLoad(){
        api.use(cors(corsOptions));
        api.get("/stores", async function (req, res) {
            let result = await conn.query("SELECT store_id,store_name,store_url_friendly,logo_url,login_side_image,favicon_url,login_side_text_header,login_side_text_body FROM stores;")
            res.end(JSON.stringify(result))
        })
        api.use("/authenticate", express.json());
        api.post("/authenticate", async function (req, res){
            const json = req.body;
            const username = json.username;
            const password = json.password;
            const store = json.store;
            const savepass = json.save;
            let user = await endpoint.getDatabase(store).query(`SELECT * FROM users WHERE user_name = ?;`, [username]);
            const valid_password = (user[0]) ? await bcrypt.compare(password, user[0].user_password) : false;
            const expiry = new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * ((savepass) ? 31 : 1)));
            if (valid_password && user[0].disabled == false && user[0].invited == false) {
                let token = Math.floor(new Date().getTime() * Math.random() * 100)
                await conn.query(`INSERT INTO sessions (session_token, session_user, session_expiry, session_store) VALUES (?,?,?,?);`, [token, user[0].user_id, utils.mysqlDate(expiry), store])
                res.end(token.toString());
            } else {
                res.end("UNAUTHORIZED")
            }
        });

        api.get("/register/:store/:token", async function (req, res){
            const result = await endpoint.getDatabase(req.params.store).query('SELECT user_name FROM users WHERE user_password = ? AND invited = 1', [req.params.token])
            if (result[0]){
                res.end(JSON.stringify({
                    type: "CORRECT_TOKEN",
                    data: result[0].user_name
                }))
            } else {
                res.end(JSON.stringify({
                    type: "UNAUTHORIZED"
                }))
            }
        });

        api.use("/register/:store/:token",bodyParser.text());
        api.post("/register/:store/:token", async function (req, res){
            const token = req.params.token
            const password = req.body
            const db = endpoint.getDatabase(req.params.store);
            let user = await db.query(`SELECT * FROM users WHERE user_password = ? AND invited = 1 LIMIT 1;`, [token]);
            if (!user[0]){
                res.end(JSON.stringify({type:"UNAUTHORIZED"}))
            } else {
                const check = utils.passwordCheck(password, user[0]['user_name']);
                if (check === true) {
                    let salt = await bcrypt.genSalt(14);
                    let hash = await bcrypt.hash(password, salt)
                    try {
                        await db.query('UPDATE users SET user_password = ?, legacy_user = 0, invited = 0 WHERE (user_id = ?);', [hash, user[0].user_id])
                        res.end(JSON.stringify({type: "OK"}))
                    } catch (e) {
                        res.end(JSON.stringify({type: "ERROR"}))
                        console.log(e)
                    }
                } else {
                    res.end(JSON.stringify({type: "INVALID_CHECK", data: check}))
                }
            }
        });

        server = api.listen(process.env.API_PORT, function(){console.log("Sales REST API listening...")})
        await updateStores();
        setInterval(function (){updateStores()},60000)
    }

    async updateStores() {
        await updateStores();
    }

    getStore(id){
        return stores.get(parseInt(id))
    }
}

const endpoint = new SalesEndpoint();
endpoint.onLoad();
module.exports = endpoint


const http = require('http');
const wss = http.createServer();

wss.on('upgrade', function upgrade(request, socket, head) {
    endpoint.wss.handleUpgrade(request, socket, head, function done(ws) {
        endpoint.upgrade(ws, request)
    });
});

wss.listen(process.env.WS_PORT);

async function updateStores() {
    console.log("Updating stores & databases...")
    let new_databases = new Map(), new_stores = new Map()
    let storesQuery = await conn.query("SELECT * FROM stores;");
    for (const store of storesQuery) {
        let db = new Database(store.store_database);
        new_databases.set(parseInt(store.store_id), db)
        try {store.roles = await db.query("SELECT * FROM roles") } catch (e) {}
        new_stores.set(parseInt(store.store_id), store);
    }
    new_databases.set(0,conn);
    //let old = databases;
    databases = new_databases;
    stores=new_stores
    //for (const [id,database] of old) {
    //    if (id === 0) continue;
    //    await database.close();
    //}
}