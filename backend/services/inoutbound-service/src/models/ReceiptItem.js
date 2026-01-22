const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Product = require('./Product');

// Model Chi tiết phiếu (dùng chung cho nhập và xuất)
const ReceiptItem = sequelize.define('ReceiptItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    receipt_type: {
        type: DataTypes.ENUM('INBOUND', 'OUTBOUND'),
        allowNull: false,
        comment: 'Loại phiếu'
    },
    receipt_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID phiếu'
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID sản phẩm',
        references: {
            model: 'products',
            key: 'id'
        }
    },
    so_luong: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Số lượng'
    },
    don_gia: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Đơn giá'
    },
    ghi_chu: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Ghi chú'
    }
}, {
    tableName: 'receipt_items',
    timestamps: true,
    underscored: true,
    updatedAt: false, // Không cần updated_at cho chi tiết phiếu
    indexes: [
        { fields: ['receipt_type', 'receipt_id'] },
        { fields: ['product_id'] }
    ]
});

// Quan hệ với Product
ReceiptItem.belongsTo(Product, { foreignKey: 'product_id', as: 'san_pham' });

module.exports = ReceiptItem;
