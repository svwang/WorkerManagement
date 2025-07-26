// utils/initAdmin.js
import bcrypt from 'bcrypt';
import { getUser, createUser } from '../service/users_service.js';

export async function registerAdminDefault() {
    const name = 'Admin Default';
    const email = 'admin@gmail.com';
    const phone_number = '0800000000';
    const username = 'admin';
    const password = 'admin123'; 

    const role = 'admin';

    try {
        // Cek apakah admin sudah ada
        const existingAdmin = await getUser({ email });
        if (existingAdmin) {
            console.log('Admin default sudah terdaftar.');
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await createUser({
            name,
            email,
            phone_number,
            username,
            password: hashedPassword,
            role,
            is_verified: true,
            login_fingerprint: false
        });

        console.log('Admin default berhasil dibuat.');
    } catch (error) {
        console.error('Gagal membuat admin default:', error.message);
    }
}
