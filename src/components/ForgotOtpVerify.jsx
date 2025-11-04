import React, { useRef, useState } from 'react'
import "./forgotverify.css"
import LeftPromo from './LeftPromo'
import { useNavigate } from 'react-router-dom'

const ForgotOtpVerify = () => {
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)]
  const [otp, setOtp] = useState(['', '', '', ''])
  const navigate = useNavigate()
  const storedEmail = (() => { try { return localStorage.getItem('forgotEmail') || '' } catch(e) { return '' } })()

  const onChange = (index, e) => {
    const { value } = e.target
    if (/^\d?$/.test(value)) {
      const next = [...otp]
      next[index] = value
      setOtp(next)
      if (value && index < refs.length - 1) {
        refs[index + 1].current?.focus()
      }
    } else {
      e.target.value = ''
    }
  }

  const otpverify = () =>{
    try {
      const code = otp.join('')
      if (code.length !== 4) return
      
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        "email": storedEmail,
        "otp": code
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };

      fetch("http://localhost:3001/api/admin/verify-otp", requestOptions)
        .then((response) => response.text())
        .then((result) => {
          console.log(result)
          try { localStorage.setItem('forgotOtp', code) } catch(e) {}
          navigate('/create-password')
        })
        .catch((error) => console.error(error));
    } catch (error) {
      
    }
  }

  const onKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      refs[index - 1].current?.focus()
    }
  }

  return (
    <div className="container">
      <LeftPromo />
      <div className="right-panel">
        <h3>Verify your Email ID</h3>
        <p className="subtitle">Enter the OTP sent to – <strong>{storedEmail || 'your email'}</strong></p>
        <div className="otp-input">
          {refs.map((r, i) => (
            <input
              key={i}
              ref={r}
              type="text"
              inputMode="numeric"
              maxLength="1"
              onChange={(e) => onChange(i, e)}
              onKeyDown={(e) => onKeyDown(i, e)}
            />
          ))}
        </div>
        <p className="timer">01:30 Sec</p>
        <button
          type="button"
          className="verify-btn"
          disabled={!otp.every((d) => d && d.length === 1)}
          onClick={otpverify}
        >
          Verify OTP
        </button>
        <p className="resend">Don’t receive code ? <a href="#">Resend OTP</a></p>
      </div>
    </div>
  )
}

export default ForgotOtpVerify