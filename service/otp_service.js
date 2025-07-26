import axios from 'axios';
import { redisClient } from '../config/redisClient.js'; 
import { generateOTP } from '../utils/generateOtp.js';
import { generateJWT } from '../utils/jwt.js';
import { User } from '../models/users.js';

export async function resendOtpEmail(req, res) {
  const { email } = req.body || {}

  const otp = generateOTP() // 6 digit
  const durationInMinutes = 1; // minute

  const keyEmailRedis = `otp_email_${email}`
  const existing = await redisClient.get(keyEmailRedis)

  if(existing) {
    return res.status(200).json({success: false, message: 'OTP sebelumnya masih aktif. Silakan tunggu beberapa saat.'})
  }

  const data = {
    otp: otp,
    email: email,
    expiredAt: Date.now() + durationInMinutes * 60 * 1000
  }

  await redisClient.set(keyEmailRedis, JSON.stringify(data), {EX: durationInMinutes * 60 })

  try {
    await axios.post(
      'https://api.emailjs.com/api/v1.0/email/send',
      {
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
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
          Authorization: `Bearer ${process.env.EMAILJS_PRIVATE_KEY}`,
        },
      }
    )

    return res.status(200).json({ success: true, message: 'OTP dikirim ulang' })

  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal mengirim OTP ulang', error: err.message })
  }
}


export async function verifyOtp(req, res) {
  const { email, otp} = req.body || {};
  
  // Validasi input
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email dan OTP wajib diisi' });
  }
  const keyEmailRedis = `otp_email_${email}`
  const redisData = await redisClient.get(keyEmailRedis);
  const parsed = JSON.parse(redisData)

  if (!redisData) {
    return res.status(400).json({ success: false, message: 'OTP tidak ditemukan atau kadaluwarsa' });
  }

  if (parsed.otp !== otp.toString()) {
    return res.status(400).json({ success: false, message: 'OTP salah' });
  }

  if(Date.now() > parsed.expiredAt) {
    await redisClient.del(keyEmailRedis)
    return res.status(400).json({success: false, message: 'OTP Kadaluwarsa'})
  }

  // OTP valid
  redisClient.del(keyEmailRedis)

  // Cek user di database
  let user = await User.findOne({ where: { email } });
  const is_verified = true
  const role = 'client'

  if (!user) {
    // Simpan user baru ke MySQL
    user = await User.create({
      email,
      role,
      is_verified
    });
  }

  const user_id = user.id

  const token = generateJWT({user_id,email}, '5m')
  const refreshToken = generateJWT({user_id,email}, '7d')

  console.log("Generated Token:", token);
  console.log("Generated Refresh Token:", refreshToken);

  if (!token || !refreshToken) {
    console.error("Token tidak tergenerate!");
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal membuat token' 
    });
  }

  const dataSession = {
    email: email,
    userId: user.id,
    loginAt: Date.now()
  }

  await redisClient.set(`session:${user.id}`, JSON.stringify(dataSession), {
    EX: 7 * 24 * 60 * 60 + 1 // biar lebih aman 1 detik ekstra
  });

  await redisClient.set(`refresh_token_${user.id}`, JSON.stringify({refreshToken: refreshToken}), {
      EX: 7 * 24 * 60 * 60 // 7 hari
  });

  return res.json({ 
    success: true, 
    message: 'OTP valid. Login berhasil.' ,
    email: email,
    access_token: token,
    refresh_token: refreshToken
  });

} 