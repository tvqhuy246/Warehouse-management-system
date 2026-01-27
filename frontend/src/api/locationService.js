import axiosClient from './axiosClient';

const locationService = {
    // Get all locations
    getAll: (filters) => axiosClient.get('/api/locations/', { params: filters }),

    // Get location by ID
    getById: (id) => axiosClient.get(`/api/locations/${id}`),

    // Search locations
    search: (query) => axiosClient.get('/api/locations/search', { params: { q: query } }),

    // Create location (admin only)
    create: (data) => axiosClient.post('/api/locations/', data),

    // Update location (admin only)
    update: (id, data) => axiosClient.put(`/api/locations/${id}`, data),

    // Delete location (admin only)
    remove: (id) => axiosClient.delete(`/api/locations/${id}`)
};

export default locationService;
