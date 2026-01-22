const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Model Phiếu xuất kho
const OutboundReceipt = sequelize.define('OutboundReceipt', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ma_phieu_xuat: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Mã phiếu xuất'
    },
    khach_hang: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Khách hàng/Đích đến'
    },
    ngay_xuat: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Ngày xuất kho'
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
    tableName: 'outbound_receipts',
    timestamps: true,
    underscored: true,
    paranoid: true, // Soft delete
    indexes: [
        { fields: ['ma_phieu_xuat'] },
        { fields: ['ngay_xuat'] },
        { fields: ['trang_thai'] }
    ]
});

module.exports = OutboundReceipt;
