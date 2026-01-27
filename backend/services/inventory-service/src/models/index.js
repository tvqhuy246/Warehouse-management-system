const Stock = require('./Stock');
const StockLog = require('./StockLog');

const { sequelize } = require('../config/database');

module.exports = {
    sequelize,
    Stock,
    StockLog
};
