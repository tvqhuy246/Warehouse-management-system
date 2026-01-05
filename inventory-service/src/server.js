require('dotenv').config();
const app = require('./app');
const { pool } = require('./db');

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    // Kiểm tra kết nối cơ sở dữ liệu
    await pool.query('SELECT 1');
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`inventory-service listening on port ${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start inventory-service', err);
    process.exit(1);
  }
};

start();
