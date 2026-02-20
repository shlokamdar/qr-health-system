import api from '../utils/api';

const HospitalService = {
    getProfile: async () => {
        const res = await api.get('hospitals/me/');
        return res.data;
    },

    getDoctors: async () => {
        const res = await api.get('hospitals/doctors/');
        return res.data;
    },

    getLabs: async () => {
        const res = await api.get('hospitals/labs/');
        return res.data;
    },

    getStats: async () => {
        const res = await api.get('hospitals/stats/');
        return res.data;
    },

    verifyDoctor: async (doctorId) => {
        const res = await api.patch(`hospitals/doctors/${doctorId}/`, { verify: true });
        return res.data;
    },

    updateHospitalProfile: async (data) => {
        const res = await api.patch('hospitals/me/', data);
        return res.data;
    }
};

export default HospitalService;
