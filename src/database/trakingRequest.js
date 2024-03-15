'use strict';

const {db} = require('./knex');

class TrakingRequest {
    static addTrakingRequest(traking) {
        return db('trakingRequest')
            .insert(traking)
    }

    static getTrakingForRequest(value, invoice = false, user = {}) {
        const where = !invoice ? `tr.trakingId in (${value})` : `tr.requestId = ${value}`
        return db({tr: 'trakingRequest'})
            .select(['tr.requestId', 'i.invoice', 'tr.observation', 'tr.trakingId'])
            .join({r: 'request'}, 'tr.requestId', 'r.id')
            .join({i: 'invoice'}, 'r.invoiceId', 'i.id')
            .whereRaw('tr.id in (select max(tr2.id) from trakingRequest tr2 group by tr2.requestId)')
            .whereRaw(where)
            .where(user)
            .orderBy('tr.dateCreate');
    }
}

module.exports = TrakingRequest;
