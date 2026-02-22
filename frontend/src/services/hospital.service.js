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
    },

    getTechnicians: async () => {
        const res = await api.get('hospitals/technicians/');
        return res.data;
    },

    createTechnician: async (data) => {
        const res = await api.post('hospitals/technicians/create/', data);
        return res.data;
    },

    assignDoctorDepartment: async (doctorId, departmentId) => {
        const res = await api.patch(`doctors/${doctorId}/`, { department: departmentId });
        return res.data;
    },

    getDepartments: async () => {
        const res = await api.get('departments/');
        return res.data.results || res.data;
    },

    createDepartment: async (data) => {
        const res = await api.post('departments/', data);
        return res.data;
    },

    deleteDepartment: async (id) => {
        const res = await api.delete(`departments/${id}/`);
        return res.data;
    },

    getVisitLogs: async () => {
        const res = await api.get('hospitals/visit-logs/');
        return res.data.results || res.data;
    }
};

export default HospitalService;
