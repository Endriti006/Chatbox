import React, { useState, useEffect } from 'react';
import { chatbotService, widgetService } from '../services/api';

const Settings = () => {
  const [chatbots, setChatbots] = useState([]);
  const [selectedBot, setSelectedBot] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [widgetCode, setWidgetCode] = useState('');
  const [showWidget, setShowWidget] = useState(false);
  
  const [settings, setSettings] = useState({
    name: '',
    greeting_message: '',
    primary_color: '#3b82f6',
    position: 'bottom-right',
    avatar_url: '',
    placeholder_text: 'Type your message...',
    response_time: 'instant',
  });

  useEffect(() => {
    fetchChatbots();
  }, []);

  useEffect(() => {
    if (selectedBot) {
      loadChatbotSettings();
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

  const loadChatbotSettings = async () => {
    try {
      const response = await chatbotService.getChatbot(selectedBot);
      const bot = response.data;
      setSettings({
        name: bot.name || '',
        greeting_message: bot.greeting_message || '',
        primary_color: bot.primary_color || '#3b82f6',
        position: bot.position || 'bottom-right',
        avatar_url: bot.avatar_url || '',
        placeholder_text: bot.placeholder_text || 'Type your message...',
        response_time: bot.response_time || 'instant',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await chatbotService.updateChatbot(selectedBot, settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleGetWidgetCode = async () => {
    try {
      const response = await widgetService.getWidgetCode(selectedBot);
      setWidgetCode(response.data.code);
      setShowWidget(true);
    } catch (error) {
      console.error('Error fetching widget code:', error);
      alert('Error fetching widget code. Please try again.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(widgetCode);
    alert('Widget code copied to clipboard!');
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
          <p className="mt-1 text-gray-500">Create a chatbot first to configure settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chatbot Settings</h1>
        <p className="text-gray-600 mt-1">Customize your chatbot appearance and behavior</p>
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="label">Chatbot Name</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="input-field"
                placeholder="Support Bot"
                required
              />
            </div>

            <div>
              <label className="label">Greeting Message</label>
              <textarea
                value={settings.greeting_message}
                onChange={(e) => setSettings({ ...settings, greeting_message: e.target.value })}
                className="input-field"
                rows="3"
                placeholder="Hi! How can I help you today?"
                required
              />
            </div>

            <div>
              <label className="label">Placeholder Text</label>
              <input
                type="text"
                value={settings.placeholder_text}
                onChange={(e) => setSettings({ ...settings, placeholder_text: e.target.value })}
                className="input-field"
                placeholder="Type your message..."
              />
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Appearance</h2>
          
          <div className="space-y-4">
            <div>
              <label className="label">Primary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="input-field flex-1"
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            <div>
              <label className="label">Widget Position</label>
              <select
                value={settings.position}
                onChange={(e) => setSettings({ ...settings, position: e.target.value })}
                className="input-field"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
              </select>
            </div>

            <div>
              <label className="label">Avatar URL (Optional)</label>
              <input
                type="url"
                value={settings.avatar_url}
                onChange={(e) => setSettings({ ...settings, avatar_url: e.target.value })}
                className="input-field"
                placeholder="https://example.com/avatar.png"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to use default avatar</p>
            </div>
          </div>
        </div>

        {/* Behavior Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Behavior</h2>
          
          <div className="space-y-4">
            <div>
              <label className="label">Response Time</label>
              <select
                value={settings.response_time}
                onChange={(e) => setSettings({ ...settings, response_time: e.target.value })}
                className="input-field"
              >
                <option value="instant">Instant</option>
                <option value="typing">Show Typing Indicator</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose whether to show a typing indicator before responses
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            type="button"
            onClick={handleGetWidgetCode}
            className="btn-secondary flex-1"
          >
            Get Widget Code
          </button>
        </div>
      </form>

      {/* Widget Code Modal */}
      {showWidget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Widget Installation Code</h2>
              <button
                onClick={() => setShowWidget(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Copy and paste this code before the closing &lt;/body&gt; tag of your website:
            </p>

            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
                <code>{widgetCode || `<script src="${window.location.origin}/widget.js"></script>
<script>
  ChatbotWidget.init({
    chatbotId: '${selectedBot}',
    position: '${settings.position}',
    primaryColor: '${settings.primary_color}'
  });
</script>`}</code>
              </pre>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={copyToClipboard}
                className="btn-primary flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy to Clipboard
              </button>
              <button
                onClick={() => setShowWidget(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
