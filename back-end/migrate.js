require('dotenv').config()
const Database = require("./database");
const conn = new Database(process.env.GLOBAL_DB)
const fs = require('fs')
const migrationFile = 'database-migrations/add-foreign-keys-stores.sql'

conn.init({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS}
)

async function run() {
    console.log("Getting databases...")
    let storesQuery = await conn.query("SELECT * FROM stores;");
    for (const store of storesQuery) {
        if (conn.database == store.store_database) continue;
        let db = new Database(store.store_database);
        await runScript(db);
    }
}

async function runScript(database){
    console.log('Migrating ' + database.database)
    let data = fs.readFileSync(migrationFile, 'utf8');
    await database.query(data);
    console.log('Finished migrating ' + database.database)
}

run();