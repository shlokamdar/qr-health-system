import api from '../utils/api';

const AuthService = {
    login: async (username, password) => {
        const response = await api.post('auth/login/', { username, password });
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('auth/register/', userData);
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
