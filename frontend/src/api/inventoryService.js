import axiosClient from './axiosClient';

const inventoryService = {
    // Inventory (Stock levels)
    getInventory: () => {
        return axiosClient.get('/api/inventory/');
    },

    // Inbound Requests
    createInboundRequest: (data) => {
        return axiosClient.post('/api/inbound/', data);
    },
    getInboundRequests: () => {
        return axiosClient.get('/api/inbound/');
    },

    // Outbound Requests
    createOutboundRequest: (data) => {
        return axiosClient.post('/api/outbound/', data);
    },
    getOutboundRequests: () => {
        return axiosClient.get('/api/outbound/');
    },

    // Statistics
    getStatistics: () => {
        return axiosClient.get('/api/statistics/');
    }
};

export default inventoryService;
