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
    return config;
});

export default axiosClient;
