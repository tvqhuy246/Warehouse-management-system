const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Model Phiếu nhập kho
const InboundReceipt = sequelize.define('InboundReceipt', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ma_phieu_nhap: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Mã phiếu nhập'
    },
    nha_cung_cap: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nhà cung cấp'
    },
    ngay_nhap: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Ngày nhập kho'
    },
    nguoi_tao: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Người tạo phiếu'
    },
    ghi_chu: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Ghi chú'
    },
    trang_thai: {
        type: DataTypes.ENUM('DRAFT', 'COMPLETED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'DRAFT',
        comment: 'Trạng thái phiếu'
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'inbound_receipts',
    timestamps: true,
    underscored: true,
    paranoid: true, // Soft delete
    indexes: [
        { fields: ['ma_phieu_nhap'] },
        { fields: ['ngay_nhap'] },
        { fields: ['trang_thai'] }
    ]
});

module.exports = InboundReceipt;
