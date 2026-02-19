import api from '../utils/api';

const AuthService = {
    login: async (username, password) => {
        const response = await api.post('auth/login/', { username, password });
        return response.data;
    },

    register: async (userData) => {
        const config = {};
        if (userData instanceof FormData) {
            // Set to undefined to let the browser set the Content-Type with boundary
            config.headers = { 'Content-Type': undefined };
        }
        const response = await api.post('auth/register/', userData, config);
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('auth/me/');
        return response.data;
    },

    refreshToken: async (refresh) => {
        const response = await api.post('auth/refresh/', { refresh });
        return response.data;
    },

    checkUsername: async (username) => {
        const response = await api.get(`auth/check-username/?username=${username}`);
        return response.data;
    }
};

export default AuthService;
