import { sendOtpEmail } from '../utils/send_otp_email.js';
import admin from '../config/firebase.js';


// Controller untuk login Google dan kirim OTP
export async function loginWithGoogleAndSendOtp(req, res) {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ success: false, message: 'idToken diperlukan' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email tidak ditemukan dalam token.' });
    }

    // set supaya sendOtpEmail bisa baca
    req.body.email = email;

    // manualResponse = true → sendOtpEmail tidak memanggil res.json sendiri
    const result = await sendOtpEmail(req, res, true);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'OTP dikirim ke email',
        email,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.message || 'Gagal mengirim OTP',
        email,
      });
    }
  } catch (err) {
    console.error('Verifikasi ID Token gagal:', err);
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid',
      error: err.message,
    });
  }
}
