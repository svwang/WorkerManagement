import { getUser, updateUser } from "../service/users_service.js"
import { redisClient } from "../config/redisClient.js";

// Mendapatkan data profil user
export async function getUserProfile(req, res) {
    try {
        // Data user sudah tersedia di req.user dari middleware
        const userEmail = req.user.email;
        const user = await getUser({ email: userEmail });
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan" });
        }

        return res.status(200).json({
            success: true,
            data: {
                user_id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone_number,
                directory: user.directory
            }
        });
    } catch (error) {
        console.error("Gagal mengambil data user:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Terjadi kesalahan pada server" 
        });
    }
}


export async function updateUserProfile(req, res) {
    try {
        const userEmail = req.user.email;
        const { name, phone, storageDir } = req.body;

        // Validasi input
        if (!name || !phone) {
            return res.status(400).json({ 
                success: false, 
                message: "Nama dan nomor telepon wajib diisi" 
            });
        }

        // Data yang akan diupdate
        const updateData = {
            name: name,
            phone_number: phone // Sesuaikan dengan nama field di model
        };

        // Jika ada storageDir, tambahkan ke updateData
        if (storageDir) {
            updateData.directory = storageDir;
        }

        // Update user di database
        const updatedRows = await updateUser(updateData, { email: userEmail });

        if (updatedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "User tidak ditemukan" 
            });
        }

        // Ambil data terbaru untuk dikembalikan
        const updatedUser = await getUser({ email: userEmail });

        return res.status(200).json({
            success: true,
            message: "Profil berhasil diperbarui",
            data: {
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone_number,
                directory: updatedUser.directory
            }
        });

    } catch (error) {
        console.error("Gagal mengupdate profil user:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Terjadi kesalahan pada server" 
        });
    }
}

// controllers/usersController.js
export async function updateProfilePicture(req, res) {
    try {
        const userEmail = req.user.email;
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ 
                success: false, 
                message: "URL gambar harus disediakan" 
            });
        }

        const [updated] = await User.update(
            { profile_picture: imageUrl },
            { where: { email: userEmail } }
        );

        if (updated === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "User tidak ditemukan" 
            });
        }

        return res.json({
            success: true,
            message: "Foto profil berhasil diperbarui"
        });

    } catch (error) {
        console.error("Update profile picture error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Terjadi kesalahan pada server" 
        });
    }
}