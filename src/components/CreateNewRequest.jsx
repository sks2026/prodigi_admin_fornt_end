import React, { useState } from 'react';
import './customerTheme.css';
import './createNewRequest.css';

const REQUEST_TYPES = [
  { value: '', label: 'Select' },
  { value: 'modify mobile number', label: 'Modify Mobile Number' },
  { value: 'reset password', label: 'Reset Password' },
  { value: 'organiser update detail', label: 'Organiser Update Detail' }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const CreateNewRequest = ({ onNavigate, customerData }) => {
  const [formData, setFormData] = useState({
    request: '',
    description: '',
    priority: 'medium',
    oldMobile: '',
    newMobile: '',
    oldPassword: '',
    newPassword: '',
    // Organiser detail fields
    oldOrganiserName: '',
    newOrganiserName: '',
    oldOrganiserEmail: '',
    newOrganiserEmail: '',
    oldOrganiserMobile: '',
    newOrganiserMobile: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.request || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate mobile numbers if request type is modify mobile number
    if (formData.request === 'modify mobile number') {
      if (!formData.oldMobile.trim() || !formData.newMobile.trim()) {
        alert('Please provide both old and new mobile numbers for mobile number modification');
        return;
      }
      // Basic mobile number validation (10 digits)
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(formData.oldMobile) || !mobileRegex.test(formData.newMobile)) {
        alert('Please enter valid 10-digit mobile numbers');
        return;
      }
    }

    // Validate passwords if request type is reset password
    if (formData.request === 'reset password') {
      if (!formData.oldPassword.trim() || !formData.newPassword.trim()) {
        alert('Please provide both old and new passwords for password reset');
        return;
      }
      // Basic password validation (minimum 6 characters)
      if (formData.newPassword.length < 6) {
        alert('New password must be at least 6 characters long');
        return;
      }
      // Check if old and new passwords are different
      if (formData.oldPassword === formData.newPassword) {
        alert('New password must be different from the old password');
        return;
      }
    }

    // Validate organiser details if request type is organiser update detail
    if (formData.request === 'organiser update detail') {
      // Check if at least one field is being updated
      const hasNameUpdate = formData.oldOrganiserName.trim() && formData.newOrganiserName.trim();
      const hasEmailUpdate = formData.oldOrganiserEmail.trim() && formData.newOrganiserEmail.trim();
      const hasMobileUpdate = formData.oldOrganiserMobile.trim() && formData.newOrganiserMobile.trim();
      
      if (!hasNameUpdate && !hasEmailUpdate && !hasMobileUpdate) {
        alert('Please provide at least one organiser detail to update (name, email, or mobile)');
        return;
      }
      
      // Validate name fields if provided
      if (hasNameUpdate) {
        // Name validation can be added here if needed
      }
      
      // Validate email fields if provided
      if (hasEmailUpdate) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.oldOrganiserEmail) || !emailRegex.test(formData.newOrganiserEmail)) {
          alert('Please enter valid email addresses');
          return;
        }
      }
      
      // Validate mobile fields if provided
      if (hasMobileUpdate) {
        const mobileRegex = /^\d{10}$/;
        if (!mobileRegex.test(formData.oldOrganiserMobile) || !mobileRegex.test(formData.newOrganiserMobile)) {
          alert('Please enter valid 10-digit mobile numbers');
          return;
        }
      }
    }

    // Check if customerData and ID exist
    const customerId = customerData?.organisationId || customerData?._id;
    if (!customerId) {
      alert('Customer data not found. Please go back and verify customer first.');
      return;
    }

    // Note: All request types now go through the API call
    // The mobile number fields are conditionally shown for modify mobile number requests

    // Make API call for all request types
    try {
      setIsLoading(true);
      
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        "request": formData.request,
        "description": formData.description,
        "priority": formData.priority,
        "oldMobileNumber": formData.oldMobile,
        "newMobileNumber": formData.newMobile,
        "oldPassword": formData.oldPassword,
        "newPassword": formData.newPassword,
        "oldOrganiserName": formData.oldOrganiserName,
        "newOrganiserName": formData.newOrganiserName,
        "oldOrganiserEmail": formData.oldOrganiserEmail,
        "newOrganiserEmail": formData.newOrganiserEmail,
        "oldOrganiserMobileNumber": formData.oldOrganiserMobile,
        "newOrganiserMobileNumber": formData.newOrganiserMobile
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };

      const response = await fetch(`http://localhost:3001/api/customer-requests/create/${customerId}`, requestOptions);
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Reset form
        setFormData({
          request: '',
          description: '',
          priority: 'medium',
          oldMobile: '',
          newMobile: '',
          oldPassword: '',
          newPassword: '',
          oldOrganiserName: '',
          newOrganiserName: '',
          oldOrganiserEmail: '',
          newOrganiserEmail: '',
          oldOrganiserMobile: '',
          newOrganiserMobile: ''
        });
        // Navigate to request generated page with reference ID and customer data
        if (onNavigate) {
          onNavigate('request-generated', {
            referenceId: result.data.referenceId,
            customerId: customerId,
            customerData: customerData
          });
        }
      } else {
        alert(result.message || 'Failed to create request. Please try again.');
      }
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Error creating request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page create-new-request">
      <h2>Create New Request</h2>

      {customerData && (
        <div style={{ background: '#f0f8ff', padding: '10px', marginBottom: '20px', borderRadius: '5px', border: '1px solid #007bff' }}>
          <strong>Customer ID:</strong> {customerData.organisationId || customerData._id || 'Not available'}
        </div>
      )}
      <form onSubmit={handleSubmit} className="form">
        <label>
          <span>Request Type *</span>
          <select 
            name="request"
            value={formData.request} 
            onChange={handleInputChange}
            required
          >
            {REQUEST_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Description *</span>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Please describe your request in detail..."
            rows={4}
            required
          />
        </label>

        <label>
          <span>Priority</span>
          <select 
            name="priority"
            value={formData.priority} 
            onChange={handleInputChange}
          >
            {PRIORITY_LEVELS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </label>

        {/* Mobile number fields - only show for modify mobile number request */}
        {formData.request === 'modify mobile number' && (
          <>
            <label>
              <span>Old Mobile Number *</span>
              <input
                type="tel"
                name="oldMobile"
                value={formData.oldMobile}
                onChange={handleInputChange}
                placeholder="Enter current mobile number"
                maxLength="10"
                required
              />
            </label>

            <label>
              <span>New Mobile Number *</span>
              <input
                type="tel"
                name="newMobile"
                value={formData.newMobile}
                onChange={handleInputChange}
                placeholder="Enter new mobile number"
                maxLength="10"
                required
              />
            </label>
          </>
        )}

        {/* Password fields - only show for reset password request */}
        {formData.request === 'reset password' && (
          <>
            <label>
              <span>Old Password *</span>
              <input
                type="password"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleInputChange}
                placeholder="Enter current password"
                required
              />
            </label>

            <label>
              <span>New Password *</span>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password (minimum 6 characters)"
                minLength="6"
                required
              />
            </label>
          </>
        )}

        {/* Organiser detail fields - only show for organiser update detail request */}
        {formData.request === 'organiser update detail' && (
          <>
            <div style={{ marginBottom: '20px', padding: '10px', background: '#f8f9fa', borderRadius: '5px', border: '1px solid #dee2e6' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6c757d' }}>
                <strong>Note:</strong> Fill in only the fields you want to update. At least one field (name, email, or mobile) must be provided.
              </p>
            </div>

            <label>
              <span>Old Organiser Name</span>
              <input
                type="text"
                name="oldOrganiserName"
                value={formData.oldOrganiserName}
                onChange={handleInputChange}
                placeholder="Enter current organiser name (optional)"
              />
            </label>

            <label>
              <span>New Organiser Name</span>
              <input
                type="text"
                name="newOrganiserName"
                value={formData.newOrganiserName}
                onChange={handleInputChange}
                placeholder="Enter new organiser name (optional)"
              />
            </label>

            <label>
              <span>Old Organiser Email</span>
              <input
                type="email"
                name="oldOrganiserEmail"
                value={formData.oldOrganiserEmail}
                onChange={handleInputChange}
                placeholder="Enter current organiser email (optional)"
              />
            </label>

            <label>
              <span>New Organiser Email</span>
              <input
                type="email"
                name="newOrganiserEmail"
                value={formData.newOrganiserEmail}
                onChange={handleInputChange}
                placeholder="Enter new organiser email (optional)"
              />
            </label>

            <label>
              <span>Old Organiser Mobile</span>
              <input
                type="tel"
                name="oldOrganiserMobile"
                value={formData.oldOrganiserMobile}
                onChange={handleInputChange}
                placeholder="Enter current organiser mobile number (optional)"
                maxLength="10"
              />
            </label>

            <label>
              <span>New Organiser Mobile</span>
              <input
                type="tel"
                name="newOrganiserMobile"
                value={formData.newOrganiserMobile}
                onChange={handleInputChange}
                placeholder="Enter new organiser mobile number (optional)"
                maxLength="10"
              />
            </label>
          </>
        )}

        <div className="actions">
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Request...' : 'Create Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNewRequest;


