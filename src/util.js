'use strict';
const jwt = require("jsonwebtoken")

function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) return res.sendStatus(403);
    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
        if (err) return res.sendStatus(401);
        req.user = user;
        next();
    });
}

function encodeId(id) {
    try {
        return id
            .toString()
            .split("")
            .map(c => c.charCodeAt(0).toString(16).padStart(2, "0"))
            .join("");
    } catch (e) {
        return this;
    }
}

function decodeId(id) {
    try {
        return id
            .split(/(\w\w)/g)
            .filter(p => !!p)
            .map(c => String.fromCharCode(parseInt(c, 16)))
            .join("");
    } catch (e) {
        return this;
    }
}

module.exports = {verifyToken, encodeId, decodeId};
