import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile on startup if token is available
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } else {
          logout();
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, ...userData } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: 'Login failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials or server error';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (name, email, password, phone) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, phone });
      if (res.data.success) {
        const { token, ...userData } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: 'Registration failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed or server error';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Forgot password handler
  const forgotPassword = async (email) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to request password reset';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Reset password handler
  const resetPassword = async (email, code, newPassword) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { email, code, newPassword });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // QR Login session initializer
  const qrLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update profile handler (self-update)
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        const { token, ...userData } = res.data;
        if (token) {
          localStorage.setItem('token', token);
        }
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: 'Failed to update profile' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error updating profile';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        updateProfile,
        register,
        forgotPassword,
        resetPassword,
        qrLogin,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
