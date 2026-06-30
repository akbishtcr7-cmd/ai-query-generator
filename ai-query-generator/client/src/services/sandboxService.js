import api from './api';

export const sandboxService = {
  getAll:             ()           => api.get('/sandbox'),
  create:             (data)       => api.post('/sandbox', data),
  getOne:             (id)         => api.get(`/sandbox/${id}`),
  delete:             (id)         => api.delete(`/sandbox/${id}`),
  addTable:           (id, data)   => api.post(`/sandbox/${id}/table`, data),
  simulate:           (id, data)   => api.post(`/sandbox/${id}/simulate`, data),
  getTableData:       (id, table)  => api.get(`/sandbox/${id}/table/${table}`),
  reset:              (id)         => api.post(`/sandbox/${id}/reset`),
  updatePassword:     (id, data)   => api.put(`/sandbox/${id}/password`, data),
};
