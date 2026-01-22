// backend/auth-service/src/index.js
const express = require('express');
const app = express();
const { initDatabase } = require('./config/db');
const authRoutes = require('./routes/authRoutes');

app.use(express.json());

// Khởi tạo Database (Tạo bảng + Admin mặc định)
initDatabase();

// Định tuyến
app.use('/', authRoutes); // Nginx đã cắt bớt /api/auth rồi, nên ở đây chỉ cần /

// QUAN TRỌNG: Phải lắng nghe ở port 8081 như cấu hình Nginx đã quy định
const PORT = 8081;
app.listen(PORT, () => {
    console.log(`Auth Service đang chạy tại port ${PORT}`);
});