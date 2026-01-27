import axiosClient from './axiosClient';

const partnerService = {
    getPartners: (type) => {
        return axiosClient.get('/api/partners/', { params: { type } });
    },
    getPartnerDetail: (id) => {
        return axiosClient.get(`/api/partners/${id}`);
    },
    createPartner: (data) => {
        return axiosClient.post('/api/partners/', data);
    }
};

export default partnerService;
