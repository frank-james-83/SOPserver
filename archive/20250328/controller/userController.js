
const db = require('./db');


async function getUserById(userId) {
    try {
        // 查询用户信息
        const sql = 'SELECT id, username, role FROM users WHERE id = ?';
        const [rows] = await db.execute(sql, [userId]);

        // 如果用户存在，返回用户信息
        if (rows.length > 0) {
            return rows[0];
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}


async function getAllUsers() {
    try {
        // 查询所有用户信息
        const sql = 'SELECT id, username, role FROM users';
        const [rows] = await db.execute(sql);

        // 返回用户列表
        return rows;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}



module.exports = {
    getUserById,
    getAllUsers
};