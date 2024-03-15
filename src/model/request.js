'use strict';

const fs = require('fs');
const modelFile = require('./file');
const modelClient = require('./client');
const modelVendor = require('./vendor');
const modelInvoice = require('./invoice');
const modelCurrency = require('./currency');
const requestDb = require('./../database/request');
const trakingRequestDb = require('./../database/trakingRequest');
const userDb = require('./../database/user');
const {encodeId, decodeId} = require("../util");
const dollarLocale = Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
});

class Request {
    static async receiveRequest(request, userIdToken) {
        try {
            let codClient = 0;
            let codInvoice = 0;
            let requestCreated = 0;
            const arrayFiles = [];
            const arrayVendors = [];
            const userId = decodeId(userIdToken).split('=')[1];
            if (request?.client) {
                const client = request.client;
                if (client?.nit && client?.name && client?.email) {
                    codClient = await modelClient.createClient(client);
                    codClient = codClient.body[0];
                }
                if (request.files.files) {
                    if (request.files.files.length) {
                        for (const file of request.files.files) {
                            const codFile = await modelFile.createFile(file);
                            arrayFiles.push(codFile[0]);
                        }
                    } else {
                        const file = request.files.files;
                        const codFile = await modelFile.createFile(file);
                        arrayFiles.push(codFile[0]);
                    }
                }
                if (request?.invoice) {
                    codInvoice = await modelInvoice.createInvoice({
                        invoice: request.invoice.invoice,
                        currencyId: request.invoice.currency,
                    });
                    codInvoice = codInvoice[0]
                }
                if (request?.vendor) {
                    for (let i = 0; i < request.vendor.length; i++) {
                        const codVendor = await modelVendor.createVendor({
                            fileId: arrayFiles[i],
                            name: request.vendor[i].name,
                            iva: request.vendor[i].iva,
                            invoice: request.vendor[i].invoice,
                            identification: request.vendor[i].id,
                            amount: request.vendor[i].amount,
                        });
                        arrayVendors.push(codVendor[0]);
                    }
                }

                requestCreated = await this.insertRequest({
                    invoiceId: codInvoice,
                    clientId: codClient,
                    vendors: arrayVendors.join(', '),
                    userId: userId,
                });
                if (requestCreated) {
                    await this.addTrakingRequest(requestCreated[0], 1);
                }
            }
            const encode = encodeId("requestId=" + requestCreated[0]);
            return {status: 201, body: {request: encode}};
        } catch (e) {
            throw new Error(e);
        }
    }

    static async insertRequest(request) {
        try {
            return await requestDb.insertRequest(request);
        } catch (e) {
            throw new Error(e);
        }
    }

    static async getRequest(id, vendors = false) {
        try {
            let requestComplete = {};
            let decodedId = decodeId(id)
            if (decodedId) {
                decodedId = decodedId.split('=')[1];
                let request = await requestDb.getRequest(decodedId);
                if (request.length) {
                    request = request[0];
                    const observation = await trakingRequestDb.getTrakingForRequest(decodedId, true);
                    for (const obs of observation) {
                        delete obs.requestId;
                    }
                    if (!(+vendors)) return {...request, observation: observation};
                    console.log(request.vendors);
                    const vendorToInvoice = await modelVendor.getVendorsToInvoice(request.vendors.split(', '));
                    console.log(vendorToInvoice);
                    if (vendorToInvoice.length) {
                        for (const currentVendor of vendorToInvoice) {
                            currentVendor.fileId = encodeId(`fileId=${currentVendor.fileId}`);
                            currentVendor.vendorId = encodeId(`vendorId=${currentVendor.vendorId}`);
                        }
                        requestComplete.vendors = vendorToInvoice;
                    }
                    requestComplete.valid = observation[0].trakingId === 2;
                }
            }
            return requestComplete;
        } catch (e) {
            throw new Error(e);
        }
    }

    static async getFileDownload(fileId) {
        try {
            let id = decodeId(fileId);
            if (id) {
                id = id.split('=')[1];
                const file = await modelFile.getFile(id);
                if (file.length) {
                    return file[0];
                }
            }
            return [];
        } catch (e) {
            throw new Error(e);
        }
    }

    static async addTrakingRequest(requestId, trakingId, message = '') {
        try {
            const traking = {
                requestId: requestId,
                trakingId: trakingId,
                observation: message,
            };
            return await trakingRequestDb.addTrakingRequest(traking);
        } catch (e) {
            throw new Error(e);
        }
    }

