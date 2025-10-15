import React, { useState, useEffect } from 'react';
import { chatbotService, chatService } from '../services/api';

const TestChat = () => {
  const [chatbots, setChatbots] = useState([]);
  const [selectedBot, setSelectedBot] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);

  useEffect(() => {
    fetchChatbots();
  }, []);

  useEffect(() => {
    if (selectedBot) {
      // Reset messages when chatbot changes
      setMessages([
        {
          role: 'assistant',
          content: getChatbot()?.greeting_message || 'Hello! How can I help you today?',
          timestamp: new Date()
        }
      ]);
    }
  }, [selectedBot]);

  const fetchChatbots = async () => {
    try {
      const response = await chatbotService.getAllChatbots();
      setChatbots(response.data);
      if (response.data.length > 0) {
        setSelectedBot(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching chatbots:', error);
    }
  };

  const getChatbot = () => chatbots.find(bot => bot.id === selectedBot);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedBot) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await chatService.sendMessage({
        chatbotId: selectedBot,
        sessionId: sessionId,
        message: inputMessage
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.answer || response.data.message || 'I apologize, I could not generate a response.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: `❌ Error: ${error.response?.data?.error || 'Failed to get response. Please try again.'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    const bot = getChatbot();
    setMessages([
      {
        role: 'assistant',
        content: bot?.greeting_message || 'Hello! How can I help you today?',
        timestamp: new Date()
      }
    ]);
  };

  if (chatbots.length === 0) {
    return (
      <div className="p-6">
        <div className="card text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No chatbots available</h3>
          <p className="mt-1 text-gray-500">Create a chatbot first to test it.</p>
        </div>
      </div>
    );
  }

  const currentBot = getChatbot();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Test Your Chatbot</h1>
        <p className="text-gray-600 mt-1">Have a conversation and see how your chatbot responds</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <div className="card h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: currentBot?.color || '#3b82f6' }}
                >
                  {currentBot?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{currentBot?.name}</h3>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>
              <button
                onClick={clearChat}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear Chat
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-primary-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-3">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="border-t pt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 input-field"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="btn-primary px-6 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Chatbot Selector */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Select Chatbot</h3>
            <select
              value={selectedBot}
              onChange={(e) => setSelectedBot(e.target.value)}
              className="input-field"
            >
              {chatbots.map((bot) => (
                <option key={bot.id} value={bot.id}>
                  {bot.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chatbot Info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Chatbot Info</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Website:</span>
                <p className="text-gray-900 truncate">{currentBot?.website_url || 'Not set'}</p>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <p className="text-gray-900">{currentBot?.status || 'Active'}</p>
              </div>
              <div>
                <span className="text-gray-600">Color:</span>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: currentBot?.color || '#3b82f6' }}
                  ></div>
                  <span className="text-gray-900">{currentBot?.color || '#3b82f6'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Testing Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ask questions about your website</li>
              <li>• Try different phrasings</li>
              <li>• Test edge cases</li>
              <li>• Check response quality</li>
            </ul>
          </div>

          {/* Warning */}
          {(!currentBot?.website_url || currentBot.status === 'inactive') && (
            <div className="card bg-yellow-50 border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Not Trained</h3>
              <p className="text-sm text-yellow-800">
                This chatbot hasn't been trained yet. Go to the Train page to train it with website content.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestChat;
