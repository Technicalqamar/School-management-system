import api from '../../api/axios';

const classService = {
  createClass: async (data) => {
    const response = await api.post('/classes', data);
    return response.data;
  },

  getAllClasses: async () => {
    const response = await api.get('/classes');
    return response.data;
  },

  updateClass: async (id, data) => {
    const response = await api.put(`/classes/${id}`, data);
    return response.data;
  },

  deleteClass: async (id) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  },

  getClassDetails: async (id) => {
    const response = await api.get(`/classes/${id}/details`);
    return response.data;
  },
};

export default classService;
