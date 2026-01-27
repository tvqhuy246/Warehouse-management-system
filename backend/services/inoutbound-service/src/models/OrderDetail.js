const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderDetail = sequelize.define('OrderDetail', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    product_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    actual_quantity: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0
    },
    location_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Vị trí kho: KHO-KHU-HANG-KE'
    },
    batch_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Số lô hàng (cho FIFO tracking)'
    }
}, {
    tableName: 'order_details',
    timestamps: true,
    underscored: true
});

module.exports = OrderDetail;
