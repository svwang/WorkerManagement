import { Router } from 'express';
import { verifyJWT } from '../middleware/verifyJwt.js';
import { createRequest, getClientRequests, getRequest, updateRequest, deleteRequest } from '../controllers/requestJobController.js';

const router = Router();

// Client routes
router.post('/', verifyJWT, createRequest);
router.get('/', verifyJWT, getClientRequests);
router.get('/detail', verifyJWT, getRequest);          
router.put('/', verifyJWT, updateRequest);             
router.delete('/', verifyJWT, deleteRequest);          

// Project manager routes


export default router;
