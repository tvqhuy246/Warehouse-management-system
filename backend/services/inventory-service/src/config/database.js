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
    let retries = 10;
    while (retries > 0) {
        try {
            await sequelize.authenticate();
            console.log('✓ Inventory DB connected');
            return;
        } catch (error) {
            console.error(`✗ Inventory DB connection failed (retries left: ${retries}):`, error.message);
            retries -= 1;
            await new Promise(res => setTimeout(res, 3000)); // Wait 3s
        }
    }
    console.error('✗ Failed to connect to Inventory DB after multiple attempts');
    process.exit(1);
};

module.exports = { sequelize, testConnection };
