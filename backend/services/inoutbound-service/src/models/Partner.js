const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Partner = sequelize.define('Partner', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    type: {
        type: DataTypes.INTEGER, // 1-Supplier, 2-Customer
        allowNull: false,
        validate: {
            isIn: [[1, 2]]
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'partners',
    timestamps: true,
    underscored: true
});

module.exports = Partner;
