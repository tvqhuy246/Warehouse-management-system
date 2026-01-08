const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Product = require('./Product');

// Model Lịch sử tồn kho
const InventoryHistory = sequelize.define('InventoryHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    loai_giao_dich: {
        type: DataTypes.ENUM('INBOUND', 'OUTBOUND'),
        allowNull: false,
        comment: 'Loại giao dịch'
    },
    so_luong_thay_doi: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Số lượng thay đổi (+/-)'
    },
    ton_kho_truoc: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Tồn kho trước khi thay đổi'
    },
    ton_kho_sau: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Tồn kho sau khi thay đổi'
    },
    receipt_type: {
        type: DataTypes.ENUM('INBOUND', 'OUTBOUND'),
        allowNull: false,
        comment: 'Loại phiếu'
    },
    receipt_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID phiếu tham chiếu'
    },
    nguoi_thuc_hien: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Người thực hiện'
    }
}, {
    tableName: 'inventory_history',
    timestamps: true,
    underscored: true,
    updatedAt: false, // Lịch sử không cần updated_at
    indexes: [
        { fields: ['product_id'] },
        { fields: ['loai_giao_dich'] },
        { fields: ['created_at'] }
    ]
});

// Quan hệ với Product
InventoryHistory.belongsTo(Product, { foreignKey: 'product_id', as: 'san_pham' });

module.exports = InventoryHistory;
