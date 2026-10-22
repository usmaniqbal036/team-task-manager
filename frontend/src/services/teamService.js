import api from './api.js';

export const teamService = {
  async getTeams() {
    const res = await api.get('/teams');
    return res.data.data;
  },

  async getTeamById(id) {
    const res = await api.get(`/teams/${id}`);
    return res.data.data;
  },

  async createTeam(payload) {
    const res = await api.post('/teams', payload);
    return res.data.data;
  },

  async updateTeam(id, payload) {
    const res = await api.put(`/teams/${id}`, payload);
    return res.data.data;
  },

  async addMember(teamId, identifier) {
    const res = await api.post(`/teams/${teamId}/members`, identifier);
    return res.data.data;
  },

  async removeMember(teamId, userId) {
    const res = await api.delete(`/teams/${teamId}/members/${userId}`);
    return res.data.data;
  },

  async deleteTeam(id) {
    await api.delete(`/teams/${id}`);
  },
};
