// utils/jwt.js
import jwt from "jsonwebtoken";
const { sign } = jwt;

export function generateJWT(payload, expiresIn) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET tidak terdefinisi");
  }
  
  const options = expiresIn ? { expiresIn } : undefined;
  
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, options);
  } catch (error) {
    console.error("Gagal generate JWT:", error);
    throw error;
  }
}

