'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from './api';

interface User {
    id: string;
    name: string;
    email?: string;
    phone: string;
    role: 'user' | 'owner' | 'admin';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (phone: string, password: string, role: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored token on mount
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            fetchUser(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async (authToken: string) => {
        try {
            const response: any = await authAPI.getMe(authToken);
            if (response.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            localStorage.removeItem('token');
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (phone: string, password: string, role: string) => {
        try {
            const response: any = await authAPI.login({ phone, password, role });
            if (response.success && response.token) {
                setToken(response.token);
                setUser(response.data.user);
                localStorage.setItem('token', response.token);
            }
        } catch (error) {
            throw error;
        }
    };

    const register = async (data: any) => {
        try {
            const response: any = await authAPI.register(data);
            if (response.success && response.token) {
                setToken(response.token);
                setUser(response.data.user);
                localStorage.setItem('token', response.token);
            }
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