    static async addObservation(traking) {
        try {
            traking.requestId = decodeId(traking.requestId).split('=')[1];
            return await this.addTrakingRequest(traking.requestId, 2, traking.message);
        } catch (e) {
            throw new Error(e);
        }
    }

    static async getRequestClient(user) {
        try {
            let traking = 0;
            let message = '';
            let userSearch = {};
            const userId = decodeId(user.id).split('=')[1];
            switch (+user.rolId) {
                case 1:
                    traking = '1, 3';
                    message = 'Solicitud Creada: ';
                    userSearch = {};
                    break;
                default:
                    traking = 2;
                    message = 'Observaciones agregadas: ';
                    userSearch = {
                        userId: userId
                    };
                    break;
            }
            const requests = await trakingRequestDb.getTrakingForRequest(traking, false, userSearch);
            for (const r of requests) {
                r.requestId = encodeId('requestId=' + r.requestId);
                r.message = message;
            }
            return requests;

        } catch (e) {
            throw new Error(e);
        }
    }

    static async generatePdf(requestId, user) {
        try {
            const getUserCurrent = await userDb.getClientId(decodeId(user).split('=')[1]);
            console.log(getUserCurrent);
            const dateCurrent = new Date();
            const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"];
            const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
            const stringDate = `Se expide en ${getUserCurrent[0]['city']} a los ${dateCurrent.getDate()} días del mes de ` +
                `${meses[dateCurrent.getMonth()]} de ${dateCurrent.getFullYear()}.`;
            const removeSymbol = (money) => {
                return money.toString().substring(2);
            }
            const request = await this.getRequest(requestId);
            if (Object.keys(request).length) {
                const divisa = request.currencyId;
                let divisaName = '';
                switch (divisa) {
                    case 1:
                        divisaName = 'dólares'
                        break;
                    case 2:
                        divisaName = 'pesos'
                        break;
                }
                let currency = await modelCurrency.getCurrencyId(divisa);
                let base = '';
                if (currency) {
                    currency = currency[0];
                    divisaName += ` ${currency.base}`;
                    base = currency.base.substring(1, currency.base.length - 1);
                }
                const vendors = await this.getRequest(requestId, true);
                let template = fs.readFileSync('./src/template/certificado.html', 'utf8').toString()
                    .replace(/@factura/g, request.invoice)
                    .replace(/@name/g, request.name)
                    .replace(/@nit/g, request.nit)
                    .replace(/@divisa/g, divisaName);
                let proveedores = '';
                let totalFactura = 0;
                for (const vendor of vendors['vendors']) {
                    totalFactura += (vendor.iva + vendor.amount);
                    vendor.iva = removeSymbol(dollarLocale.format(vendor.iva));
                    vendor.amount = removeSymbol(dollarLocale.format(vendor.amount));
                    const temp = `<tr class="border">
                        <td>${vendor.invoice}</td>
                        <td>${vendor.identification}</td>
                        <td>${vendor.name}</td>
                        <td>${base} ${vendor.amount}</td>
                        <td>${base} ${vendor.iva}</td>
                    </tr>`;
                    proveedores += temp;
                }
                totalFactura = removeSymbol(dollarLocale.format(totalFactura));
                template = template.replace(/@proveedores/g, proveedores)
                    .replace(/@total_factura/g, `${base} ${totalFactura}`)
                    .replace(/@fecha_expide/g, stringDate);
                return {
                    html: template
                };
            }
            return {};
        } catch (e) {
            throw new Error(e);
        }
    }

    static async saveCertificate(file, requestId) {
        try {
            const id = decodeId(requestId).split('=')[1];
            await modelFile.createFile({
                size: file.length,
                mimetype: 'application/pdf',
                name: `certificado-${id}`,
                data: file,
            });
            await this.addTrakingRequest(id, 4);
            return `certificado-${id}`;
        } catch (e) {
            throw new Error(e);
        }
    }

    static async updateResquest(id, trakings) {
        try {
            const updateTrakings = trakings;
            const idDecode = decodeId(id).split('=')[1]
            for (const traking of updateTrakings) {
                traking.vendorId = decodeId(traking.vendorId).split('=')[1];
                await modelVendor.updateVendor({
                    identification: traking.id,
                    iva: traking.iva,
                    name: traking.name,
                    amount: traking.amount,
                    invoice: traking.invoice,
                }, {id: traking.vendorId});
            }
            return await this.addTrakingRequest(idDecode, 3, '');
        } catch (e) {
            throw new Error(e);
        }
    }
}

module.exports = Request;
