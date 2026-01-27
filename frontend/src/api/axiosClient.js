import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:80', // API Gateway URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptors can be added here for token handling
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Add role header for admin endpoints
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user.role) {
                config.headers['x-role'] = user.role;
            }
        } catch (e) {
            console.error('Failed to parse user data', e);
        }
    }

    return config;
});

export default axiosClient;
