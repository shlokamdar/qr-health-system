import api from '../utils/api';

const labService = {
    getProfile: async () => {
        const res = await api.get('labs/me/');
        return res.data;
    },

    getTests: async () => {
        const res = await api.get('labs/tests/');
        return res.data;
    },

    searchPatient: async (healthId) => {
        const res = await api.get(`patients/${healthId}/`);
        return res;
    },

    uploadReport: async (formData) => {
        const res = await api.post('labs/reports/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },

    getRecentUploads: async () => {
        const res = await api.get('labs/recent-uploads/');
        return res.data;
    },

    getPatientReports: async (healthId) => {
        const res = await api.get(`labs/patient-reports/${healthId}/`);
        return res.data;
    },

    deleteReport: async (id) => {
        const res = await api.delete(`labs/reports/${id}/`);
        return res.data;
    },
};

export default labService;
