const {db} = require('./knex');

class Request {
    static insertRequest(request) {
        return db('request')
            .insert(request);
    }

    static getRequest(id) {
        return db({r: 'request'})
            .select(['r.vendors', 'c.nit', 'c.name', 'i.invoice', 'c.email', 'i.currencyId'])
            .join({c: 'client'}, 'r.clientId', 'c.id')
            .join({i: 'invoice'}, 'r.invoiceId', 'i.id')
            .where({'r.id': id});
    }
}

module.exports = Request;
