import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConnectionTest = () => {
  const [status, setStatus] = useState('testing');
  const [results, setResults] = useState([]);
  const [backendUrl, setBackendUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:3000');

  const addResult = (test, success, message, data = null) => {
    setResults(prev => [...prev, { test, success, message, data, timestamp: new Date().toISOString() }]);
  };

  const runTests = async () => {
    setStatus('testing');
    setResults([]);

    // Test 1: Check backend URL from .env
    addResult(
      'Environment Variable',
      !!import.meta.env.VITE_API_URL,
      import.meta.env.VITE_API_URL 
        ? `Using: ${import.meta.env.VITE_API_URL}` 
        : 'No VITE_API_URL found, using default: http://localhost:3000'
    );

    // Test 2: Health check
    try {
      const healthRes = await axios.get(`${backendUrl}/health`, { timeout: 5000 });
      addResult('Health Check', true, 'Backend is responding', healthRes.data);
    } catch (error) {
      addResult('Health Check', false, error.message);
    }

    // Test 3: Get all chatbots
    try {
      const chatbotsRes = await axios.get(`${backendUrl}/admin/chatbots`, { timeout: 5000 });
      addResult('Get Chatbots', true, `Found ${chatbotsRes.data.length} chatbots`, chatbotsRes.data);
    } catch (error) {
      addResult('Get Chatbots', false, error.message);
    }

    // Test 4: Database connection (through backend)
    try {
      const healthRes = await axios.get(`${backendUrl}/health`, { timeout: 5000 });
      const dbConnected = healthRes.data.status === 'ok';
      addResult('Database Status', dbConnected, dbConnected ? 'Connected' : 'Not connected');
    } catch (error) {
      addResult('Database Status', false, 'Cannot determine');
    }

    setStatus('complete');
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Connection Test</h1>
        <p className="text-gray-600 mt-2">Testing backend and database connectivity</p>
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Backend URL</h2>
          <button
            onClick={runTests}
            className="btn-primary"
            disabled={status === 'testing'}
          >
            {status === 'testing' ? 'Testing...' : 'Re-run Tests'}
          </button>
        </div>
        <div className="bg-gray-100 p-3 rounded font-mono text-sm">
          {backendUrl}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="border-l-4 p-4 rounded" style={{
              borderColor: result.success ? '#10b981' : '#ef4444',
              backgroundColor: result.success ? '#f0fdf4' : '#fef2f2'
            }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.success ? '✓' : '✗'}
                    </span>
                    <span className="font-semibold text-gray-900">{result.test}</span>
                  </div>
                  <p className={`mt-1 text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    {result.message}
                  </p>
                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-900">
                        View Details
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-800 text-gray-100 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}

          {results.length === 0 && status === 'testing' && (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              Running tests...
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Troubleshooting Tips:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Make sure the backend server is running: <code className="bg-blue-100 px-1 rounded">npm start</code></li>
          <li>Check that your <code className="bg-blue-100 px-1 rounded">.env</code> file exists in <code className="bg-blue-100 px-1 rounded">front-end/chatbot-dashboard/</code></li>
          <li>Verify the backend is on port 3002 (not 3000)</li>
          <li>Restart the frontend dev server after creating/modifying .env</li>
          <li>Check browser console (F12) for detailed error messages</li>
        </ul>
      </div>
    </div>
  );
};

export default ConnectionTest;
