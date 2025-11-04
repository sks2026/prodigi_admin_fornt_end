import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LeftPromo from './LeftPromo'
import './LoginForm.css'   // <-- external CSS file

const LoginForm = () => {
    const [loginId, setLoginId] = useState('')
    const [touched, setTouched] = useState(false)
    const navigate = useNavigate()

    const error = useMemo(() => {
        if (!loginId) return 'Login ID is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginId)) return 'Enter a valid email'
        return ''
    }, [loginId])

    const onSubmit = (e) => {
        e.preventDefault()
        setTouched(true)
        if (error) return
        forgotsendotp()
    }
    const forgotsendotp = () => {
        try {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify({
                email: loginId
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow"
            };

            fetch("https://api.prodigiedu.com/api/admin/forgot-password", requestOptions)
                .then(async (response) => {
                    const data = await response.json().catch(() => ({}))
                    if (response.ok) {
                        console.log('OTP sent:', data)
                        try { localStorage.setItem('forgotEmail', loginId) } catch(e) {}
                        navigate('/ForgotOtpVerify')
                    } else {
                        console.error('Failed to send OTP:', data)
                        alert(data.message || 'Failed to send OTP')
                    }
                })
                .catch((error) => {
                    console.error(error)
                    alert('Network error while sending OTP')
                });
        } catch (error) {
            console.log(error);

        }
    }
    return (
        <div>
            <section className="login-section">
                {/* Sidebar image section */}
                <LeftPromo />

                {/* Form section */}
                <div className="form-container">
                    <div className="form-header">
                        <h2>Forgot your password?</h2>
                        <p>Don't worry! It happens.</p>
                    </div>

                    <form className="login-form" onSubmit={onSubmit} noValidate>
                        <label htmlFor="login">Login ID</label>
                        <input
                            type="email"
                            placeholder="Enter your registered Login ID"
                            id="login"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            onBlur={() => setTouched(true)}
                        />
                        {touched && error ? <div className="error-message">{error}</div> : null}
                        <button type="submit" disabled={!!error}>Send OTP</button>
                        {/* <div className="back-link">
                            <span>Remembered your password? </span>
                            <Link to="/login">Back to login</Link>
                        </div> */}
                    </form>
                </div>
            </section>
        </div>
    )
}

export default LoginForm
