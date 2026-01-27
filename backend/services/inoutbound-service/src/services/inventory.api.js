const axios = require('axios');

const inventoryClient = axios.create({
    baseURL: process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:8083',
    timeout: 5000
});

/**
 * Cập nhật tồn kho qua Inventory Service
 */
exports.updateStock = async ({ order_id, type, items, performed_by }) => {
    try {
        const response = await inventoryClient.post('/inventory/update', {
            order_id,
            type,
            items: items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
                batch_number: item.batch_number,
                location_code: item.location_code
            })),
            performed_by
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi gọi Inventory Service:', error.message);
        throw new Error('Không thể cập nhật tồn kho');
    }
};

/**
 * Kiểm tra tồn kho trước khi xuất
 */
exports.checkStock = async (items) => {
    try {
        const response = await inventoryClient.post('/inventory/check', {
            items: items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity
            }))
        });
        return response.data; // { success: true/false, available: true/false, messages: [] }
    } catch (error) {
        console.error('Lỗi khi kiểm tra tồn kho:', error.message);
        throw new Error('Không thể kiểm tra tồn kho');
    }
};
