// service/users_service.js

import { User } from '../models/users.js';

// CREATE
export async function createUser(data) {
    try {
        const user = await User.create(data);
        return user;
    } catch (error) {
        throw new Error('Gagal membuat user: ' + error.message);
    }
}

// READ - Get one user by condition (e.g., { email: 'email@mail.com' })
export async function getUser(whereCondition) {
    try {
        const user = await User.findOne({ 
            where: whereCondition
         });
        return user;
    } catch (error) {
        throw new Error('Gagal mengambil user: ' + error.message);
    }
}

// READ - Get all users
export async function getAllUsers() {
    try {
        const users = await User.findAll();
        return users;
    } catch (error) {
        throw new Error('Gagal mengambil semua user: ' + error.message);
    }
}

// UPDATE - Update user by condition (e.g., id/email)
export async function updateUser(updateData, condition) {
    try {
        const [updated] = await User.update(updateData, { where: condition });
        return updated; // returns number of updated rows
    } catch (error) {
        throw new Error('Gagal memperbarui user: ' + error.message);
    }
}

// DELETE - Delete user by condition (e.g., id/email)
export async function deleteUser(condition) {
    try {
        const deleted = await User.destroy({ where: condition });
        return deleted; // returns number of deleted rows
    } catch (error) {
        throw new Error('Gagal menghapus user: ' + error.message);
    }
}
