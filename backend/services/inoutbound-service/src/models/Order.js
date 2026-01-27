const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'PN-20240101-001 or PX-20240101-001'
    },
    type: {
        type: DataTypes.ENUM('IN', 'OUT'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('DRAFT', 'PENDING', 'COMPLETED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'DRAFT'
    },
    partner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'partners',
            key: 'id'
        }
    },
    warehouse_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    total_amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'orders',
    timestamps: true,
    underscored: true
});

module.exports = Order;
