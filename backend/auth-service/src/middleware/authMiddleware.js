// Kiểm tra xem request gửi lên có kèm JWT hợp lệ không và quyền Admin/Staff
// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'bi_mat_khong_the_bat_mi';

// Middleware xác thực (kiểm tra đã đăng nhập chưa)
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Lấy token sau chữ Bearer

    if (!token) return res.status(401).json({ message: "Không tìm thấy Token xác thực!" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
        req.user = user; // Lưu thông tin user vào request để dùng sau
        next();
    });
};

// Middleware kiểm tra quyền Admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Bạn không có quyền Admin để thực hiện thao tác này!" });
    }
};

module.exports = { verifyToken, isAdmin };