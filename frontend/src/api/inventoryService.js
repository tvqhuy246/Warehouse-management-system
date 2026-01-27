import axiosClient from './axiosClient';

const inventoryService = {
    // Tồn kho tổng quát (Aggregated Report)
    getReport: (filters) => {
        return axiosClient.get('/api/reports/summary', { params: filters });
    },

    // Tồn kho chi tiết theo vị trí
    getInventoryByLocation: (productId) => {
        return axiosClient.get('/api/inventory/by-location', { params: { product_id: productId } });
    },
    exportInventoryReport: (filters) => {
        return axiosClient.get('/api/reports/export-inventory', {
            params: filters,
            responseType: 'blob'
        });
    },

    // Nhập kho (PN)
    getInbounds: (filters) => {
        return axiosClient.get('/api/inbound/', { params: filters });
    },
    createInbound: (data) => {
        return axiosClient.post('/api/inbound/', data);
    },
    getInboundBillOfLading: (id) => {
        return axiosClient.get(`/api/inbound/${id}/vandon`);
    },
    getInboundDetail: (id) => {
        return axiosClient.get(`/api/inbound/${id}`);
    },
    exportInbounds: (filters) => {
        return axiosClient.get('/api/inbound/export', { params: filters, responseType: 'blob' });
    },

    // Xuất kho (PX)
    getOutbounds: (filters) => {
        return axiosClient.get('/api/outbound/', { params: filters });
    },
    createOutbound: (data) => {
        return axiosClient.post('/api/outbound/', data);
    },
    getOutboundBillOfLading: (id) => {
        return axiosClient.get(`/api/outbound/${id}/vandon`);
    },
    getOutboundDetail: (id) => {
        return axiosClient.get(`/api/outbound/${id}`);
    },
    exportOutbounds: (filters) => {
        return axiosClient.get('/api/outbound/export', { params: filters, responseType: 'blob' });
    },
    suggestFIFO: (productId, quantity) => {
        return axiosClient.get('/api/inventory/suggest-fifo', { params: { product_id: productId, quantity } });
    },

    // Điều chuyển kho
    transferStock: (data) => {
        return axiosClient.post('/api/inventory/transfer', data);
    },

    // Check capacity
    checkCapacity: (locationCode) => {
        return axiosClient.get('/api/inventory/check-capacity', { params: { location_code: locationCode } });
    }
};

export default inventoryService;
