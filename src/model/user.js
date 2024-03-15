'use strict';
const userDb = require('./../database/user');
const jwt = require("jsonwebtoken")
const {encodeId} = require("../util");

class User {
    static async authenticateUser({username, password}) {
        try {
            const user = await userDb.authenticateUser(username, password);
            if (user.length) {
                user[0].id = encodeId('userId=' + user[0].id);
                const token = jwt.sign(user[0], process.env.JWT_KEY, {
                    algorithm: 'HS256',
                    expiresIn: '2h',
                })
                return {
                    login: 1,
                    message: {
                        token: token
                    }
                };
            }
            return {login: 0, message: 'Usuario y o contraseña incorrectos'}
        } catch (e) {
            throw new Error(e);
        }
    }
}

module.exports = User;
