const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StockLog = sequelize.define('StockLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    product_id: { type: DataTypes.STRING, allowNull: false },
    order_id: { type: DataTypes.INTEGER, allowNull: true },
    type: { type: DataTypes.ENUM('IN', 'OUT'), allowNull: false },
    quantity: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    batch_number: { type: DataTypes.STRING(50), allowNull: true },
    location_code: { type: DataTypes.STRING(50), allowNull: true },
    performed_by: { type: DataTypes.STRING(100), allowNull: true }
}, {
    tableName: 'stock_logs',
    timestamps: true,
    underscored: true
});

module.exports = StockLog;
