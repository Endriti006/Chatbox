import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for authentication (optional - for future use)
apiService.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - backend might be starting up');
    } else if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response from server - is the backend running?');
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: (credentials) => apiService.post('/auth/login', credentials),
  register: (userData) => apiService.post('/auth/register', userData),
  getProfile: () => apiService.get('/auth/profile'),
  updateProfile: (data) => apiService.put('/auth/profile', data),
};

// Chatbot Service
export const chatbotService = {
  getAllChatbots: () => apiService.get('/admin/chatbots'),
  getChatbot: (id) => apiService.get(`/admin/chatbots/${id}`),
  createChatbot: (data) => apiService.post('/admin/chatbots', data),
  updateChatbot: (id, data) => apiService.put(`/admin/chatbots/${id}`, data),
  deleteChatbot: (id) => apiService.delete(`/admin/chatbots/${id}`),
};

// Training Service
export const trainService = {
  trainWebsite: (data) => apiService.post('/train/website', data),
  getTrainingStatus: (chatbotId) => apiService.get(`/train/status/${chatbotId}`),
  retrainChatbot: (chatbotId) => apiService.post(`/train/retrain/${chatbotId}`),
};

// Chat Service
export const chatService = {
  sendMessage: (data) => apiService.post('/chat/message', data),
  getChatHistory: (chatbotId) => apiService.get(`/chat/history/${chatbotId}`),
  clearHistory: (chatbotId) => apiService.delete(`/chat/history/${chatbotId}`),
};

// Analytics Service
export const analyticsService = {
  getStats: (chatbotId) => apiService.get(`/admin/analytics/${chatbotId}`),
  getChats: (chatbotId, params) => apiService.get(`/admin/chats/${chatbotId}`, { params }),
};

// Billing Service
export const billingService = {
  getPlans: () => apiService.get('/billing/plans'),
  getCurrentPlan: () => apiService.get('/billing/current'),
  createCheckoutSession: (planId) => apiService.post('/billing/create-checkout', { planId }),
  cancelSubscription: () => apiService.post('/billing/cancel'),
  getBillingHistory: () => apiService.get('/billing/history'),
};

// Widget Service
export const widgetService = {
  getWidgetCode: (chatbotId) => apiService.get(`/widget/code/${chatbotId}`),
  getWidgetSettings: (chatbotId) => apiService.get(`/widget/settings/${chatbotId}`),
  updateWidgetSettings: (chatbotId, data) => apiService.put(`/widget/settings/${chatbotId}`, data),
};

// Legacy export
export const userService = authService;

export default apiService;