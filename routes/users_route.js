// routes/users_route.js
import { Router } from 'express';
import { getUserProfile, updateUserProfile, updateProfilePicture } from '../controllers/usersController.js'
import { verifyJWT } from '../middleware/verifyJwt.js';

const router = Router();

// data user 
router.get('/', verifyJWT, getUserProfile)
router.put('/update', verifyJWT, updateUserProfile)
router.put('/update_profile_picture', verifyJWT, updateProfilePicture);

export default router;
