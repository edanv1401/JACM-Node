'use strict';

const {db} = require("./knex");

class Invoice {
    static createInvoice(invoice) {
        return db('invoice').insert(invoice);
    }
}

module.exports = Invoice;
