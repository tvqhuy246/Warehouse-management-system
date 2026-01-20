import axiosClient from './axiosClient';

const productService = {
    getAllProducts: () => {
        return axiosClient.get('/api/products/');
    },
    getProductById: (id) => {
        return axiosClient.get(`/api/products/${id}`);
    },
    createProduct: (productData) => {
        return axiosClient.post('/api/products/', productData);
    },
    updateProduct: (id, productData) => {
        return axiosClient.put(`/api/products/${id}`, productData);
    },
    deleteProduct: (id) => {
        return axiosClient.delete(`/api/products/${id}`);
    }
};

export default productService;
