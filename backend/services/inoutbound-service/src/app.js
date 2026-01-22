const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Import routes
const nhapKhoRoutes = require('./routes/nhapkho.routes');
const xuatKhoRoutes = require('./routes/xuatkho.routes');
const tonKhoRoutes = require('./routes/tonkho.routes');

// Khởi tạo Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body
app.use(morgan('dev')); // HTTP request logger

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'INOUTBOUND Service đang hoạt động',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/nhapkho', nhapKhoRoutes);
app.use('/api/xuatkho', xuatKhoRoutes);
app.use('/api/tonkho', tonKhoRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Chào mừng đến với INOUTBOUND Service API',
        version: '1.0.0',
        endpoints: {
            nhap_kho: '/api/nhapkho',
            xuat_kho: '/api/xuatkho',
            ton_kho: '/api/tonkho',
            health: '/health'
        }
    });
});

// Error handlers (phải đặt cuối cùng)
app.use(notFoundHandler);
app.use(errorHandler);

// Khởi động server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Kiểm tra kết nối database
        await testConnection();

        // Khởi động server
        app.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log(`🚀 INOUTBOUND Service đang chạy`);
            console.log(`📡 Port: ${PORT}`);
            console.log(`🌍 URL: http://localhost:${PORT}`);
            console.log(`📚 API Docs: http://localhost:${PORT}/`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
            console.log('='.repeat(50));
        });
    } catch (error) {
        console.error('❌ Không thể khởi động server:', error);
        process.exit(1);
    }
};

// Xử lý lỗi uncaught
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    process.exit(1);
});

// Khởi động
startServer();

module.exports = app;
