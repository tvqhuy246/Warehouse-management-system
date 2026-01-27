
const { Sequelize } = require('sequelize');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('order_details', 'location_code', {
            type: Sequelize.STRING(50),
            allowNull: true,
            comment: 'Vị trí kho: KHO-KHU-HANG-KE'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('order_details', 'location_code');
    }
};
