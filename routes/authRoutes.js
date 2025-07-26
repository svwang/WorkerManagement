// routes/authRoutes.js
import { Router } from 'express';
import { loginWithGoogleAndSendOtp } from '../controllers/authGoogleController.js';
import { handleVerifyOtp, handleResendOtp } from '../controllers/otpController.js';
import { verifyJWT } from '../middleware/verifyJwt.js';
import { refreshTokenHandler } from '../controllers/jwtController.js';

const router = Router();

router.post('/send-otp-email', loginWithGoogleAndSendOtp);
router.post('/verify-otp-email', handleVerifyOtp);
router.post('/resend-otp-email', handleResendOtp);

router.get('/protected', verifyJWT, (req, res) => {
    res.json({success: true, message: 'Token valid', user: req.user})
})
router.post('/refresh-token', refreshTokenHandler)

// login with google
// router.post('/verify-token-google', verifyGoogleLogin)

export default router;
