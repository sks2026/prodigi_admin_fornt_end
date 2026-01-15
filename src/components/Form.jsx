import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LeftPromo from "./LeftPromo";
import "./Form.css";

const Form = () => {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ loginId: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const errors = useMemo(() => {
    const next = { loginId: "", password: "" };
    if (!loginId) {
      next.loginId = "Login ID is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginId)) {
      next.loginId = "Enter a valid email";
    }

    if (!password) {
      next.password = "Password is required";
    } else if (password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }
    return next;
  }, [loginId, password]);




  const login = async () => {
    try {
      console.log('Starting login process...');
      setErrorMsg(""); // Clear any previous errors
      
      const requestBody = {
        email: loginId,
        password: password
      };
      
    
      const response = await fetch("http://localhost:3001/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok && result.success) {
        // Store token in localStorage
        if (result.data && result.data.token) {
          localStorage.setItem('adminToken', result.data.token);
          localStorage.setItem('adminData', JSON.stringify(result.data.admin));
          console.log('Token stored successfully');
        }
        
        setErrorMsg("");
        console.log('Login successful, navigating to dashboard...');
        navigate('/dashboard');
      } else {
        const errorMessage = result.message || "Login failed";
        console.error('Login failed:', errorMessage);
        setErrorMsg(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMsg("Network error. Please check if the server is running and try again.");
    }
  }

  const isValid = useMemo(() => {
    return !errors.loginId && !errors.password;
  }, [errors]);

  const onSubmit = (e) => {
    e.preventDefault();
    setTouched({ loginId: true, password: true });
    if (!isValid) return;
    login();
  };

  return (
    <div className="container">
      {/* Left Side - Promo */}
      <LeftPromo />

      {/* Right Side - Login */}
      <div className="login">
        <h2>Welcome back!</h2>
        <form onSubmit={onSubmit} noValidate>
          <label htmlFor="loginID">Login ID</label>
          <input
            id="loginID"
            type="email"
            placeholder="Enter Email ID"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, loginId: true }))}
            className={touched.loginId && errors.loginId ? "input error" : "input"}
          />
          {touched.loginId && errors.loginId ? (
            <div className="error-message">{errors.loginId}</div>
          ) : null}

          <label htmlFor="password">Password</label>
          <div className="input-group">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              className={touched.password && errors.password ? "input error" : "input"}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="toggle-visibility"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
                // eye-off icon (inline SVG)
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="currentColor" d="M2.3 2.3a1 1 0 0 1 1.4 0l18 18a1 1 0 1 1-1.4 1.4l-3.3-3.3A11.7 11.7 0 0 1 12 20C6.7 20 2.3 16.6 1 12c.5-1.7 1.4-3.2 2.6-4.5l-1.3-1.2a1 1 0 0 1 0-1.4zM6.6 8.6A8.9 8.9 0 0 0 3 12c1.1 3.2 4.7 6 9 6 2 0 3.9-.6 5.4-1.6l-2.1-2.1c-.8.5-1.8.7-2.8.7a5 5 0 0 1-5-5c0-1 .2-2 .7-2.8l-1.6-1.6zM9.8 11.8a3 3 0 0 0 4.4 4.4l-4.4-4.4z" />
                  <path fill="currentColor" d="M12 8a4 4 0 0 1 4 4c0 .3 0 .6-.1.9l-1.6-1.6A2 2 0 0 0 12 10c-.3 0-.6 0-.9.1L9.7 8.7c.7-.4 1.4-.7 2.3-.7z" />
                </svg>
              ) : (
                // eye icon (inline SVG)
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="currentColor" d="M12 5c5.3 0 9.7 3.4 11 8-1.3 4.6-5.7 8-11 8S2.3 17.6 1 13c1.3-4.6 5.7-8 11-8zm0 2C7.7 7 4.1 9.8 3 13c1.1 3.2 4.7 6 9 6s7.9-2.8 9-6c-1.1-3.2-4.7-6-9-6zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                </svg>
              )}
            </button>
          </div>
          {touched.password && errors.password ? (
            <div className="error-message">{errors.password}</div>
          ) : null}
          {errorMsg && <div className="error-message">{errorMsg}</div>}

          <Link to="/forgot" className="forgot">Forgot your password?</Link>

          <button type="submit" className="submit" disabled={!isValid}>Log In</button>
        </form>
      </div>
    </div>
  );
};

export default Form;
