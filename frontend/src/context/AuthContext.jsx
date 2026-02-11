import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    setUser({
                        id: decoded.user_id,
                        role: decoded.role || null,
                        username: decoded.username || null,
                    });

                    // Fallback: if role not in token, fetch from /me/
                    if (!decoded.role) {
                        try {
                            const res = await api.get('auth/me/');
                            setUser(prev => ({ ...prev, role: res.data.role }));
                        } catch (err) {
                            console.error('Failed to fetch user info', err);
                        }
                    }
                } catch (error) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('auth/login/', { username, password });
            const { access, refresh, role, username: resUsername, is_superuser } = response.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            const decoded = jwtDecode(access);
            const userData = {
                id: decoded.user_id,
                role: role || decoded.role || null,
                username: resUsername || decoded.username || null,
                is_superuser: is_superuser || decoded.is_superuser || false,
            };
            setUser(userData);
            return userData;
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    };

    const register = async (userData) => {
        try {
            await api.post('auth/register/', userData);
            return true;
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
