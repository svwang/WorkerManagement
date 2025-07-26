// routes/authUsers.js
import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/authUsersEmployeController.js';
import { verifyJWT } from '../middleware/verifyJwt.js';
import { refreshTokenHandler } from '../controllers/jwtController.js';

const router = Router();
router.post('/auth/registerUser', registerUser)
router.post('/auth/loginUser', loginUser)

router.post('/refresh-token', refreshTokenHandler)

export default router;
