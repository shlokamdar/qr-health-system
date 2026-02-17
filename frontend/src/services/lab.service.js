import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

const getTests = () => {
    return axios.get(API_URL + 'labs/tests/', getAuthHeader());
};

const searchPatient = (healthId) => {
    return axios.get(API_URL + `patients/${healthId}/`, getAuthHeader());
};

const uploadReport = (formData) => {
    return axios.post(API_URL + 'labs/reports/', formData, {
        headers: {
            ...getAuthHeader().headers,
            'Content-Type': 'multipart/form-data',
        },
    });
};

const getRecentUploads = () => {
    return axios.get(API_URL + 'labs/reports/', getAuthHeader());
};

const labService = {
    getTests,
    searchPatient,
    uploadReport,
    getRecentUploads
};

export default labService;
