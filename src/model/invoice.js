'use strict';
const invoiceDb = require('./../database/invoice');

class Invoice {
    static async createInvoice(invoice) {
        try {
            return await invoiceDb.createInvoice(invoice);
        } catch (e) {
            throw new Error(e);
        }
    }
}

module.exports = Invoice;
