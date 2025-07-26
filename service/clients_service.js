import { Client } from "../models/client.js";

// service/clients_service.js
export async function getClientData(whereCondition) {
    try {
        console.log("whereCondition:", whereCondition); // log kondisi query

        const result = await Client.findOne({
            where: whereCondition
        });

        console.log("result:", result); // log hasil query
        return result;
    } catch(err) {
        console.error("Sequelize Error getClientData:", err); // tampilkan error asli
        throw new Error('Gagal mengambil data client');
    }
}



export async function createClientData(data) {
    try {
        const result = await Client.create(data);
        return result;
    } catch(err) {
        throw new Error('Gagal membuat data client');
    }
}

export async function updateClientData(id, data) {
    try {
        const result = await Client.update(data, {
            where: { id }
        });
        return result;
    } catch(err) {
        throw new Error('Gagal memperbarui data client');
    }
}

export async function deleteClientData(id) {
    try {
        const result = await Client.destroy({
            where: { id }
        });
        return result;
    } catch(err) {
        throw new Error('Gagal menghapus data client');
    }
}