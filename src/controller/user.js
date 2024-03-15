'use strict';
const {Router} = require('express');
const modelUser = require('./../model/user');

class User {
    constructor() {
        this.router = Router();
        this.router.post('/authenticate', this.authenticateUser)
    }

    async authenticateUser(req, res) {
        const user = req.body;
        const response = await modelUser.authenticateUser(user);
        res.send(response);
    }
}

module.exports = User;
