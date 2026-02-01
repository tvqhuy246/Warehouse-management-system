const axios = require('axios');

// URL của Product Service
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:8082';

const productApi = {
    /**
     * Lấy danh sách tất cả sản phẩm từ Product Service
     * @returns {Promise<Array>} Danh sách sản phẩm
     */
    getAllProducts: async () => {
        try {
            const response = await axios.get(`${PRODUCT_SERVICE_URL}/products`);
            return response.data;
        } catch (error) {
            console.error('Error fetching products from Product Service:', error.message);
            return [];
        }
    },

    /**
     * Update product price based on new inbound cost
     * @param {string} productId - Product UUID
     * @param {object} data - { new_cost, quantity }
     * @returns {Promise<object>} Updated product
     */
    updateProductPrice: async (productId, data) => {
        try {
            const response = await axios.patch(`${PRODUCT_SERVICE_URL}/products/${productId}/cost`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating product price:', error.message);
            throw error;
        }
    }
};

module.exports = productApi;
