// otp_controller.js
import { verifyOtp, resendOtpEmail } from '../service/otp_service.js';

export const handleVerifyOtp = (req, res) => {
  verifyOtp(req, res); // panggil langsung fungsi dari model
};

export const handleResendOtp = (req, res) => {
  resendOtpEmail(req, res)
}
