// File tập trung các models và thiết lập quan hệ
const Product = require('./Product');
const Partner = require('./Partner');
const Order = require('./Order');
const OrderDetail = require('./OrderDetail');
const InventoryHistory = require('./InventoryHistory');

// Relationships
Order.belongsTo(Partner, { foreignKey: 'partner_id', as: 'partner' });
Partner.hasMany(Order, { foreignKey: 'partner_id', as: 'orders' });

Order.hasMany(OrderDetail, { foreignKey: 'order_id', as: 'details' });
OrderDetail.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Link OrderDetail to Product (local cache for quick lookups)
OrderDetail.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

const { sequelize } = require('../config/database');

module.exports = {
    sequelize,
    Product,
    Partner,
    Order,
    OrderDetail,
    InventoryHistory
};
