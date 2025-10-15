import React, { useState, useEffect } from 'react';
import { chatbotService, trainService } from '../services/api';

const Train = () => {
  const [chatbots, setChatbots] = useState([]);
  const [selectedBot, setSelectedBot] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [training, setTraining] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChatbots();
  }, []);

  useEffect(() => {
    if (selectedBot) {
      fetchTrainingStatus();
      
      // Auto-refresh status every 5 seconds if training is in progress
      const interval = setInterval(() => {
        if (trainingStatus?.status === 'pending' || trainingStatus?.status === 'processing') {
          fetchTrainingStatus();
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [selectedBot, trainingStatus?.status]);

  const fetchChatbots = async () => {
    try {
      const response = await chatbotService.getAllChatbots();
      setChatbots(response.data);
      if (response.data.length > 0) {
        setSelectedBot(response.data[0].id);
        setWebsiteUrl(response.data[0].website_url);
      }
    } catch (error) {
      console.error('Error fetching chatbots:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainingStatus = async () => {
    try {
      const response = await trainService.getTrainingStatus(selectedBot);
      setTrainingStatus(response.data);
    } catch (error) {
      console.error('Error fetching training status:', error);
    }
  };

  const handleChatbotChange = (e) => {
    const botId = e.target.value;
    setSelectedBot(botId);
    const bot = chatbots.find(b => b.id === parseInt(botId));
    if (bot) {
      setWebsiteUrl(bot.website_url);
    }
  };

  const handleTrain = async (e) => {
    e.preventDefault();
    if (!selectedBot || !websiteUrl) {
      alert('Please select a chatbot and enter a website URL');
      return;
    }

    setTraining(true);
    try {
      const response = await trainService.trainWebsite({
        chatbotId: selectedBot,
        url: websiteUrl,
      });
      alert('✅ Training started successfully!\n\nCheck the "Training Status" panel on the right to see progress.\n\nThe status will update automatically every 5 seconds.');
      fetchTrainingStatus();
    } catch (error) {
      console.error('Error training chatbot:', error);
      const errorMsg = error.response?.data?.error || 'Error starting training. Please try again.';
      alert(errorMsg);
    } finally {
      setTraining(false);
    }
  };

  const handleRetrain = async () => {
    if (!selectedBot) return;
    
    if (!window.confirm('Are you sure you want to retrain this chatbot? This will replace existing training data.')) {
      return;
    }

    setTraining(true);
    try {
      await trainService.retrainChatbot(selectedBot);
      alert('Retraining started successfully!');
      fetchTrainingStatus();
    } catch (error) {
      console.error('Error retraining chatbot:', error);
      alert('Error starting retraining. Please try again.');
    } finally {
      setTraining(false);
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
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No chatbots available</h3>
          <p className="mt-1 text-gray-500">Create a chatbot first before training.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Train Your Chatbot</h1>
        <p className="text-gray-600 mt-1">Train your chatbot with website content</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training Form */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Training Configuration</h2>
          
          <form onSubmit={handleTrain} className="space-y-4">
            <div>
              <label className="label">Select Chatbot</label>
              <select
                value={selectedBot}
                onChange={handleChatbotChange}
                className="input-field"
                required
              >
                {chatbots.map((bot) => (
                  <option key={bot.id} value={bot.id}>
                    {bot.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Website URL</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="input-field"
                placeholder="https://example.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                The chatbot will scrape and learn from this website
              </p>
            </div>

            <button
              type="submit"
              disabled={training}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {training ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Training...
                </span>
              ) : (
                'Start Training'
              )}
            </button>

            {trainingStatus?.last_trained_at && (
              <button
                type="button"
                onClick={handleRetrain}
                disabled={training}
                className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Retrain Chatbot
              </button>
            )}
          </form>
        </div>

        {/* Training Status */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Training Status</h2>
          
          {trainingStatus && trainingStatus !== 'not_started' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  trainingStatus.status === 'completed' ? 'bg-green-100 text-green-800' :
                  trainingStatus.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  trainingStatus.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                  trainingStatus.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {trainingStatus.status || 'Unknown'}
                </span>
              </div>

              {trainingStatus.started_at && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Started</span>
                  <span className="text-sm text-gray-600">
                    {new Date(trainingStatus.started_at).toLocaleString()}
                  </span>
                </div>
              )}

              {trainingStatus.completed_at && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Completed</span>
                  <span className="text-sm text-gray-600">
                    {new Date(trainingStatus.completed_at).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Pages Processed</span>
                <span className="text-sm text-gray-600">
                  {trainingStatus.pages_processed || 0} / {trainingStatus.total_pages || 0}
                </span>
              </div>

              {trainingStatus.error_message && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-red-700">Error</span>
                  <p className="text-sm text-red-600 mt-1">
                    {trainingStatus.error_message}
                  </p>
                </div>
              )}

              {trainingStatus.status === 'completed' && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-green-800">Training completed successfully!</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Your chatbot is now trained and ready to answer questions.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 font-medium">No training history yet</p>
              <p className="text-sm mt-1">Enter a website URL and click "Start Training" to begin</p>
            </div>
          )}
        </div>
      </div>

      {/* Training Instructions */}
      <div className="card mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">How Training Works</h2>
        <div className="space-y-3 text-gray-600">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">Website Scraping</p>
              <p className="text-sm">We'll crawl your website and extract all text content from accessible pages.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">Text Processing</p>
              <p className="text-sm">Content is cleaned, chunked, and converted into embeddings for AI understanding.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">AI Training</p>
              <p className="text-sm">Your chatbot learns from the content and can answer questions based on it.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Train;
