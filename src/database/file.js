'use strict';

const {db} = require('./knex');

class File {
    static createFile(file) {
        return db('file')
            .insert(file);
    }

    static getFile(fileId) {
        return db('file')
            .select('*')
            .where({id: fileId});
    }
}

module.exports = File;
