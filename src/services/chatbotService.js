import api from '../config/api';

const chatbotService = {
  // Get initial greeting message
  getInitialMessage: async () => {
    const response = await api.get('/chatbot/initial');
    return response.data.data;
  },

  // Send message and get response
  sendMessage: async (message, conversationHistory = []) => {
    const response = await api.post('/chatbot/message', {
      message,
      conversationHistory,
    });
    return response.data.data;
  },
};

export default chatbotService;

