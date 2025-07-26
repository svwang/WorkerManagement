// app.js
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import authUsers from './routes/auth_users.js'
import clientRoute from './routes/client_route.js';
import requestJobRoute from './routes/requestJobRoute.js'
import usersRoute from './routes/users_route.js'
import sequelize from './models/index.js';
import { registerAdminDefault } from './utils/initAdmin.js';




dotenv.config();

const PORT = process.env.PORT || 5000

const app = express();
app.use(express.json());

// login with google
app.use('/api/auth', authRoutes);

// login user employe
app.use('/api', authUsers);

// data >users< client
app.use('/api/users', usersRoute);

// data clients
app.use('/api/clients', clientRoute)

app.use('/api/job_requests', requestJobRoute )


sequelize.sync().then(() => {
  // registerAdminDefault();
  console.log('Database synced');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});
