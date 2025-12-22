import React, { useEffect, useState } from "react";
import { FiPlus, FiX, FiUser, FiMail, FiPhone, FiMapPin, FiBook } from "react-icons/fi";
import { API_BASE_URL } from "../config/apiConfig";
import "./StudentManagement.css";

const StudentManagement = ({ isModalOpen, setIsModalOpen }) => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    dateOfBirth: "",
    grade: "",
    school: "",
    address: {
      addressLine1: "",
      addressLine2: "",
      cityDistrict: "",
      pincode: "",
      country: "India"
    },
    parentName: "",
    parentMobileNumber: "",
    parentEmail: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Fetch students
  const getStudents = async () => {
    try {
      console.log("Fetching students from:", `${API_BASE_URL}/api/users/students`);
      const res = await fetch(`${API_BASE_URL}/api/users/students`);
      console.log("Response status:", res.status);
      const result = await res.json();
      console.log("API Response:", result);
      console.log("Students data:", result.data);
      console.log("Number of students:", result.data?.length);
      setStudents(result.data || []);
    } catch (error) {
      console.log("Error fetching students:", error);
    }
  };

  // Add new student
  const addStudent = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      console.log("Creating student with data:", formData);
      const res = await fetch(`${API_BASE_URL}/api/users/students/create`, {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        const result = await res.json();
        setStudents(prev => [...prev, result.data]);
        setIsModalOpen(false);
        setFormData({
          name: "",
          email: "",
          mobileNumber: "",
          dateOfBirth: "",
          grade: "",
          school: "",
          address: {
            addressLine1: "",
            addressLine2: "",
            cityDistrict: "",
            pincode: "",
            country: "India"
          },
          parentName: "",
          parentMobileNumber: "",
          parentEmail: ""
        });
      }
    } catch (error) {
      console.log("Error adding student:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
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

  useEffect(() => {
    getStudents();
  }, []);

  return (
    <div className="student-management-page">
      {/* Stats Cards */}
      <div className="student-stats">
        <div className="stat-card">
          <h3>{students.length}</h3>
          <p>Total Students</p>
        </div>
      </div>

      {/* Table */}
      <div className="student-table-container">
        <table className="student-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Email</th>
              <th>Grade</th>
              <th>School</th>
            </tr>
          </thead>
          <tbody>
            {students?.length > 0 ? (
              students.map((student, index) => (
                <tr key={student._id}>
                  <td>
                    <span className="id-badge">{index + 1}</span>
                  </td>
                  <td>
                    <div className="name-container">
                      <div className="avatar">
                        {getInitials(student.name || 'S')}
                      </div>
                      <div>
                        <div className="name">{student.name || 'N/A'}</div>
                        {student.mobileNumber && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {student.mobileNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <a href={`mailto:${student.email}`} className="email">
                      {student.email || 'N/A'}
                    </a>
                  </td>
                  <td>{student.grade || 'N/A'}</td>
                  <td>{student.school || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  <div className="no-data-icon">👨‍🎓</div>
                  <h3>No students found</h3>
                  <p>Add your first student to get started</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Student</h2>
              <button 
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={addStudent}>
              {/* Student Information */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '1.1rem', fontWeight: '600' }}>
                  Student Information
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
                    <label className="form-label">Date of Birth *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <FiBook style={{ marginRight: '8px' }} />
                      Grade/Class *
                    </label>
                    <input
                      type="text"
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter grade/class"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">School Name *</label>
                    <input
                      type="text"
                      name="school"
                      value={formData.school}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter school name"
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
                    name="address.addressLine1"
                    value={formData.address.addressLine1}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter address line 1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Address Line 2</label>
                  <input
                    type="text"
                    name="address.addressLine2"
                    value={formData.address.addressLine2}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter address line 2"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City/District *</label>
                    <input
                      type="text"
                      name="address.cityDistrict"
                      value={formData.address.cityDistrict}
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
                      name="address.pincode"
                      value={formData.address.pincode}
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
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter country"
                  />
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '1.1rem', fontWeight: '600' }}>
                  Parent/Guardian Information
                </h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Parent/Guardian Name *</label>
                    <input
                      type="text"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter parent/guardian name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Parent Mobile Number *</label>
                    <input
                      type="tel"
                      name="parentMobileNumber"
                      value={formData.parentMobileNumber}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter parent mobile number"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Parent Email</label>
                  <input
                    type="email"
                    name="parentEmail"
                    value={formData.parentEmail}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter parent email address"
                  />
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
                  {isLoading ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
