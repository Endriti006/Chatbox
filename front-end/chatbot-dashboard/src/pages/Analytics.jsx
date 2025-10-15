import React, { useState, useEffect } from 'react';
import { chatbotService, analyticsService } from '../services/api';

const Analytics = () => {
  const [chatbots, setChatbots] = useState([]);
  const [selectedBot, setSelectedBot] = useState('');
  const [stats, setStats] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    fetchChatbots();
  }, []);

  useEffect(() => {
    if (selectedBot) {
      fetchAnalytics();
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
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [statsRes, chatsRes] = await Promise.all([
        analyticsService.getStats(selectedBot),
        analyticsService.getChats(selectedBot, { limit: 50 }),
      ]);
      setStats(statsRes.data);
      setChats(chatsRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (chatbots.length === 0) {
    return (
      <div className="p-6">
        <div className="card text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No chatbots available</h3>
          <p className="mt-1 text-gray-500">Create a chatbot first to view analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Chat History</h1>
        <p className="text-gray-600 mt-1">Monitor your chatbot performance and conversations</p>
      </div>

      <div className="mb-6">
        <label className="label">Select Chatbot</label>
        <select
          value={selectedBot}
          onChange={(e) => setSelectedBot(e.target.value)}
          className="input-field max-w-md"
        >
          {chatbots.map((bot) => (
            <option key={bot.id} value={bot.id}>
              {bot.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.total_messages || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.total_conversations || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Response Time</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.avg_response_time || '< 1'}s
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.messages_this_month || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat History */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Conversations</h2>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Export Data
          </button>
        </div>

        {chats && chats.length > 0 ? (
          <div className="space-y-3">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-gray-50 cursor-pointer transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {chat.user_name || 'Anonymous User'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {chat.last_message || 'No messages'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(chat.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{chat.message_count || 0} messages</span>
                  {chat.duration && <span>{chat.duration} min</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="mt-2">No conversations yet</p>
            <p className="text-sm">Conversations will appear here once users start chatting</p>
          </div>
        )}
      </div>

      {/* Chat Detail Modal */}
      {selectedChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedChat.user_name || 'Anonymous User'}
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date(selectedChat.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedChat(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {selectedChat.messages?.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )) || <p className="text-gray-500 text-center">No messages in this conversation</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
