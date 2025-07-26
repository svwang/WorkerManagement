// services/request_job_service.js
import { RequestJob } from '../models/request_job.js';
import { Client } from '../models/client.js';

// Tambahkan relasi jika belum
RequestJob.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

export const createRequestJob = async (data) => {
  return await RequestJob.create(data);
};

export const getRequestJob = async (id) => {
  return await RequestJob.findByPk(id, {
    include: [{
      model: Client,
      as: 'client',
      attributes: ['id', 'company_name']
    }]
  });
};

export const getClientRequests = async (clientId) => {
  return await RequestJob.findAll({
    where: { client_id: clientId },
    order: [['requested_at', 'DESC']]
  });
};

export const updateRequestJob = async (id, data) => {
  const [updated] = await RequestJob.update(data, {
    where: { id }
  });
  if (updated) {
    return await getRequestJob(id);
  }
  return null;
};

export const deleteRequestJob = async (id) => {
  return await RequestJob.destroy({
    where: { id }
  });
};

export const processRequest = async (id, status, approvedBy) => {
  const updateData = {
    status,
    approved_by: approvedBy,
    approved_at: new Date()
  };
  return await updateRequestJob(id, updateData);
};
