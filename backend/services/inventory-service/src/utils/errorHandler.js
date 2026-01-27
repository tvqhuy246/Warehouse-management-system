/**
 * Universal Global Error Handler
 */
const globalErrorHandler = (err, req, res, next) => {
    console.error('Global Error Hook:', err);

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = globalErrorHandler;
