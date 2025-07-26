import { createRequestJob, getRequestJob, getClientRequests as _getClientRequests, updateRequestJob, deleteRequestJob, processRequest as _processRequest } from '../service/request_job_service.js';
import { redisClient } from '../config/redisClient.js';

export async function createRequest(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // ambil data client_id di redis
        const user_id = req.user.user_id
        const keyNameRedis = `data_client:${user_id}`;
        const dataFromRedis = await redisClient.get(keyNameRedis);

        if (!dataFromRedis) {
            return res.status(404).json({
                success: false,
                message: 'Data client tidak ditemukan di Redis. Silakan login ulang.'
            });
        }

        const parsed = JSON.parse(dataFromRedis);
        const client_idredis = parsed.client_id;

        if (!client_idredis) {
            return res.status(400).json({
                success: false,
                message: 'client_id tidak ditemukan dalam data Redis.'
            });
        }

        console.log("Client ID dari Redis:", client_idredis);

        // Lanjutkan membuat request
        const requestData = {
            ...req.body,
            client_id: client_idredis,
            status: 'pending'
        };

        const newRequest = await createRequestJob(requestData);

        res.status(201).json({
            success: true,
            data: newRequest,
            message: 'Job request created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
export async function getRequest(req, res) {
    try {
        const { request_id } = req.body; // atau req.query jika pakai query

        const request = await getRequestJob(request_id);

        if (!request || request.client_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        res.json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function getClientRequests(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const requests = await _getClientRequests(req.user.id);

        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
export async function updateRequest(req, res) {
    try {
        const { request_id } = req.body;

        const existingRequest = await getRequestJob(request_id);
        if (!existingRequest || existingRequest.client_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        if (existingRequest.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Only pending requests can be modified' });
        }

        const updatedRequest = await updateRequestJob(request_id, req.body);

        res.json({
            success: true,
            data: updatedRequest,
            message: 'Request updated successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function deleteRequest(req, res) {
    try {
        const { request_id } = req.body;

        const existingRequest = await getRequestJob(request_id);
        if (!existingRequest || existingRequest.client_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        if (existingRequest.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Only pending requests can be deleted' });
        }

        await deleteRequestJob(request_id);

        res.json({ success: true, message: 'Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function processRequest(req, res) {
    try {
        const { request_id, status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const updatedRequest = await _processRequest(request_id, status, req.user.id);

        res.json({
            success: true,
            data: updatedRequest,
            message: `Request ${status} successfully`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
