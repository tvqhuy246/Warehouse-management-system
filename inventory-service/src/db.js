const { Pool } = require('pg');

// Tạo pool kết nối từ biến môi trường
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'warehouse',
});

pool.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('Unexpected PG error', err);
});

const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
