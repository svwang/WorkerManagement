// models/request_job.js
import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from './client.js'; // gunakan koneksi yang sama jika perlu relasi

const RequestJob = sequelize.define('RequestJob', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  client_id: DataTypes.INTEGER,
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  location: DataTypes.TEXT,
  requested_at: DataTypes.DATE,
  status: DataTypes.STRING,
  approved_by: DataTypes.STRING,
  approved_at: DataTypes.DATE,
}, {
  tableName: 'job_requests',
  timestamps: false,
});

export { RequestJob };
