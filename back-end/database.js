const mysql = require("mysql");
let pool;
class Database {
    constructor( database ) {
        this.database = database;
    }

    async init(config){
        if (pool) await pool.end()
        pool = mysql.createPool({
            connectionLimit : 10,
            host            : config.host,
            user            : config.user,
            password        : config.password,
            multipleStatements: true
        })
    }

    query( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            pool.query( `USE \`${this.database}\`;` + sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows[1] );
            } );
        } );
    }
}

module.exports = Database