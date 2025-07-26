// utils/send_otp_email.js
import axios from 'axios';
import { redisClient } from '../config/redisClient.js'; 
import { generateOTP } from './generateOtp.js';

// Regex email sederhana (cukup untuk validasi awal)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Kirim OTP via EmailJS.
 * @param {Request}  req  - Express request. Harus ada req.body.email (atau diisi controller).
 * @param {Response} res  - Express response (boleh di-skip jika manualResponse=true).
 * @param {boolean}  manualResponse - Jika true, fungsi mengembalikan objek {success,...} dan TIDAK memanggil res.json().
*/
export async function sendOtpEmail(req, res, manualResponse = false) {
  const { email } = req.body || {};

  // --- Validasi email --------------------------------------------------------
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    const errResp = { success: false, message: 'Email tidak valid' };
    if (manualResponse) return errResp;
    return res.status(400).json(errResp);
  }

  // --- Env sanity check ------------------------------------------------------
  const { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PRIVATE_KEY, EMAILJS_PUBLIC_KEY, } = process.env;
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID|| !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
    const msg = 'Konfigurasi EmailJS tidak lengkap di .env';
    console.error(msg);
    const errResp = { success: false, message: msg };
    if (manualResponse) return errResp;
    return res.status(500).json(errResp);
  }

  // --- Generate OTP & Simpan di redis selama durationInMinutes  ----------------------------------------------------------
  const otp = generateOTP() // 6 digit
  const durationInMinutes = 1; // minute
  const data = {
    otp: otp,
    email: email,
    expiredAt: Date.now() + durationInMinutes * 60 * 1000
  }
  await redisClient.set(`otp_email_${email}`, 
    JSON.stringify(data),{
      EX: durationInMinutes * 60
    }) 

  // --- Kirim ke EmailJS ------------------------------------------------------
  try {
    const resp = await axios.post(
      'https://api.emailjs.com/api/v1.0/email/send',
      {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: email,
          otp,
          time: `${durationInMinutes} menit`,
        },
      },
      {
        headers: {
          origin: 'http://localhost',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${EMAILJS_PRIVATE_KEY}`,
        },
      }
    );

    // EmailJS normalnya balas `OK`
    console.log('[OTP] EmailJS response:', resp.data);

    const okResp = { success: true, message: 'OTP dikirim ke email', email };
    if (manualResponse) return okResp;
    return res.status(200).json(okResp);
  } catch (err) {
    const apiErr = err.response?.data || err.message || err;
    console.error('[OTP] Gagal kirim OTP ke EmailJS:', apiErr);

    const errResp = { success: false, message: 'Gagal kirim OTP', error: apiErr };
    if (manualResponse) return errResp;
    return res.status(500).json(errResp);
  }
}


