import jwt from "jsonwebtoken"
import { generateJWT } from "../utils/jwt.js"
import { redisClient } from "../config/redisClient.js"

export async function refreshTokenHandler(req, res) {
  const { refresh_token } = req.body

  try {
    const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET)
    const redisData = await redisClient.get(`refresh_token_${decoded.user_id}`)

    if (!redisData) return res.status(403).json({ success: false, message: 'Refresh token tidak ditemukan' })

    const stored = JSON.parse(redisData)
    if (stored.refreshToken !== refresh_token) {
      return res.status(403).json({ success: false, message: 'Refresh token tidak cocok' })
    }

    const newAccessToken = generateJWT({ user_id: decoded.user_id, email: decoded.email }, '1d')
    return res.json({ success: true, access_token: newAccessToken })

  } catch (err) {
    return res.status(403).json({ success: false, message: 'Refresh token tidak valid atau expired' })
  }
}
