'use strict';

const {db} = require("./knex");

class User {
    static authenticateUser(username, password) {
        return db('user')
            .select([
                'id',
                'username',
                'rolId'])
            .whereRaw(`username = '${username}' and password = MD5(${password})`);
    }

    static getClientId(id) {
        return db('user')
            .select('*')
            .where({'id': id});
    }
}

module.exports = User;
