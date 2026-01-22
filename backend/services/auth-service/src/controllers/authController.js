// Xử lý Đăng nhập, Tạo staff
// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisePool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'bi_mat_khong_the_bat_mi';

// 1. Đăng nhập
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Tìm user trong DB
        const [rows] = await promisePool.query("SELECT * FROM users WHERE username = ?", [username]);
        if (rows.length === 0) return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu!" });

        const user = rows[0];
        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu!" });

        // Tạo token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: "Đăng nhập thành công!",
            token: token,
            user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name }
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

// 2. Tạo tài khoản Staff (Chỉ Admin dùng)
exports.createStaff = async (req, res) => {
    const { username, password, full_name } = req.body;
    try {
        // Kiểm tra username đã tồn tại chưa
        const [exists] = await promisePool.query("SELECT id FROM users WHERE username = ?", [username]);
        if (exists.length > 0) return res.status(400).json({ message: "Tên đăng nhập đã tồn tại!" });

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Lưu vào DB
        await promisePool.query(
            "INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, 'staff')",
            [username, hashedPassword, full_name]
        );

        res.status(201).json({ message: "Tạo tài khoản Staff thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

// 3. Đăng ký tài khoản (Public)
exports.register = async (req, res) => {
    const { username, password, email } = req.body; // email is optional/extra
    try {
        // Kiểm tra username
        const [exists] = await promisePool.query("SELECT id FROM users WHERE username = ?", [username]);
        if (exists.length > 0) return res.status(400).json({ message: "Tên đăng nhập đã tồn tại!" });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Default role is 'staff' for simplified testing, or 'guest'
        // Let's use 'staff' so they can actually use the system
        const role = 'staff';
        const fullName = username; // Default full name

        await promisePool.query(
            "INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)",
            [username, hashedPassword, fullName, role]
        );

        res.status(201).json({ message: "Đăng ký thành công! Vui lòng đăng nhập." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server", error });
    }
};