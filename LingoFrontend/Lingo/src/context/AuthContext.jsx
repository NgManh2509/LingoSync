import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import i18n from '../i18n/i18n';

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
            if (res.data?.targetLanguage) {
                i18n.changeLanguage(res.data.targetLanguage);
                localStorage.setItem('lingosync_target_lang', res.data.targetLanguage);
            }
            if (res.data?.nativeLanguage) {
                localStorage.setItem('lingosync_native_lang', res.data.nativeLanguage);
            }
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

    const updateLanguagePreference = async (targetLanguage, nativeLanguage = 'vi') => {
        try {
            const res = await apiClient.put('/api/users/preferences', {
                targetLanguage,
                nativeLanguage
            });
            setUser(res.data);
            if (targetLanguage) {
                i18n.changeLanguage(targetLanguage);
                localStorage.setItem('lingosync_target_lang', targetLanguage);
            }
            if (nativeLanguage) {
                localStorage.setItem('lingosync_native_lang', nativeLanguage);
            }
            return res.data;
        } catch (err) {
            console.error('Lỗi khi cập nhật ngôn ngữ:', err);
            throw err;
        }
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
                updateLanguagePreference,
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
