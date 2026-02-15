import api from '../utils/api';

const DoctorService = {
    getProfile: async () => {
        const res = await api.get('doctors/me/');
        return res.data;
    },

    getConsultations: async () => {
        const res = await api.get('doctors/consultations/');
        return res.data;
    },

    getAppointments: async () => {
        const res = await api.get('doctors/appointments/');
        return res.data;
    },

    updateAppointmentStatus: async (id, status) => {
        const res = await api.patch(`doctors/appointments/${id}/`, { status });
        return res.data;
    },

    getPatientHistory: async (healthId) => {
        const res = await api.get(`doctors/patient-history/${healthId}/`);
        return res.data;
    },

    createConsultation: async (data) => {
        const res = await api.post('doctors/consultations/', data);
        return res.data;
    },

    registerPatient: async (data) => {
        const res = await api.post('doctors/register-patient/', data);
        return res.data;
    },

    getVerifiedDoctors: async () => {
        const res = await api.get('doctors/verified/');
        return res.data;
    },

    getHospitals: async () => {
        const res = await api.get('doctors/hospitals/');
        return res.data;
    },

    registerDoctor: async (data) => {
        const res = await api.post('doctors/register/', data);
        return res.data;
    }
};

export default DoctorService;
