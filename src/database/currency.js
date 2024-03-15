const {db} = require('./knex');

class Currency {
    static getAllCurrencies() {
        return db('currency')
            .select('*');
    }

    static getCurrencyId(id) {
        return db('currency')
            .select('*')
            .where({'id': id});
    }
}

module.exports = Currency;
