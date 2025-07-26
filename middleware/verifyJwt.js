// middleware/verifyJwt.js
import jwt from 'jsonwebtoken';

// Tetap seperti semula sebagai middleware
export function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token tidak tersedia' });
  }

  const token = authHeader.split(' ')[1];
  const secretKey = process.env.JWT_SECRET || 'your-secret-key';

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // simpan data decoded di request
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Mohon maaf token anda sudah expired, Silahkan Login kembali' });
  }
}
