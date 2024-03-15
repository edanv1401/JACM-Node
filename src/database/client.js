'use strict';
const {db} = require('./knex');

class Client {
    static getClients() {
        return db('client')
            .select('*');
    }

    static getClient(id) {
        return db('client')
            .select('*')
            .where({'id': id});
    }

    static getClientNit(nit) {
        return db('client')
            .select('*')
            .where({'nit': nit});
    }

    static createClient(client) {
        return db('client')
            .insert(client);
    }

    static updateClient(where, client) {
        return db('client')
            .update(client)
            .where(where);
    }
}

module.exports = Client;
