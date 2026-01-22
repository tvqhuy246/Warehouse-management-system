// File tập trung các models và thiết lập quan hệ
const Product = require('./Product');
const InboundReceipt = require('./InboundReceipt');
const OutboundReceipt = require('./OutboundReceipt');
const ReceiptItem = require('./ReceiptItem');
const InventoryHistory = require('./InventoryHistory');

// Thiết lập quan hệ giữa Receipt và ReceiptItem
InboundReceipt.hasMany(ReceiptItem, {
    foreignKey: 'receipt_id',
    constraints: false,
    scope: { receipt_type: 'INBOUND' },
    as: 'chi_tiet'
});

OutboundReceipt.hasMany(ReceiptItem, {
    foreignKey: 'receipt_id',
    constraints: false,
    scope: { receipt_type: 'OUTBOUND' },
    as: 'chi_tiet'
});

// Thiết lập quan hệ ngược lại
ReceiptItem.belongsTo(InboundReceipt, {
    foreignKey: 'receipt_id',
    constraints: false,
    as: 'phieu_nhap'
});

ReceiptItem.belongsTo(OutboundReceipt, {
    foreignKey: 'receipt_id',
    constraints: false,
    as: 'phieu_xuat'
});

module.exports = {
    Product,
    InboundReceipt,
    OutboundReceipt,
    ReceiptItem,
    InventoryHistory
};
