const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'inventory_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'rootpassword',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Inventory DB connected');
    } catch (error) {
        console.error('Inventory DB connection error:', error);
    }
};

module.exports = { sequelize, testConnection };
