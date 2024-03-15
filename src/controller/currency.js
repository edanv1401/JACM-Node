'use strict';
const jwt = require("jsonwebtoken");
const {verifyToken} = require("../util");
const modelCurrency = require('./../model/currency');
const {Router} = require('express');

class Currency {
    constructor() {
        this.router = Router();
        this.router.get('/', verifyToken, this.getAllCurrencies);
    }

    async getAllCurrencies(req, res) {
        const currencies = await modelCurrency.getAllCurrencies();
        res.status(currencies?.status ?? 200).send(currencies.body);
    }
}

module.exports = Currency;
