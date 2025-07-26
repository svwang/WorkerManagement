// models/users.js
import { Sequelize, DataTypes } from 'sequelize';
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

const User = sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  phone_number: DataTypes.STRING,
  profile_picture: DataTypes.STRING,
  role: {
    type: DataTypes.STRING,
    defaultValue: 'client',
  },
  username: DataTypes.STRING,
  password: DataTypes.STRING,
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: 'false',
  },
  login_fingerprint: DataTypes.STRING,
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export { sequelize, User };