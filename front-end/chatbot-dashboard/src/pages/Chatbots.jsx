import React, { useState, useEffect } from 'react';
import { chatbotService } from '../services/api';

const Chatbots = () => {
  const [chatbots, setChatbots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBot, setEditingBot] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    website_url: '',
    greeting_message: 'Hi! How can I help you today?',
    color: '#3b82f6',
  });

  useEffect(() => {
    fetchChatbots();
  }, []);

  const fetchChatbots = async () => {
    try {
      const response = await chatbotService.getAllChatbots();
      setChatbots(response.data);
    } catch (error) {
      console.error('Error fetching chatbots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (editingBot) {
        await chatbotService.updateChatbot(editingBot.id, formData);
        alert('Chatbot updated successfully!');
      } else {
        await chatbotService.createChatbot(formData);
        alert('Chatbot created successfully!');
      }
      setShowModal(false);
      setEditingBot(null);
      setFormData({
        name: '',
        website_url: '',
        greeting_message: 'Hi! How can I help you today?',
        color: '#3b82f6',
      });
      fetchChatbots();
    } catch (error) {
      console.error('Error saving chatbot:', error);
      const errorMsg = error.response?.data?.error || 'Error saving chatbot. Please try again.';
      alert(errorMsg);
    }
  };

  const handleEdit = (bot) => {
    setEditingBot(bot);
    setFormData({
      name: bot.name,
      website_url: bot.website_url,
      greeting_message: bot.greeting_message,
      color: bot.color || '#3b82f6',
    });
    setShowModal(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent event bubbling
    
    if (!window.confirm('Are you sure you want to delete this chatbot? This action cannot be undone.')) {
      return;
    }

    try {
      await chatbotService.deleteChatbot(id);
      alert('Chatbot deleted successfully!');
      fetchChatbots();
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      const errorMsg = error.response?.data?.error || 'Error deleting chatbot. Please try again.';
      alert(errorMsg);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBot(null);
    setFormData({
      name: '',
      website_url: '',
      greeting_message: 'Hi! How can I help you today?',
      color: '#3b82f6',
    });
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Chatbots</h1>
          <p className="text-gray-600 mt-1">Manage your AI chatbots</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Chatbot
        </button>
      </div>

      {chatbots.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No chatbots</h3>
          <p className="mt-1 text-gray-500">Get started by creating a new chatbot.</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary mt-4"
          >
            Create Your First Chatbot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chatbots.map((bot) => (
            <div key={bot.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{bot.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 truncate">{bot.website_url}</p>
                </div>
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: bot.color || '#3b82f6' }}
                ></div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  {bot.total_messages || 0} messages
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Created {new Date(bot.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="border-t pt-4 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(bot);
                  }}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => handleDelete(bot.id, e)}
                  className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingBot ? 'Edit Chatbot' : 'Create New Chatbot'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Chatbot Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Support Bot"
                  required
                />
              </div>

              <div>
                <label className="label">Website URL</label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div>
                <label className="label">Greeting Message</label>
                <textarea
                  value={formData.greeting_message}
                  onChange={(e) => setFormData({ ...formData, greeting_message: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Hi! How can I help you today?"
                  required
                />
              </div>

              <div>
                <label className="label">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-10 w-20 rounded cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="input-field flex-1"
                    placeholder="#3b82f6"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingBot ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbots;
