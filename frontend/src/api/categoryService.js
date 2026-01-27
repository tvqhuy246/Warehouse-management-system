import axiosClient from './axiosClient';

const categoryService = {
    // Get all categories
    getAll: () => axiosClient.get('/api/categories/'),

    // Get category by ID
    getById: (id) => axiosClient.get(`/api/categories/${id}`),

    // Create category (admin only)
    create: (data) => axiosClient.post('/api/categories/', data),

    // Update category (admin only)
    update: (id, data) => axiosClient.put(`/api/categories/${id}`, data),

    // Delete category (admin only)
    remove: (id) => axiosClient.delete(`/api/categories/${id}`)
};

export default categoryService;
