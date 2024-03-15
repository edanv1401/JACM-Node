const dbCurrency = require('./../database/currency');
const {decodeId} = require("../util");

class Currency {
    static async getAllCurrencies() {
        try {
            return {status: 200, body: await dbCurrency.getAllCurrencies()};
        } catch (e) {
            throw new Error(e);
        }
    }

    static async getCurrencyId(id) {
        try {
            return await dbCurrency.getCurrencyId(id);
        } catch (e) {
            throw new Error(e);
        }
    }
}

module.exports = Currency;
