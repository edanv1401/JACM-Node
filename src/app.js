'use strict';

const fs = require('fs');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');

require('dotenv').config();

class App {
    constructor() {
        this.app = express();
        this.router = express.Router();
        this.port = 3000;
    }

    #routes() {
        const controllerFolder = `${__dirname}/controller`;
        fs.readdir(controllerFolder, (err, files) => {
            files.forEach(file => {
                const nameRoute = file.split('.')[0];
                const controller = new (require(`${controllerFolder}/${nameRoute}`))();
                this.router.use(`/${nameRoute}`, controller.router);
            });
        });
    }

    init() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(bodyParser.json());
        this.app.use(fileUpload({
            limits: {fileSize: 50 * 1024 * 1024},
        }));
        this.app.use(cors({
            origin: ['http://localhost:3000', 'http://localhost:4200', 'https://a921-186-30-52-24.ngrok-free.app'],
        }));
        this.#routes();
        this.#listen();
        this.app.use('/api', this.router);
    }

    #listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening in port ${this.port}`);
            const {db} = require('./database/knex');
            db.raw('SELECT 1')
                .then(() => {
                    console.log('connected')
                }).catch((err) => {
                console.log(err)
            });
        });
    }
}

module.exports = App;
