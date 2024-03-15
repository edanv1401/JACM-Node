'use strict';
const db = require('knex')({
    debug: false,
    client: 'mysql2',
    connection: {
        host: '192.168.10.9',
        port: 33062,
        user: 'root',
        password: 'root',
        database: 'contaduria'
    },
    pool: {min: 0, max: 7}
});

module.exports = {
    db
}
