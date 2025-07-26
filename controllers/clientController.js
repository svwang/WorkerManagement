import { 
    getClientData,
    createClientData, 
    updateClientData, 
    deleteClientData 
} from "../service/clients_service.js";
import { getUser } from '../service/users_service.js';

import { redisClient } from "../config/redisClient.js";

export async function getClient(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Tidak ada informasi user'
            });
        }

        const { id } = req.params;
        const client = await getClientData({ id, user_id: req.user.user_id });
        
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client tidak ditemukan atau Anda tidak memiliki akses'
            });
        }

        // Validasi apakah user terkait masih ada
        const userExists = await getUser({ id: client.user_id });
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'User pemilik client tidak ditemukan'
            });
        }
        
        res.json({
            success: true,
            data: client
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export async function createClient(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Tidak ada informasi user'
            });
        }

        const userExists = await getUser({ id: req.user.user_id });
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        const { gender, birth_date, ...rest } = req.body;

        const clientData = {
            ...rest,
            user_id: req.user.user_id
        };

        // Validasi gender
        if (gender) {
            const normalizedGender = gender.toLowerCase();
            if (!['male', 'female'].includes(normalizedGender)) {
                return res.status(400).json({ success: false, message: 'Gender tidak valid (harus male/female)' });
            }
            clientData.gender = normalizedGender;
        }

        // Validasi tanggal
        if (birth_date) {
            const parsedDate = Date.parse(birth_date);
            if (isNaN(parsedDate)) {
                return res.status(400).json({ success: false, message: 'Tanggal lahir tidak valid' });
            }
            clientData.birth_date = new Date(parsedDate);
        }

        const newClient = await createClientData(clientData);

        const user_id = req.user.user_id

        const tableClient = await getClientData({user_id: user_id})

        const keyClient = `data_client:${user_id}`
        await redisClient.set(keyClient, JSON.stringify({
            user_id : user_id,
            client_id: tableClient.id
        }))

        const dataFromRedis = await get(keyClient)
        if (!dataFromRedis){
            console.log("data tidak ada")
        }

        res.status(201).json({
            success: true,
            data: newClient
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export async function updateClient(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Tidak ada informasi user'
            });
        }

        const { id } = req.params;
        const existingClient = await getClientData({ id, user_id: req.user.user_id });

        
        if (!existingClient) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Anda tidak memiliki akses ke client ini'
            });
        }

        // Validasi apakah user pemilik client masih ada
        const userExists = await getUser({ id: existingClient.user_id });
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'User pemilik client tidak ditemukan'
            });
        }

        const updateData = req.body;
        
        // Jika mencoba mengubah user_id, validasi user_id baru
        if (updateData.user_id && updateData.user_id !== existingClient.user_id) {
            const newUserExists = await getUser({ id: updateData.user_id });
            if (!newUserExists) {
                return res.status(404).json({
                    success: false,
                    message: 'User baru yang dituju tidak ditemukan'
                });
            }
        }

        const result = await updateClientData(id, updateData);
        
        if (result[0] === 0) {
            return res.status(404).json({
                success: false,
                message: 'Client tidak ditemukan'
            });
        }
        
        const updatedClient = await getClientData({ id });
        
        res.json({
            success: true,
            data: updatedClient
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export async function checkClientExists(req, res) {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const client = await getClientData({ user_id: req.user.user_id });

        
        return res.json({
            success: true,
            has_data: !!client, // Tambahkan ini
            data: client || null,
            message: client ? 'Data ditemukan' : 'Data tidak ditemukan'
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
}

export async function createOrUpdateClient(req, res) {
    try {
        if (!req.user || !req.user.user_id) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const { gender, birth_date, ...rest } = req.body;

        const clientData = {
            ...rest,
            user_id: req.user.user_id
        };

        // Validasi gender
        if (gender) {
            const normalizedGender = gender.toLowerCase();
            if (!['male', 'female'].includes(normalizedGender)) {
                return res.status(400).json({ success: false, message: 'Gender tidak valid (harus male/female)' });
            }
            clientData.gender = normalizedGender;
        }

        // Validasi birth_date
        if (birth_date) {
            const parsedDate = Date.parse(birth_date);
            if (isNaN(parsedDate)) {
                return res.status(400).json({ success: false, message: 'Tanggal lahir tidak valid' });
            }
            clientData.birth_date = new Date(parsedDate);
        }

        const existingClient = await getClientData({ user_id: req.user.user_id });

        let result;
        if (existingClient) {
            result = await updateClientData(existingClient.id, clientData);
            if (!result) {
                return res.status(400).json({
                    success: false,
                    message: 'Gagal mengupdate data client'
                });
            }
        } else {
            result = await createClientData(clientData);
            if (!result) {
                return res.status(400).json({
                    success: false,
                    message: 'Gagal membuat data client'
                });
            }
        }

        const updatedClient = await getClientData({ user_id: req.user.user_id });

        const user_id = req.user.user_id
        const email = req.user.email

        const tableClient = await getClientData({user_id: user_id})

        const keyClient = `data_client:${user_id}`

        const dataFromRedis = await redisClient.get(keyClient)
        const clientDataRedis = {
            user_id: user_id,
            client_id: tableClient.id,
            email: email
        }

        if (!dataFromRedis) {
            console.log("Data tidak ada, dan data sudah dibuat.");
            await redisClient.set(keyClient, JSON.stringify(clientDataRedis));
        } else {
            console.log("Data ditemukan, dan akan diperbarui.");
            await redisClient.set(keyClient, JSON.stringify(clientDataRedis)); // Update
        }

        

        

        

        return res.json({
            success: true,
            data: updatedClient,
            message: existingClient ? 'Data berhasil diupdate' : 'Data berhasil dibuat'
        });

    } catch (error) {
        console.error("Error in createOrUpdateClient:", error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
}

export async function deleteClient(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Tidak ada informasi user'
            });
        }

        const { id } = req.params;
        const existingClient = await getClientData({ id, user_id: req.user.user_id });

        
        if (!existingClient) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Anda tidak memiliki akses ke client ini'
            });
        }

        // Validasi apakah user pemilik client masih ada
        const userExists = await getUser({ id: existingClient.user_id });
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'User pemilik client tidak ditemukan'
            });
        }

        const result = await deleteClientData(id);
        
        if (result === 0) {
            return res.status(404).json({
                success: false,
                message: 'Client tidak ditemukan'
            });
        }
        
        res.json({
            success: true,
            message: 'Client berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}