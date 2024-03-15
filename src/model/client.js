'use strict';
const dbClient = require('./../database/client');

class Client {

    static async getAllClients() {
        try {
            return {status: 200, body: await dbClient.getClients()}
        } catch (e) {
            throw new Error(e);
        }
    }

    static async getClientNit(nit) {
        try {
            return {status: 200, body: await dbClient.getClientNit(nit)}
        } catch (e) {
            throw new Error(e);
        }
    }

    static async createClient(client) {
        try {
            if (client?.nit && client?.name && client.email) {
                let clientFind = await dbClient.getClientNit(client.nit);
                if (clientFind.length) {
                    clientFind = clientFind[0];
                    const updateClient = {
                        id: clientFind.id,
                        nit: client.nit,
                        name: client.name,
                        email: client.email,
                    }
                    return {status: 201, body: [await this.updateClient(updateClient)]};
                }
                return {status: 201, body: await dbClient.createClient(client)};
            }
            return {status: 201, body: [{}]};
        } catch (e) {
            return new Error(e);
        }
    }

    static async updateClient(body) {
        try {
            const {id, ...client} = body;
            await dbClient.updateClient({'id': id}, client);
            return id;
        } catch (e) {
            return new Error(e);
        }
    }
}

module.exports = Client;
