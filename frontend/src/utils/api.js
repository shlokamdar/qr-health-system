import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
const API_URL = import.meta.env.VITE_API_URL || '/api/';
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token && !config.url.includes('auth/login') && !config.url.includes('auth/register')) {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decoded.exp < currentTime) {
                // Token expired - logic to refresh or logout handled usually by response interceptor or checking active
                // For simple prototype, logging out or relying on refresh endpoint logic
            }
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        const emergencyToken = localStorage.getItem('emergency_token');
        if (emergencyToken) {
            config.headers['X-Emergency-Token'] = emergencyToken;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Bypass global 401 handling for auth endpoints so login pages can show their own error messages
        if (originalRequest.url.includes('auth/login') || originalRequest.url.includes('auth/register')) {
            return Promise.reject(error);
        }

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const response = await axios.post(API_URL + 'auth/refresh/', {
                        refresh: refreshToken
                    });
                    localStorage.setItem('access_token', response.data.access);
                    api.defaults.headers['Authorization'] = `Bearer ${response.data.access}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, logout
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/';
                }
            } else {
                localStorage.removeItem('access_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const getFileUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : '';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default api;
