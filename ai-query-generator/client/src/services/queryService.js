import api from './api';

export const queryService = {
  generate: (data) => api.post('/query/generate', data),
  format: (data) => api.post('/query/format', data),
  chat: (data) => api.post('/query/chat', data),
  getDashboard: () => api.get('/query/dashboard'),
  getHistory: (params) => api.get('/history', { params }),
  getHistoryById: (id) => api.get(`/history/${id}`),
  deleteHistory: (id) => api.delete(`/history/${id}`),
  addFavorite: (id, data) => api.post(`/history/${id}/favorite`, data),
  removeFavorite: (id) => api.delete(`/history/${id}/favorite`),
  getFavorites: (params) => api.get('/history/favorites', { params }),
  // Admin
  getPendingQueries: (params) => api.get('/admin/pending', { params }),
  reviewQuery: (id, data) => api.put(`/admin/pending/${id}/review`, data),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle`),
  getAdminStats: () => api.get('/admin/stats'),
};
