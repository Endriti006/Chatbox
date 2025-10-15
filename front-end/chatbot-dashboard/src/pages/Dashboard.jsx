import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chatbotService, analyticsService } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalChatbots: 0,
    totalMessages: 0,
    totalConversations: 0,
    avgResponseTime: 0,
  });
  const [recentChatbots, setRecentChatbots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const chatbotsRes = await chatbotService.getAllChatbots();
      const chatbots = Array.isArray(chatbotsRes.data) ? chatbotsRes.data : [];
      
      setRecentChatbots(chatbots.slice(0, 3));
      
      // Calculate aggregate stats
      let totalMessages = 0;
      let totalConversations = 0;
      
      for (const bot of chatbots) {
        totalMessages += bot.total_messages || 0;
        totalConversations += bot.total_conversations || 0;
      }
      
      setStats({
        totalChatbots: chatbots.length,
        totalMessages,
        totalConversations,
        avgResponseTime: '< 1',
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty state on error instead of leaving it loading
      setRecentChatbots([]);
      setStats({
        totalChatbots: 0,
        totalMessages: 0,
        totalConversations: 0,
        avgResponseTime: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your chatbots today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Chatbots</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalChatbots}</p>
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
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalMessages}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversations</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalConversations}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Response Time</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.avgResponseTime}s</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/chatbots"
                className="flex items-center gap-3 p-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-medium">Create New Chatbot</span>
              </Link>
              
              <Link
                to="/train"
                className="flex items-center gap-3 p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="font-medium">Train Chatbot</span>
              </Link>
              
              <Link
                to="/analytics"
                className="flex items-center gap-3 p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium">View Analytics</span>
              </Link>
              
              <Link
                to="/billing"
                className="flex items-center gap-3 p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="font-medium">Upgrade Plan</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Chatbots */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Chatbots</h2>
              <Link to="/chatbots" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View All
              </Link>
            </div>
            
            {recentChatbots.length > 0 ? (
              <div className="space-y-4">
                {recentChatbots.map((bot) => (
                  <div key={bot.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
                        style={{ backgroundColor: bot.primary_color || '#3b82f6' }}
                      >
                        {bot.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{bot.name}</h3>
                        <p className="text-sm text-gray-500">{bot.website_url}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{bot.total_messages || 0}</p>
                      <p className="text-xs text-gray-500">messages</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No chatbots yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first chatbot.</p>
                <Link to="/chatbots" className="btn-primary mt-4 inline-block">
                  Create Chatbot
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Getting Started Guide */}
      {stats.totalChatbots === 0 && (
        <div className="card mt-6 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Getting Started</h3>
              <p className="text-gray-600 mb-4">
                Follow these steps to create and deploy your first AI chatbot:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Create a new chatbot and provide your website URL</li>
                <li>Train the chatbot with your website content</li>
                <li>Customize the chatbot appearance and behavior</li>
                <li>Get the widget code and add it to your website</li>
              </ol>
              <Link to="/chatbots" className="btn-primary mt-4 inline-block">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;