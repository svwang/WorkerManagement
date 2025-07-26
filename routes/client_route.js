// routes/client_route.js
import { Router } from 'express';
import { verifyJWT } from '../middleware/verifyJwt.js';
import { getClient, updateClient, createClient, deleteClient, createOrUpdateClient,checkClientExists } from '../controllers/clientController.js';

const router = Router();

// data user client
router.get('/', verifyJWT, getClient)
router.put('/update', verifyJWT, updateClient)
router.post('/create', verifyJWT, createClient)
router.get('/check', verifyJWT, checkClientExists)
router.post('/save', verifyJWT, createOrUpdateClient)
router.delete('/delete', verifyJWT, deleteClient)

export default router;
