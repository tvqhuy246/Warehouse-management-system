const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Stock = sequelize.define('Stock', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    product_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    warehouse_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    location_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Rack-Level-Bin'
    },
    batch_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Batch for FIFO'
    },
    quantity: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    }
}, {
    tableName: 'stocks',
    timestamps: true,
    underscored: true
});

module.exports = Stock;
