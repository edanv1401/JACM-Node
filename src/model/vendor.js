'use strict';
const vendorDb = require('./../database/vendor');

class Vendor {
    static async createVendor(vendor) {
        try {
            return vendorDb.createVendor(vendor);
        } catch (e) {
            throw new Error(e);
        }
    }

    static async getVendorsToInvoice(vendorsId) {
        try {
            return vendorDb.getVendorsToInvoice(vendorsId);
        } catch (e) {
            throw new Error(e);
        }
    }

    static async updateVendor(body, id) {
        try {
            return vendorDb.updateVendor(body, id);
        } catch (e) {
            throw new Error(e);
        }
    }
}

module.exports = Vendor;
