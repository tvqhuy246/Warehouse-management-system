import axiosClient from './axiosClient';

const authService = {
    login: (credentials) => {
        return axiosClient.post('/api/auth/login', credentials);
    },
    createStaff: (userData) => {
        return axiosClient.post('/api/auth/register-staff', userData);
    },
    logout: () => {
        localStorage.removeItem('token');
    },
    getCurrentUser: () => {
        // Example if there's a /me endpoint or just decode token
        return axiosClient.get('/api/auth/me'); // Adjust based on actual API
    }
};

export default authService;
