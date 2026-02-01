const axios = require('axios');

const productClient = axios.create({
    baseURL: process.env.PRODUCT_SERVICE_URL || 'http://product-service:8082',
    timeout: 5000
});

const inoutClient = axios.create({
    baseURL: process.env.INOUTBOUND_SERVICE_URL || 'http://inoutbound-service:3000',
    timeout: 5000
});

exports.getProduct = async (id) => {
    try {
        const { data } = await productClient.get(`/products/${id}`);
        return data; // Assuming it returns product object
    } catch (error) {
        console.error('Product Service Error:', error.message);
        return null;
    }
};

exports.getAllProducts = async () => {
    try {
        const { data } = await productClient.get('/products');
        return data;
    } catch (error) {
        console.error('Product Service Error:', error.message);
        return [];
    }
};

exports.getOrderDetails = async (orderId) => {
    try {
        const { data } = await inoutClient.get(`/api/nhapkho/${orderId}`); // Or generic /api/orders
        return data.data;
    } catch (error) {
        return null;
    }
};

exports.getLocationByCode = async (location_code) => {
    try {
        const { data } = await productClient.get(`/locations/search?q=${location_code}`);
        // Return first exact match
        return Array.isArray(data) ? data.find(loc => loc.location_code === location_code) : null;
    } catch (error) {
        console.error('Location Service Error:', error.message);
        return null;
    }
};

exports.getAllLocations = async () => {
    try {
        const { data } = await productClient.get('/locations/');
        return data;
    } catch (error) {
        console.error('Location Service Error (getAll):', error.message);
        return [];
    }
};
exports.updateProductCost = async (id, average_cost) => {
    try {
        const { data } = await productClient.patch(`/products/${id}/cost`, { average_cost });
        return data;
    } catch (error) {
        console.error('Product Cost Update Error:', error.message);
        throw error;
    }
};
