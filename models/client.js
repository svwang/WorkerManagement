// models/client.js
import { Sequelize, DataTypes, ENUM } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
  }
);

const Client = sequelize.define('clients', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: DataTypes.INTEGER,
  company_name: DataTypes.STRING,
  gender: DataTypes.ENUM('male','female'),
  birth_date: DataTypes.DATE,
  address: DataTypes.STRING,
  last_login_at: DataTypes.DATE,
  last_login_ip: DataTypes.STRING,
}, {
  tableName: 'clients',
  timestamps: false
});

export { sequelize, Client };