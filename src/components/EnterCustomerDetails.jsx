import React, { useState } from 'react';
import './customerTheme.css';
import './enterCustomerDetails.css';

const EnterCustomerDetails = ({ onNavigate }) => {
  const [userType, setUserType] = useState('');
  const [method, setMethod] = useState('mobile');
  const [mobile, setMobile] = useState('');
  const [verifiedName, setVerifiedName] = useState('');
  const [customerData, setCustomerData] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!userType || !method || !mobile.trim()) {
      alert('Please fill in all fields');
      return;
    }

    // Validate based on verification method
    if (method === 'mobile') {
      if (mobile.trim().length < 10) {
        alert('Please enter a valid mobile number (10 digits)');
        return;
      }
    } else if (method === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(mobile.trim())) {
        alert('Please enter a valid email address');
        return;
      }
    }

    try {
      // Call the API with JSON data
      const response = await fetch('https://api.prodigiedu.com/api/users/verify-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGU2MTU0Y2ExNjY4OTlkMjU5NmFiMjkiLCJlbWFpbCI6ImFtYW4zNjc3ODdAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwidXNlclR5cGUiOiJhZG1pbiIsImlhdCI6MTc1OTk5MDg5OSwiZXhwIjoxNzYwMDc3Mjk5fQ.WkYJawFkZTvQeoAX-LvTwlnxWXe0cUrC2CI6ovUHG4Y'
        },
        body: JSON.stringify({
          userType: userType.toLowerCase(),
          verificationMethod: method,
          mobile: mobile.trim()
        })
      });
      
      const result = await response.json();

      if (result.success) {
        setVerifiedName(result.data.name);
        setCustomerData(result.data); // Store the complete customer data
      } else {
        setVerifiedName('');
        setCustomerData(null);
        alert(result.message || 'User not found');
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      setVerifiedName('');
      alert('Error verifying user. Please try again.');
    }
  };

  const handleContinue = () => {
    if (onNavigate && customerData) {
      onNavigate('customer-overview', customerData);
    } else if (!customerData) {
      alert('Please verify a customer first');
    }
  };

  return (
    <div className="page enter-customer-details">
      <h2>Enter Customer Details</h2>
      <form className="grid" onSubmit={handleVerify}>
        <label>
          <span>User Type</span>
          <select value={userType} onChange={(e) => setUserType(e.target.value)}>
            <option value="">Select</option>
            <option value="user">user</option>
            <option value="organisation">organisation</option>
            
          </select>
        </label>

        <label>
          <span>Verification Method</span>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="mobile">Mobile</option>
            <option value="email">Email</option>
          </select>
        </label>

        <label>
          <span>{method === 'mobile' ? 'Mobile Number' : 'Email Address'}</span>
          <input
            type={method === 'mobile' ? 'tel' : 'email'}
            placeholder={method === 'mobile' ? 'Enter customer\'s mobile number' : 'Enter customer\'s email address'}
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </label>

        <div className="actions"><button type="submit">Verify</button><button type="button" onClick={handleContinue}>Continue</button></div>
      </form>

      {verifiedName && (
        <div className="notice success">The Account belongs to: {verifiedName}</div>
      )}
    </div>
  );
};

export default EnterCustomerDetails;


