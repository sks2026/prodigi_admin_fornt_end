import React, { useState } from 'react';
import './customerTheme.css';
import './createNewRequest.css';

const ModifyMobileRequest = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    oldMobileNumber: '',
    newMobileNumber: '',
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.oldMobileNumber.trim()) {
      setError('Old mobile number is required');
      return false;
    }
    if (!formData.newMobileNumber.trim()) {
      setError('New mobile number is required');
      return false;
    }
    if (formData.oldMobileNumber === formData.newMobileNumber) {
      setError('Old and new mobile numbers cannot be the same');
      return false;
    }
    if (!formData.comment.trim()) {
      setError('Comment is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // First, verify the user with old mobile number
      const verifyResponse = await fetch('http://localhost:3001/api/users/verify-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userType: 'user',
          verificationMethod: 'mobile',
          mobile: formData.oldMobileNumber
        })
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        setError('User verification failed. Please check your old mobile number.');
        setLoading(false);
        return;
      }

      // Create the request
      const requestResponse = await fetch(`http://localhost:3001/api/customer-requests/create/${verifyData.data.userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request: 'modify mobile number',
          description: `Old Mobile: ${formData.oldMobileNumber}, New Mobile: ${formData.newMobileNumber}. Comment: ${formData.comment}`,
          priority: 'high'
        })
      });

      const requestData = await requestResponse.json();

      if (requestData.success) {
        setSuccess(`Request created successfully! Reference ID: ${requestData.data.referenceId}`);
        setFormData({
          oldMobileNumber: '',
          newMobileNumber: '',
          comment: ''
        });
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(requestData.data);
        }
      } else {
        setError(requestData.message || 'Failed to create request');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error creating request:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page modify-mobile-request">
      <div className="header">
        <button type="button" className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Modify Mobile Number Request</h2>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="oldMobileNumber">
            <span>Old Mobile Number *</span>
            <input
              type="tel"
              id="oldMobileNumber"
              name="oldMobileNumber"
              value={formData.oldMobileNumber}
              onChange={handleInputChange}
              placeholder="Enter your current mobile number"
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="newMobileNumber">
            <span>New Mobile Number *</span>
            <input
              type="tel"
              id="newMobileNumber"
              name="newMobileNumber"
              value={formData.newMobileNumber}
              onChange={handleInputChange}
              placeholder="Enter your new mobile number"
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="comment">
            <span>Reason/Comment *</span>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              placeholder="Please provide a reason for changing your mobile number"
              rows="4"
              required
            />
          </label>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <div className="actions">
          <button type="button" onClick={onBack} disabled={loading}>
            Cancel
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Request...' : 'Create Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModifyMobileRequest;
