import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LeftPromo from './LeftPromo'
import './createpassword.css'
// If react-icons is not installed, fallback to text. Otherwise these imports will work when installed.
// import { FiEye, FiEyeOff } from 'react-icons/fi'

const CreateNewPassword = () => {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState({ pass: false, confirm: false })
  const [touched, setTouched] = useState({ pass: false, confirm: false })
  const navigate = useNavigate()

  const rules = useMemo(() => {
    const errs = { pass: '', confirm: '' }
    if (!password) {
      errs.pass = 'Password is required'
    } else if (password.length < 8) {
      errs.pass = 'Use at least 8 characters'
    }

    if (!confirm) {
      errs.confirm = 'Please re-enter password'
    } else if (confirm !== password) {
      errs.confirm = 'New password must be different from your previous password.'
    }
    return errs
  }, [password, confirm])

  const isValid = !rules.pass && !rules.confirm

  const onSubmit = (e) => {
    e.preventDefault()
    setTouched({ pass: true, confirm: true })
    if (!isValid) return
    create()
  }

  const create = ()=>{
    try {
      const email = (() => { try { return localStorage.getItem('forgotEmail') || '' } catch(e) { return '' } })()
      const otp = (() => { try { return localStorage.getItem('forgotOtp') || '' } catch(e) { return '' } })()
      if (!email || !otp) {
        alert('Missing email or OTP. Please restart the reset flow.')
        return
      }
      
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        "email": email,
        "otp": otp,
        "password": password,
        "confirmPassword": confirm
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };

      fetch("http://localhost:3001/api/admin/reset-password", requestOptions)
        .then((response) => response.text())
        .then((result) => {
          console.log(result)
          try { localStorage.removeItem('forgotEmail'); localStorage.removeItem('forgotOtp'); } catch(e) {}
          navigate('/login')
        })
        .catch((error) => console.error(error));
    } catch (error) {
      
    }
  }

  return (
    <div className="container createpw">
      <LeftPromo />
      <div className="panel">
        <h2>Create New Password</h2>
        <form onSubmit={onSubmit} noValidate>
          <label htmlFor="pw">Password</label>
          <div className="input-group">
            <input
              id="pw"
              type={show.pass ? 'text' : 'password'}
              className={touched.pass && rules.pass ? 'input error' : 'input'}
              placeholder="************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, pass: true }))}
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShow((s) => ({ ...s, pass: !s.pass }))}
              aria-label={show.pass ? 'Hide password' : 'Show password'}
            >
              {show.pass ? (
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="currentColor" d="M2.3 2.3a1 1 0 0 1 1.4 0l18 18a1 1 0 1 1-1.4 1.4l-3.3-3.3A11.7 11.7 0 0 1 12 20C6.7 20 2.3 16.6 1 12c.5-1.7 1.4-3.2 2.6-4.5l-1.3-1.2a1 1 0 0 1 0-1.4zM6.6 8.6A8.9 8.9 0 0 0 3 12c1.1 3.2 4.7 6 9 6 2 0 3.9-.6 5.4-1.6l-2.1-2.1c-.8.5-1.8.7-2.8.7a5 5 0 0 1-5-5c0-1 .2-2 .7-2.8l-1.6-1.6zM9.8 11.8a3 3 0 0 0 4.4 4.4l-4.4-4.4z"/>
                  <path fill="currentColor" d="M12 8a4 4 0 0 1 4 4c0 .3 0 .6-.1.9l-1.6-1.6A2 2 0 0 0 12 10c-.3 0-.6 0-.9.1L9.7 8.7c.7-.4 1.4-.7 2.3-.7z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="currentColor" d="M12 5c5.3 0 9.7 3.4 11 8-1.3 4.6-5.7 8-11 8S2.3 17.6 1 13c1.3-4.6 5.7-8 11-8zm0 2C7.7 7 4.1 9.8 3 13c1.1 3.2 4.7 6 9 6s7.9-2.8 9-6c-1.1-3.2-4.7-6-9-6zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                </svg>
              )}
            </button>
          </div>
          {touched.pass && rules.pass ? <div className="error-message">{rules.pass}</div> : null}

          <label htmlFor="cpw">Re-enter Password</label>
          <div className="input-group">
            <input
              id="cpw"
              type={show.confirm ? 'text' : 'password'}
              className={touched.confirm && rules.confirm ? 'input error' : 'input'}
              placeholder="************"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
              aria-label={show.confirm ? 'Hide password' : 'Show password'}
            >
              {show.confirm ? (
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="currentColor" d="M2.3 2.3a1 1 0 0 1 1.4 0l18 18a1 1 0 1 1-1.4 1.4l-3.3-3.3A11.7 11.7 0 0 1 12 20C6.7 20 2.3 16.6 1 12c.5-1.7 1.4-3.2 2.6-4.5l-1.3-1.2a1 1 0 0 1 0-1.4zM6.6 8.6A8.9 8.9 0 0 0 3 12c1.1 3.2 4.7 6 9 6 2 0 3.9-.6 5.4-1.6l-2.1-2.1c-.8.5-1.8.7-2.8.7a5 5 0 0 1-5-5c0-1 .2-2 .7-2.8l-1.6-1.6zM9.8 11.8a3 3 0 0 0 4.4 4.4l-4.4-4.4z"/>
                  <path fill="currentColor" d="M12 8a4 4 0 0 1 4 4c0 .3 0 .6-.1.9l-1.6-1.6A2 2 0 0 0 12 10c-.3 0-.6 0-.9.1L9.7 8.7c.7-.4 1.4-.7 2.3-.7z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="currentColor" d="M12 5c5.3 0 9.7 3.4 11 8-1.3 4.6-5.7 8-11 8S2.3 17.6 1 13c1.3-4.6 5.7-8 11-8zm0 2C7.7 7 4.1 9.8 3 13c1.1 3.2 4.7 6 9 6s7.9-2.8 9-6c-1.1-3.2-4.7-6-9-6zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                </svg>
              )}
            </button>
          </div>
          {touched.confirm && rules.confirm ? <div className="error-message">{rules.confirm}</div> : null}
          

          <button type="submit" className="submit" disabled={!isValid}>Update Password</button>
        </form>
      </div>
    </div>
  )
}

export default CreateNewPassword