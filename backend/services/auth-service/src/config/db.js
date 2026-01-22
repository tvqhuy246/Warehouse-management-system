// File kết nối & tạo bảng DB
// src/config/db.js
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Tạo kết nối pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'rootpassword',
    database: process.env.DB_NAME || 'warehouse_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

// Hàm khởi tạo Database
const initDatabase = async () => {
    try {
        // 1. Tạo bảng users nếu chưa có
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100),
                role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await promisePool.query(createTableQuery);
        console.log("✅ Đã kiểm tra/tạo bảng 'users'.");

        // 2. Tạo tài khoản Admin mặc định (nếu chưa có)
        const [rows] = await promisePool.query("SELECT * FROM users WHERE role = 'admin'");
        if (rows.length === 0) {
            const hashedPassword = await bcrypt.hash('xaydunghethong09', 10);
            await promisePool.query(
                "INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)",
                ['qhuyadmin', hashedPassword, 'Administrator', 'admin']
            );
            console.log("🚀 Đã tạo tài khoản Admin mặc định: qhuyadmin / xaydunghethong09");
        }
    } catch (error) {
        console.error("❌ Lỗi khởi tạo Database:", error);
    }
};

module.exports = { promisePool, initDatabase };