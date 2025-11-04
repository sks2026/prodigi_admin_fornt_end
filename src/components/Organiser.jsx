import React, { useEffect, useState } from "react";
import { FiPlus, FiX, FiUser, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import "./Organiser.css";

const Organiser = () => {
  const [organiser, setOrganiser] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "Administrator",
    email: "",
    mobileNumber: "",
    organiserName: "",
    organiserAddress: {
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      cityDistrict: "",
      pincode: "",
      country: "India"
    },
    organiserMobileNumber: "",
    organiserEmail: "",
    organiserWebsite: "",
    directorName: "",
    directorMobileNumber: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Activate
  const makeActive = async (id) => {
    try {
      const apiUrl = `https://api.prodigiedu.com/api/organisations/active/${id}`;
      await fetch(apiUrl, { method: "GET", headers: { "Content-Type": "application/json" } });

      setOrganiser((prev) =>
        prev.map((user) => (user._id === id ? { ...user, status: true } : user))
      );
    } catch (error) {
      console.log("Error activating organiser:", error);
    }
  };

  // ❌ Deactivate
  const makeDeactive = async (id) => {
    try {
      const apiUrl = `https://api.prodigiedu.com/api/organisations/deactive/${id}`;
      await fetch(apiUrl, { method: "GET", headers: { "Content-Type": "application/json" } });

      setOrganiser((prev) =>
        prev.map((user) => (user._id === id ? { ...user, status: false } : user))
      );
    } catch (error) {
      console.log("Error deactivating organiser:", error);
    }
  };

  // ✅ Fetch organisers
  const getOrganiser = async () => {
    try {
      const res = await fetch("https://api.prodigiedu.com/api/organisations/");
      const result = await res.json();
      setOrganiser(result.data);
    } catch (error) {
      console.log("Error fetching organisers:", error);
    }
  };

  // Add new organiser
  const addOrganiser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGMwMGIwYmNjOGU0YmMxNmYwYTM4ZDAiLCJlbWFpbCI6InVzZXIxQGdtYWlsLmNvbSIsIm5hbWUiOiJDIEphY2hpdHJhIiwiaWF0IjoxNzU3NDE2NDAzLCJleHAiOjE3NTgwMjEyMDN9.kKXf3kMBDQ_emsekhsGSKpE5VhnZ4FKwk0Ep39uphxY");

      const res = await fetch("https://api.prodigiedu.com/api/organisations/admin/create", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        const result = await res.json();
        setOrganiser(prev => [...prev, result.data]);
        setIsModalOpen(false);
        setFormData({
          name: "",
          role: "Administrator",
          email: "",
          mobileNumber: "",
          organiserName: "",
          organiserAddress: {
            addressLine1: "",
            addressLine2: "",
            addressLine3: "",
            cityDistrict: "",
            pincode: "",
            country: "India"
          },
          organiserMobileNumber: "",
          organiserEmail: "",
          organiserWebsite: "",
          directorName: "",
          directorMobileNumber: "",
          password: ""
        });
      }
    } catch (error) {
      console.log("Error adding organiser:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('organiserAddress.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        organiserAddress: {
          ...prev.organiserAddress,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const activeCount = organiser.filter(org => org.status).length;
  const inactiveCount = organiser.filter(org => !org.status).length;

  useEffect(() => {
    getOrganiser();
  }, []);

  return (
    <div className="organiser-page">
      {/* Header */}
      <div className="organiser-header">
        <h1 className="organiser-title">Organisers Management</h1>
        <button 
          className="add-organiser-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <FiPlus />
          Add Organiser
        </button>
      </div>

      {/* Stats Cards */}
      <div className="organiser-stats">
        <div className="stat-card">
          <h3>{organiser.length}</h3>
          <p>Total Organisers</p>
        </div>
        <div className="stat-card">
          <h3>{activeCount}</h3>
          <p>Active Organisers</p>
        </div>
        <div className="stat-card">
          <h3>{inactiveCount}</h3>
          <p>Inactive Organisers</p>
        </div>
      </div>

      {/* Table */}
      <div className="organiser-table-container">
        <table className="organiser-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Organiser</th>
              <th>Email</th>
              <th>Organization</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {organiser?.length > 0 ? (
              organiser.map((user, index) => (
                <tr key={user._id}>
                  <td>
                    <span className="id-badge">{index + 1}</span>
                  </td>
                  <td>
                    <div className="name-container">
                      <div className="avatar">
                        {getInitials(user.name || 'O')}
                      </div>
                      <div>
                        <div className="name">{user.name || 'N/A'}</div>
                        {user.phone && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <a href={`mailto:${user.email}`} className="email">
                      {user.email || 'N/A'}
                    </a>
                  </td>
                  <td>{user.organization || 'N/A'}</td>
                  <td>
                    {user.status ? (
                      <button
                        onClick={() => makeDeactive(user._id)}
                        className="status-btn active"
                      >
                        Active
                      </button>
                    ) : (
                      <button
                        onClick={() => makeActive(user._id)}
                        className="status-btn inactive"
                      >
                        Inactive
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  <div className="no-data-icon">👥</div>
                  <h3>No organisers found</h3>
                  <p>Add your first organiser to get started</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Organiser Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Organiser</h2>
              <button 
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={addOrganiser}>
              {/* Personal Information */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '1.1rem', fontWeight: '600' }}>
                  Personal Information
                </h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <FiUser style={{ marginRight: '8px' }} />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <FiMail style={{ marginRight: '8px' }} />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <FiPhone style={{ marginRight: '8px' }} />
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter mobile number"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter password"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Organization Information */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '1.1rem', fontWeight: '600' }}>
                  Organization Information
                </h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <FiMapPin style={{ marginRight: '8px' }} />
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      name="organiserName"
                      value={formData.organiserName}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter organization name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Organization Website</label>
                    <input
                      type="url"
                      name="organiserWebsite"
                      value={formData.organiserWebsite}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter website URL"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <FiMail style={{ marginRight: '8px' }} />
                      Organization Email *
                    </label>
                    <input
                      type="email"
                      name="organiserEmail"
                      value={formData.organiserEmail}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter organization email"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <FiPhone style={{ marginRight: '8px' }} />
                      Organization Mobile *
                    </label>
                    <input
                      type="tel"
                      name="organiserMobileNumber"
                      value={formData.organiserMobileNumber}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter organization mobile number"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '1.1rem', fontWeight: '600' }}>
                  Address Information
                </h3>
                
                <div className="form-group">
                  <label className="form-label">Address Line 1 *</label>
                  <input
                    type="text"
                    name="organiserAddress.addressLine1"
                    value={formData.organiserAddress.addressLine1}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter address line 1"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Address Line 2</label>
                    <input
                      type="text"
                      name="organiserAddress.addressLine2"
                      value={formData.organiserAddress.addressLine2}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter address line 2"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Address Line 3</label>
                    <input
                      type="text"
                      name="organiserAddress.addressLine3"
                      value={formData.organiserAddress.addressLine3}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter address line 3"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City/District *</label>
                    <input
                      type="text"
                      name="organiserAddress.cityDistrict"
                      value={formData.organiserAddress.cityDistrict}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter city/district"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pincode *</label>
                    <input
                      type="text"
                      name="organiserAddress.pincode"
                      value={formData.organiserAddress.pincode}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter pincode"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    name="organiserAddress.country"
                    value={formData.organiserAddress.country}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter country"
                  />
                </div>
              </div>

              {/* Director Information */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '1.1rem', fontWeight: '600' }}>
                  Director Information
                </h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Director Name</label>
                    <input
                      type="text"
                      name="directorName"
                      value={formData.directorName}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter director name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Director Mobile Number</label>
                    <input
                      type="tel"
                      name="directorMobileNumber"
                      value={formData.directorMobileNumber}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter director mobile number"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Organiser'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organiser;
