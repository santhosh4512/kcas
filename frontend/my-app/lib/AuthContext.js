'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('kcas_auth_token');
        const storedUser = localStorage.getItem('kcas_user_data');

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);

          // Verify with backend
          try {
            const res = await api.get('/auth/me');
            if (res.data && res.data.data) {
              setUser(res.data.data);
              localStorage.setItem('kcas_user_data', JSON.stringify(res.data.data));
            }
          } catch (e) {
            if (e.response && e.response.status === 401) {
              localStorage.removeItem('kcas_auth_token');
              localStorage.removeItem('kcas_user_data');
              setUser(null);
              setToken(null);
            }
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data && res.data.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem('kcas_auth_token', userToken);
        localStorage.setItem('kcas_user_data', JSON.stringify(userData));
        setToken(userToken);
        setUser(userData);
        return { success: true, user: userData, token: userToken };
      }
      return {
        success: false,
        message: res.data?.message || 'Invalid email or password',
      };
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          (err.response?.status === 401 ? 'Invalid email or password' : 'Login failed. Please check your network connection.'),
      };
    }
  };

  const setSession = (newToken, newUser) => {
    localStorage.setItem('kcas_auth_token', newToken);
    localStorage.setItem('kcas_user_data', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('kcas_auth_token');
    localStorage.removeItem('kcas_user_data');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    const userRole = (user.role || '').toLowerCase();
    return roles.some((r) => r.toLowerCase() === userRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        setSession,
        logout,
        hasRole,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
