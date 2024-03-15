'use strict';

const fileDb = require('../database/file');

class File {
    static async createFile(file) {
        try {
            return await fileDb.createFile({
                size: file.size,
                type: file.mimetype,
                name: file.name,
                data: file.data,
            });
        } catch (e) {
            throw new Error(e);
        }
    }

    static async getFile(fileId){
        try {
            return fileDb.getFile(fileId);
        } catch (e) {
            throw new Error(e);
        }
    }
}

module.exports = File;
