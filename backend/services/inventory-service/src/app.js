const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const inventoryRoutes = require('./routes/inventory.routes');
const reportRoutes = require('./routes/report.routes');
const exportRoutes = require('./routes/export.routes');

const { sequelize, testConnection } = require('./config/database');
const models = require('./models'); // Load models
const globalErrorHandler = require('./utils/errorHandler');

const app = express();

// Kết nối và Sync DB
const initDB = async () => {
  await testConnection();
  try {
    await sequelize.sync();
    console.log('Inventory models synced');
  } catch (err) {
    console.error('Failed to sync inventory models:', err);
  }
};
initDB();

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

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
