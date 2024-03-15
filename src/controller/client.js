'use strict';
const modelClient = require('./../model/client');
const {Router} = require('express');
const {verifyToken} = require("../util");

class Client {
    constructor() {
        this.router = Router();
        this.router.get('/', verifyToken, this.getAllClients);
        this.router.get('/:nit', verifyToken, this.getClient);
        this.router.post('/', verifyToken, this.createClient);
    }

    async getAllClients(req, res) {
        const response = await modelClient.getAllClients();
        res.status(response?.status ?? 200).send(response.body);
    }

    async getClient(req, res) {
        const nit = req.params?.nit;
        const response = await modelClient.getClientNit(nit);
        res.status(response?.status ?? 200).send(response.body);
    }

    async createClient(req, res) {
        const client = req?.body;
        const response = await modelClient.createClient(client);
        res.status(response?.status ?? 201).send(response.body);
    }
}

module.exports = Client;
