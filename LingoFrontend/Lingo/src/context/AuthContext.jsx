import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async () => {
        const token = localStorage.getItem('lingosync_token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await apiClient.get('/api/users/profile');
            setUser(res.data);
        } catch (err) {
            console.error('Lỗi khi lấy thông tin người dùng:', err);
            localStorage.removeItem('lingosync_token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const loginWithToken = (token) => {
        localStorage.setItem('lingosync_token', token);
        setLoading(true);
        fetchUserProfile();
    };

    const logout = () => {
        localStorage.removeItem('lingosync_token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                loginWithToken,
                logout,
                refreshUser: fetchUserProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
    }
    return context;
};
