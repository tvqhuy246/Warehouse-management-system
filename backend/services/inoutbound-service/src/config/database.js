const { Sequelize } = require('sequelize');
require('dotenv').config();

// Cấu hình kết nối database
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true, // Sử dụng snake_case cho tên cột
      freezeTableName: true // Không tự động đổi tên bảng sang số nhiều
    }
  }
);

// Kiểm tra kết nối
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Kết nối database thành công!');
  } catch (error) {
    console.error('✗ Không thể kết nối database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
