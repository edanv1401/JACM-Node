'use strict';
const {Router} = require('express');
const modelRequest = require('./../model/request');
const {verifyToken} = require("../util");
const jwt = require("jsonwebtoken");
const pdf = require('html-pdf');

class Request {
    constructor() {
        this.router = Router();
        this.router.get('/', verifyToken, this.getRequestForUser);
        this.router.get('/:id', verifyToken, this.getRequest);
        this.router.post('/', verifyToken, this.postRequest);
        this.router.get('/file/:id', this.downloadFile);
        this.router.post('/observation', verifyToken, this.addObservation);
        this.router.get('/generate-pdf/:id', this.generatePdf);
        this.router.put('/:id', verifyToken, this.updateRequest)
    }

    async getRequestForUser(req, res) {
        const user = jwt.decode(req.headers.authorization.split(' ')[1]);
        const rqs = await modelRequest.getRequestClient(user);
        res.send(rqs);
    }

    async getRequest(req, res) {
        const id = req.params?.id;
        const vendors = req.query?.v;
        const request = await modelRequest.getRequest(id, vendors);
        res.send(request);
    }

    async postRequest(req, res) {
        let files = [];
        if (req?.files) {
            files = req.files;
        }
        const client = JSON.parse(req.body?.client ?? '');
        const invoice = JSON.parse(req.body?.invoice ?? '');
        const vendor = JSON.parse(req.body?.vendor ?? '');
        const user = jwt.decode(req.headers.authorization.split(' ')[1]);
        const response = await modelRequest.receiveRequest({
            client: client,
            files: files,
            invoice: invoice,
            vendor: vendor,
        }, user.id);
        res.status(response?.status ?? 200).send(response.body);
    }

    async downloadFile(req, res) {
        const id = req.params?.id;
        const file = await modelRequest.getFileDownload(id);
        res.setHeader('Content-Type', (file.type ?? ''));
        res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
        res.write(file.data);
        res.end();
    }

    async addObservation(req, res) {
        const traking = req.body;
        const observation = await modelRequest.addObservation(traking);
        res.send(observation);
    }

    async generatePdf(req, res) {
        const id = req.params?.id;
        const userId = req.query.user;
        const file = await modelRequest.generatePdf(id, userId);
        pdf.create(file.html, {
            format: 'A4', "margin": {
                "right": "2cm",
                "left": "2cm"
            },
        }).toBuffer(async function (err, stream) {
            if (err) {
                res.status(500).send();
            } else {
                const name = await modelRequest.saveCertificate(stream, id);
                const head = {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment; filename="' +
                        name + '.pdf"',
                    'Expires': 0,
                    'Pragma': 'no-cache',
                }
                res.set(head);
                res.write(stream, 'binary');
                res.end();
            }
        });
    }

    async updateRequest(req, res) {
        const id = req.params?.id;
        const request = req.body;
        const response = await modelRequest.updateResquest(id, request);
        res.send(response);
    }
}

module.exports = Request;
