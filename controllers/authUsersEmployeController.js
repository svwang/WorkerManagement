// controllers/authUsersEmployeController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateJWT } from "../utils/jwt.js";
import { createUser, getUser } from "../service/users_service.js";
import { redisClient } from "../config/redisClient.js";

const allowedRoles = ['worker', 'supervisor', 'project_manager'];

export async function registerUser(req, res) {
    try {
        const { name, email, phone_number, username, password, confirmPassword, role } = req.body;
        // Validasi role

        const roleToLower = role.toLowerCase();
        const finalRole = allowedRoles.includes(roleToLower) ? roleToLower : 'client';

        // Cek apakah email atau username sudah digunakan
        const existingUser = await getUser({ 
            email: email
        });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email sudah digunakan" });
        }

        // validasi input
        if (!name || !email || !phone_number || !username || !password || !confirmPassword || !role) {
            return res.status(400).json({ success: false, message: "Semua field wajib diisi." });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password minimal 8 karakter." });
        }

        // Hash password
        // jika password sama dengan confirmPassword maka password di terima dan akan di hash
        if(password != confirmPassword){
            return res.status(400).json({success: false, message:"Password tidak sesuai"})
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        // Buat user
        const user = await createUser({
            name,
            email,
            phone_number,
            username,
            password: hashedPassword,
            role: finalRole,
            is_verified: false, // default
            login_fingerprint: false // default
        });


        res.status(201).json({
            success: true,
            message: "Registrasi berhasil. Menunggu verifikasi admin.",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                is_verified: user.is_verified
            }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Registrasi gagal." });
    }
}

export async function loginUser(req, res) {
    try {
        const { username, password } = req.body;

        const user = await getUser({ username });

        if (!user) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan." });
        }

        // Cek apakah sudah di-approve oleh admin
        if (!user.is_verified) {
            return res.status(403).json({ 
                success: false, 
                message: "Akun Anda belum diverifikasi oleh admin. Silakan tunggu proses verifikasi sebelum bisa login." 
            });
        }


        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: "Password salah." });
        }

        // Generate JWT
        const token = generateJWT({ user_id: user.id, email: user.email }, '5m');
        const refreshToken = generateJWT({ user_id: user.id, email: user.email }, '7d');
    
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
            email: user.email,
            userId: user.id,
            role: user.role,
            loginAt: Date.now()
        }
    
        await redisClient.set(`session:${user.id}`, JSON.stringify(dataSession), {
        EX: 7 * 24 * 60 * 60 + 1 // biar lebih aman 1 detik ekstra
        });
    
        await redisClient.set(`refresh_token_${user.id}`, JSON.stringify({refreshToken: refreshToken}), {
            EX: 7 * 24 * 60 * 60 // 7 hari
        });

        res.status(200).json({
            success: true,
            message: "Login berhasil",
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Login gagal." });
    }
}