import React from "react";
import { useEffect, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import "./schoolHome.css";
import { FaHome, FaBars, FaTimes, FaUser, FaCog, FaHistory, FaChartBar, FaSignOutAlt } from "react-icons/fa";
import { Modal, Button } from "antd";
// import { toast } from "react-toastify";

import headerlogos from "../images/logos2.svg";
import namelogo from "../images/logoprodigi.png";
import { FaUserCircle } from "react-icons/fa";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import settings from "../images/settings.png";
import AccountHistory from "../images/clock.png";
import LogOut from "../images/sign-out.png";
import Help from "../images/help.png";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL, API_ENDPOINTS } from "../config/apiConfig";

const Organisersheader = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isOrganiserRoute = location.pathname.startsWith('/organiser');

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const showLogoutModal = () => {
    setLogoutModalVisible(true);
    handleClose(); // Close the user menu
  };

  const hideLogoutModal = () => {
    setLogoutModalVisible(false);
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      const token = localStorage.getItem("token");

      // Call logout API
      const response = await fetch(`https://prodigiedu.com/api/organisations/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Clear localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user_Data");

        // Update state
        setIsLoggedIn(false);
        setUserData(null);

        // Hide modal
        hideLogoutModal();

        // Show success toast
        // toast.success("Logout successful! You have been signed out.");

        // Redirect to home page
        navigate("/organiser");

        console.log("Logout successful");
      } else {
        console.error("Logout failed");
        // toast.error("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if API call fails, clear localStorage and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("user_Data");
      setIsLoggedIn(false);
      setUserData(null);
      hideLogoutModal();
              // toast.success("Logged out successfully!");
      navigate("/");
    } finally {
      setLogoutLoading(false);
    }
  };

  // Handle Organiser link click
  const handleOrganiserClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault(); // Prevent navigation
              // toast.error("Please log in or register to access the Organiser Dashboard.");
      navigate("/organiser/login"); // Redirect to login page
    } else {
      closeMobileMenu(); // Close mobile menu if open
    }
  };

  // Function to get home route based on user type
  const getHomeRoute = () => {
    const studentToken = localStorage.getItem('student_token');
    const organiserToken = localStorage.getItem('token');
    const organiserData = localStorage.getItem('user_Data');
    
    if (studentToken) {
      return '/student/dashboard';
    } else if (organiserToken && organiserData) {
      return '/organiser/dashboard';
    }
    return '/';
  };

  useEffect(() => {
    const storedUserData = localStorage.getItem("user_Data");
    const token = localStorage.getItem("token");

    if (storedUserData && token) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(storedUserData)); // Parse and store user data
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <div>
      <header>
        <nav className="navbar" style={{padding: '0px 5vw', position: 'relative'}}>
          <div className="logo">
            <NavLink style={{ textDecoration: "none" }} to={getHomeRoute()}>
              <div className='pt-2' style={{ display: 'flex', alignItems: 'center', minHeight: '70px' }}>
                {/* <img src={headerlogos} alt="" style={{ height: '50px' }} /> */}
                <img src={namelogo} alt="" style={{ width: '270px', objectFit: 'cover', display: 'block' }} />
              </div>
            </NavLink>
          </div>

          {/* Mobile menu toggle */}
          {isOrganiserRoute && (
            <button
              className="mobile-menu-btn"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              onClick={toggleMobileMenu}
              style={{ background: 'none', border: 'none' }}
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          )}

          {/* Nav links (slides in on mobile) */}
          <div className={`nav-links ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
            {/* Organiser link always visible */}
            <NavLink
              to="/organiser/dashboard"
              className={({ isActive }) =>
                isActive && isLoggedIn ? "nav-link active" : "nav-link"
              }
              onClick={handleOrganiserClick} // Custom click handler
              style={{ textDecoration: 'none' }}
            >
              Organiser
            </NavLink>

            {isLoggedIn ? (
              <>
                <NavLink
                  to="/OrganiserProfile"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  onClick={closeMobileMenu}
                  style={{ textDecoration: 'none' }}
                >
                  Profile
                </NavLink>
                <div
                  className="avatar"
                  style={{ cursor: "pointer" }}
                  onClick={handleClick}
                  aria-label="User menu"
                >
                  <FaUserCircle />
                </div>
                <Menu
                  anchorEl={anchorEl}
                  id="account-menu"
                  open={open}
                  onClose={handleClose}
                  onClick={handleClose}
                  slotProps={{
                    paper: {
                      elevation: 0,
                      sx: {
                        overflow: "visible",
                        filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                        mt: 1.5,
                        "& .MuiAvatar-root": {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        "&::before": {
                          content: '""',
                          display: "block",
                          position: "absolute",
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: "background.paper",
                          transform: "translateY(-50%) rotate(45deg)",
                          zIndex: 0,
                        },
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem onClick={handleClose}>
                    <div className="flex flex-column justify-content-start align-items-start">
                      {userData?.name || "Admin Name"}
                      <p className="text-theme-color">
                        {userData?.school || "Oberoi International School"}
                      </p>
                    </div>
                  </MenuItem>
                  <MenuItem onClick={handleClose}>
                    <NavLink
                      to="/OrganiserPersonaolsettingpage"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <FaCog style={{ marginRight: '5px' }} />
                      Account Settings
                    </NavLink>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleClose}>
                    <NavLink
                      to="/BankAcount"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <FaHistory style={{ marginRight: '5px' }} />
                      Account History
                    </NavLink>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleClose}>
                    <NavLink
                      to="/organiser/dashboard"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <FaChartBar style={{ marginRight: '5px' }} />
                      Organiser Dashboard
                    </NavLink>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={showLogoutModal}>
                    <FaSignOutAlt style={{ marginRight: '5px' }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <a href="/organiser/login" className="login" onClick={closeMobileMenu} style={{ textDecoration: 'none' }}>
                  Login
                </a>
                <a href="/organiser/register" className="signup" onClick={closeMobileMenu} style={{ textDecoration: 'none' }}>
                  Register Organiser
                </a>
              </>
            )}
          </div>
          {/* Backdrop for mobile menu */}
          {isMobileMenuOpen && (
            <div
              onClick={closeMobileMenu}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.25)',
                zIndex: 998
              }}
            />
          )}
        </nav>
      </header>

      {/* Logout Confirmation Modal */}
      <Modal
        title="Confirm Logout"
        open={logoutModalVisible}
        onCancel={hideLogoutModal}
        footer={[
          <Button key="cancel" onClick={hideLogoutModal}>
            Cancel
          </Button>,
          <Button
            key="logout"
            type="primary"
            danger
            loading={logoutLoading}
            onClick={handleLogout}
          >
            {logoutLoading ? "Logging out..." : "Logout"}
          </Button>,
        ]}
        centered
      >
        <p>Are you sure you want to logout?</p>
        <p style={{ color: '#666', fontSize: '14px' }}>
          You will be signed out of your account and redirected to the home page.
        </p>
      </Modal>
    </div>
  );
};

export default Organisersheader;