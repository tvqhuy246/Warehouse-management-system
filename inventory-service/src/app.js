const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const inventoryRoutes = require('./routes/inventory.routes');
const reportRoutes = require('./routes/report.routes');
const exportRoutes = require('./routes/export.routes');

const app = express();

// Kích hoạt CORS, JSON parsing và logging
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'inventory-service' });
});

app.use('/inventory', inventoryRoutes);
app.use('/reports', reportRoutes);
app.use('/export', exportRoutes);

// Bộ xử lý lỗi toàn cầu - bắt tất cả các lỗi từ các route và middleware
app.use((err, req, res, next) => {
  // Xử lý lỗi tập trung để giữ cho phản hồi nhất quán
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
});

module.exports = app;
