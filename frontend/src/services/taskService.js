import api from './api.js';

export const taskService = {
  async getTasks(filters) {
    const params = {};
    if (filters?.teamId) params.teamId = filters.teamId;
    if (filters?.assigneeId) params.assigneeId = filters.assigneeId;
    if (filters?.status) params.status = filters.status;
    if (filters?.priority) params.priority = filters.priority;
    if (filters?.search) params.search = filters.search;

    const res = await api.get('/tasks', { params });
    return res.data.data;
  },

  async getTaskById(id) {
    const res = await api.get(`/tasks/${id}`);
    return res.data.data;
  },

  async createTask(payload) {
    const res = await api.post('/tasks', payload);
    return res.data.data;
  },

  async updateTask(id, payload) {
    const res = await api.put(`/tasks/${id}`, payload);
    return res.data.data;
  },

  async updateStatus(id, status) {
    const res = await api.patch(`/tasks/${id}/status`, { status });
    return res.data.data;
  },

  async deleteTask(id) {
    await api.delete(`/tasks/${id}`);
  },
};
