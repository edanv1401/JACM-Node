'use strict';

const {db} = require('./knex');

class Vendor {
    static createVendor(vendor) {
        return db('vendor')
            .insert(vendor);
    }

    static getVendorsToInvoice(vendorsId) {
        return db({v: 'vendor'})
            .select([
                {vendorId: 'v.id'},
                'v.identification',
                'v.invoice',
                'v.amount',
                'v.iva',
                'v.name',
                {fileName: 'f.name'},
                {fileId: 'f.id'}
            ])
            .join({f: 'file'}, 'v.fileId', 'f.id')
            .whereIn('v.id', vendorsId);
    }

    static updateVendor(vendor, id) {
        return db('vendor')
            .update(vendor)
            .where(id);
    }
}

module.exports = Vendor;
