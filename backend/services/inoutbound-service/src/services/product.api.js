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
    }
};

module.exports = productApi;
