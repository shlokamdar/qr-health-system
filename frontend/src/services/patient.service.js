import api from '../utils/api';

const PatientService = {
    getProfile: async () => {
        const res = await api.get('patients/me/');
        return res.data;
    },

    getByHealthId: async (healthId) => {
        const res = await api.get(`patients/${healthId}/`);
        return res.data;
    },

    getRecords: async (healthId = null) => {
        // If healthId is provided, fetch records for that patient (doctor view)
        // Otherwise fetch current user's records (patient view)
        const url = healthId ? `records/?patient=${healthId}` : 'records/';
        const res = await api.get(url);
        return res.data;
    },

    uploadRecord: async (formData) => {
        const res = await api.post('records/', formData);
        return res.data;
    },

    getDocuments: async () => {
        const res = await api.get('patients/documents/');
        return res.data;
    },

    uploadDocument: async (formData) => {
        const res = await api.post('patients/documents/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },

    getPrescriptions: async () => {
        const res = await api.get('patients/prescriptions/');
        return res.data;
    },

    uploadPrescription: async (formData) => {
        const res = await api.post('patients/prescriptions/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },

    getSharingPermissions: async () => {
        const res = await api.get('patients/sharing/');
        return res.data;
    },

    getAccessHistory: async () => {
        const res = await api.get('patients/sharing-history/');
        return res.data;
    },

    revokeAccess: async (id) => {
        const res = await api.post(`patients/sharing/${id}/revoke/`);
        return res.data;
    },

    getEmergencyContacts: async () => {
        const res = await api.get('patients/emergency-contacts/');
        return res.data;
    },

    addEmergencyContact: async (data) => {
        const res = await api.post('patients/emergency-contacts/', data);
        return res.data;
    },

    updateEmergencyContact: async (id, data) => {
        const res = await api.patch(`patients/emergency-contacts/${id}/`, data);
        return res.data;
    },

    deleteEmergencyContact: async (id) => {
        await api.delete(`patients/emergency-contacts/${id}/`);
    },

    updateProfile: async (healthId, data) => {
        const res = await api.patch(`patients/${healthId}/`, data);
        return res.data;
    },

    requestOTP: async (healthId) => {
        const res = await api.post('patients/otp/request/', { health_id: healthId });
        return res.data;
    },

    verifyOTP: async (healthId, otpCode) => {
        const res = await api.post('patients/otp/verify/', {
            health_id: healthId,
            otp_code: otpCode
        });
        return res.data;
    },

    getLabReports: async () => {
        const res = await api.get('labs/reports/');
        return res.data;
    },

    getMyAppointments: async () => {
        const res = await api.get('doctors/appointments/');
        return res.data;
    },

    bookAppointment: async (data) => {
        const res = await api.post('doctors/appointments/', data);
        return res.data;
    },

    getDownloadPdfUrl: () => {
        return api.defaults.baseURL + 'patients/me/download-pdf/';
    },

    downloadPdf: async () => {
        return api.get('patients/me/download-pdf/', { responseType: 'blob' });
    }
};

export default PatientService;
