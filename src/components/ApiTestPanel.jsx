import React, { useState } from 'react';
import { API_BASE_URL } from '../config/apiConfig';

const ApiTestPanel = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name, url, method = 'GET', body = null) => {
    setLoading(true);
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      if (body) options.body = JSON.stringify(body);

      const response = await fetch(url, options);
      const data = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        [name]: {
          status: response.status,
          success: response.ok,
          data: data,
          error: null
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [name]: {
          status: 'ERROR',
          success: false,
          data: null,
          error: error.message
        }
      }));
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', margin: '20px' }}>
      <h2>API Test Panel</h2>
      <p><strong>API Base URL:</strong> {API_BASE_URL}</p>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
        <button 
          onClick={() => testEndpoint('students', `${API_BASE_URL}/api/users/students`)}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
          disabled={loading}
        >
          Test GET Students
        </button>
        
        <button 
          onClick={() => testEndpoint('organisers', `${API_BASE_URL}/api/organisations/`)}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
          disabled={loading}
        >
          Test GET Organisers
        </button>

        <button 
          onClick={() => testEndpoint('root', `${API_BASE_URL}/`)}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
          disabled={loading}
        >
          Test Root Endpoint
        </button>
      </div>

      {loading && <p style={{ marginTop: '20px' }}>Testing...</p>}

      <div style={{ marginTop: '30px' }}>
        {Object.entries(testResults).map(([name, result]) => (
          <div key={name} style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            backgroundColor: result.success ? '#d4edda' : '#f8d7da',
            borderRadius: '5px',
            border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            <h3>{name}</h3>
            <p><strong>Status:</strong> {result.status}</p>
            <p><strong>Success:</strong> {result.success ? 'Yes' : 'No'}</p>
            {result.error && <p style={{ color: 'red' }}><strong>Error:</strong> {result.error}</p>}
            {result.data && (
              <details>
                <summary>Response Data</summary>
                <pre style={{ overflow: 'auto', maxHeight: '300px', fontSize: '12px' }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiTestPanel;
