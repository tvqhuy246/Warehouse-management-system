const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Model Sản phẩm
const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        // autoIncrement: true // Removed for UUID
    },
    sku: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Mã sản phẩm'
    },
    ten_san_pham: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Tên sản phẩm'
    },
    mo_ta: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Mô tả sản phẩm'
    },
    don_vi_tinh: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'Cái',
        comment: 'Đơn vị tính'
    },
    ton_kho_hien_tai: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Số lượng tồn kho hiện tại'
    },
    ton_kho_toi_thieu: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Mức tồn kho tối thiểu'
    }
}, {
    tableName: 'products',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['sku'] },
        { fields: ['ton_kho_hien_tai'] }
    ]
});

module.exports = Product;
