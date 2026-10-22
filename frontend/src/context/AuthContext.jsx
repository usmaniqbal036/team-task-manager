import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService.js';
import { REMINDERS_SEEN_KEY } from '../utils/storageKeys.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (payload) => {
    try {
      const loggedInUser = await authService.login(payload);
      sessionStorage.removeItem(REMINDERS_SEEN_KEY);
      setUser(loggedInUser);
      toast.success('Welcome back', `Logged in as ${loggedInUser.name}`);
      return loggedInUser;
    } catch (err) {
      toast.error('Login Failed', err.message || 'Please check your credentials and try again.');
      throw err;
    }
  };

  const register = async (payload) => {
    try {
      const newUser = await authService.register(payload);
      sessionStorage.removeItem(REMINDERS_SEEN_KEY);
      setUser(newUser);
      toast.success('Account Created', `Welcome to Team Task Manager, ${newUser.name}`);
      return newUser;
    } catch (err) {
      toast.error('Registration Failed', err.message || 'Please check your input.');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      sessionStorage.removeItem(REMINDERS_SEEN_KEY);
      setUser(null);
      toast.info('Logged out', 'You have been safely signed out.');
    } catch (err) {
      toast.error('Logout error', err.message || 'Failed to logout cleanly.');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
