import api from './api.js';

export const authService = {
  async register(payload) {
    const res = await api.post('/auth/register', payload);
    return res.data.data;
  },

  async login(payload) {
    const res = await api.post('/auth/login', payload);
    return res.data.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  async logout() {
    await api.post('/auth/logout');
  },

  async searchUsers(query) {
    const res = await api.get('/users/search', { params: { q: query } });
    return res.data.data;
  },

  async getReminders() {
    const res = await api.get('/users/reminders');
    return res.data.data;
  },

  async getDashboardStats() {
    const res = await api.get('/users/dashboard-stats');
    return res.data.data;
  },
};
