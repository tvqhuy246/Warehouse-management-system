/**
 * Middleware xử lý lỗi tập trung
 */

// Xử lý lỗi 404 - Route không tồn tại
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Không tìm thấy route: ${req.method} ${req.path}`
    });
};

// Xử lý lỗi chung
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Lỗi validation từ Sequelize
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Lỗi validation dữ liệu',
            errors: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // Lỗi unique constraint
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu đã tồn tại',
            errors: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // Lỗi foreign key constraint
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            success: false,
            message: 'Lỗi ràng buộc dữ liệu',
            error: err.message
        });
    }

    // Lỗi database connection
    if (err.name === 'SequelizeConnectionError') {
        return res.status(503).json({
            success: false,
            message: 'Lỗi kết nối database',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Lỗi mặc định
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Lỗi server nội bộ',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = {
    notFoundHandler,
    errorHandler
};
