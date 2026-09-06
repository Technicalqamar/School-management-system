import api from '../../api/axios';

const feeService = {
  createFeeStructure: async (data) => {
    const response = await api.post('/fees/structures', data);
    return response.data;
  },

  getAllFeeStructures: async () => {
    const response = await api.get('/fees/structures');
    return response.data;
  },

  updateFeeStructure: async (id, data) => {
    const response = await api.put(`/fees/structures/${id}`, data);
    return response.data;
  },

  deleteFeeStructure: async (id) => {
    const response = await api.delete(`/fees/structures/${id}`);
    return response.data;
  },

  collectFee: async (data) => {
    const response = await api.post('/fees/collections', data);
    return response.data;
  },

  getStudentPayments: async (params = {}) => {
    const response = await api.get('/fees/collections', { params });
    return response.data;
  },

  getOutstandingDues: async () => {
    const response = await api.get('/fees/outstanding-dues');
    return response.data;
  },

  generateReport: async (params = {}) => {
    const response = await api.get('/fees/reports', { params });
    return response.data;
  },

  searchFeeReportStudents: async (query) => {
    const response = await api.get('/fees/reports/students', { params: { query } });
    return response.data;
  },

  getFeeDashboard: async (params = {}) => {
    const response = await api.get('/fees/dashboard', { params });
    return response.data;
  },
};

export default feeService;