import React, { useState, useEffect } from 'react';
import './customerTheme.css';
import './customerOverview.css';

const CustomerOverview = ({ customer, onNavigate }) => {
  // State for requests data
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Default customer data if none provided
  const defaultCustomer = {
    name: 'Lokesh Khandelwal',
    type: 'Student',
    createdOn: '1st Sep 2025',
    status: 'Active',
    school: 'Oberoi International School',
    grade: '6th',
    board: 'CBSE',
    location: 'Kota'
  };

  // Use provided customer data or default
  const customerInfo = customer || defaultCustomer;

  // Fetch customer requests
  const fetchCustomerRequests = async () => {
    const customerId = customerInfo?.organisationId || customerInfo?.userId || customerInfo?._id;
    
    console.log('Customer Info:', customerInfo);
    console.log('Customer ID:', customerId);
    
    if (!customerId) {
      console.warn('No customer ID found');
      setError('No customer ID found. Please verify customer first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestOptions = {
        method: "GET",
        redirect: "follow"
      };

      const apiUrl = `https://api.prodigiedu.com/api/customer-requests/my-requests/${customerId}`;
      console.log('Fetching from URL:', apiUrl);

      const response = await fetch(apiUrl, requestOptions);
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.success && result.data && result.data.requests) {
        console.log('Setting requests:', result.data.requests);
        setRequests(result.data.requests);
      } else {
        console.log('API response structure issue:', result);
        setError(result.message || 'Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      
      // More specific error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Cannot connect to server. Please check if backend is running on port 3001.');
      } else if (error.message.includes('404')) {
        setError('Customer not found. Please verify the customer ID.');
      } else if (error.message.includes('500')) {
        setError('Server error. Please try again later.');
      } else {
        setError(`Failed to fetch requests: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch requests when component mounts or customer changes
  useEffect(() => {
    fetchCustomerRequests();
  }, [customerInfo?.organisationId, customerInfo?.userId, customerInfo?._id]);

  const handleCreateNewRequest = () => {
    if (onNavigate) {
      onNavigate('create-new-request', customerInfo);
    }
  };

  // Toggle request status
  const toggleRequestStatus = async (referenceId) => {
    const customerId = customerInfo?.organisationId || customerInfo?.userId || customerInfo?._id;
    
   
    
    if (!customerId) {
      alert('Customer ID not found');
      return;
    }

    if (!referenceId) {
      alert('Reference ID not found');
      return;
    }

    try {
      const apiUrl = `https://api.prodigiedu.com/api/customer-requests/${referenceId}/toggle-status/${customerId}`;
      console.log('API URL:', apiUrl);
      
      const requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        }
      };

      console.log('Making API call...');
      const response = await fetch(apiUrl, requestOptions);
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.log('Non-JSON Response:', textResponse);
        throw new Error(`Server returned ${response.status}: ${textResponse.substring(0, 100)}...`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (response.ok && result.success) {
        // Refresh the requests list
        fetchCustomerRequests();
        // alert(`Request status changed to ${result.data.status}`);
      } else {
        alert(`Error: ${result.message || 'Failed to toggle request status'}`);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="page customer-overview">
      <h2>Customer Overview</h2>


      <section className="customer-summary">
        <div><strong>Name:</strong> {customerInfo.name}</div>
        <div><strong>Account Type:</strong> {customerInfo.userType === 'user' ? 'User' : 'Organisation'}</div>
        <div><strong>Email:</strong> {customerInfo.email}</div>
        <div><strong>Mobile:</strong> {customerInfo.mobile}</div>
        <div><strong>Account Status:</strong> {customerInfo.status}</div>
        <div><strong>Account Created On:</strong> {customerInfo.createdAt ? new Date(customerInfo.createdAt).toLocaleDateString() : 'N/A'}</div>
        
        {/* User-specific details */}
        {customerInfo.userType === 'user' && customerInfo.additionalDetails && (
          <>
            <div><strong>School:</strong> {customerInfo.additionalDetails.schoolName || 'N/A'}</div>
            <div><strong>Grade:</strong> {customerInfo.additionalDetails.grade || 'N/A'}</div>
            <div><strong>Board:</strong> {customerInfo.additionalDetails.board || 'N/A'}</div>
            <div><strong>Verified:</strong> {customerInfo.isVerified ? 'Yes' : 'No'}</div>
          </>
        )}
        
        {/* Organisation-specific details */}
        {customerInfo.userType === 'organisation' && (
          <>
            <div><strong>Organiser Name:</strong> {customerInfo.organiserName || 'N/A'}</div>
            <div><strong>Organiser Email:</strong> {customerInfo.organiserEmail || 'N/A'}</div>
            <div><strong>Organiser Mobile:</strong> {customerInfo.organiserMobileNumber || 'N/A'}</div>
            <div><strong>Director Name:</strong> {customerInfo.directorName || 'N/A'}</div>
            <div><strong>Website:</strong> {customerInfo.organiserWebsite || 'N/A'}</div>
            <div><strong>About:</strong> {customerInfo.about || 'N/A'}</div>
            {customerInfo.organiserAddress && (
              <div><strong>Address:</strong> {[
                customerInfo.organiserAddress.addressLine1,
                customerInfo.organiserAddress.cityDistrict,
                customerInfo.organiserAddress.pincode,
                customerInfo.organiserAddress.country
              ].filter(Boolean).join(', ')}</div>
            )}
            <div><strong>Mobile Verified:</strong> {customerInfo.mobileOtpVerificationStatus ? 'Yes' : 'No'}</div>
            <div><strong>Email Verified:</strong> {customerInfo.emailOtpVerificationStatus ? 'Yes' : 'No'}</div>
          </>
        )}
      </section>

      <h3>Customer Requests</h3>
      <div className="table-wrap">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Loading requests...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
            {error}
            <button 
              onClick={fetchCustomerRequests} 
              style={{ marginLeft: '10px', padding: '5px 10px' }}
            >
              Retry
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            No requests found for this customer.
            <br />
            <small style={{ color: '#666' }}>
              Customer ID: {customerInfo?.organisationId || customerInfo?.userId || customerInfo?._id || 'Not available'}
            </small>
          </div>
        ) : (
          <table className="requests">
            <thead>
              <tr>
                <th>Reference ID</th>
                <th>Customer Name</th>
                <th>Request Type</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td>{request.referenceId || request._id}</td>
                  <td>{request.customerName || customerInfo.name || 'N/A'}</td>
                  <td>{request.request}</td>
                  <td>{request.description}</td>
                  <td>
                    <span className={`priority ${request.priority}`}>
                      {request.priority?.charAt(0).toUpperCase() + request.priority?.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div 
                      className={`status clickable-status ${request.status?.replace(' ', '-').toLowerCase()}`}
                      onClick={() => toggleRequestStatus(request.referenceId || request._id)}
                      title={`Click to change status to ${request.status === 'open' ? 'closed' : 'open'}`}
                    >
                      {request.status}
                    </div>
                  </td>
                  <td>
                    {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="actions">
        <button type="button" onClick={handleCreateNewRequest}>Create New Request</button>
      </div>
    </div>
  );
};

export default CustomerOverview;


