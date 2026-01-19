// Định nghĩa đường dẫn API
// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Public route
router.post('/login', authController.login);

// Protected route (Chỉ Admin mới được tạo Staff)
// API này sẽ là: POST /api/auth/register-staff
router.post('/register-staff', verifyToken, isAdmin, authController.createStaff);

// Test route để kiểm tra xem Token có hoạt động không
router.get('/me', verifyToken, (req, res) => {
    res.json({ message: "Token hợp lệ!", user: req.user });
});

module.exports = router;