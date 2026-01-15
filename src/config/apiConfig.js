// Use localhost for development, production URL for build
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001' : 'http://localhost:3001');

export const API_ENDPOINTS = {
  SEND_OTP: '/api/otp/send',
  VERIFY_OTP: '/api/otp/verify',
  REGISTER_USER: '/api/users/register',
  LOGIN: '/api/users/login',
  GET_USER: '/api/users/get-user',
  SEND_OTP_ORGANISER_PHONE: '/api/organisations/send-mobile-otp',
  VERIFY_OTP_ORGANISER_PHONE: '/api/organisations/verify-mobile-otp',
  SEND_OTP_ORGANISER_EMAIL: '/api/organisations/send-email-otp',
  VERIFY_OTP_ORGANISER_EMAIL: '/api/organisations/verify-email-otp',
  ORGANISATION_REGISTER: '/api/organisations/register',
  ORGANISATION_LOGIN: '/api/organisations/login',
  ORGANISATION_LOGOUT: '/api/organisations/logout',
  SEND_FORGET_PASS: '/api/organisations/forget-password/send-otp',
  SEND_FORGET_PASS_OTP_VERIFY: '/api/organisations/forget-password/verify-otp',
  ORGANISATION_RESET_PASS: '/api/organisations/forget-password/reset',
  COMPETITION_OVERVIEW: '/api/competitions/overview',
  COMPETITIONS_ALL: '/api/competitions/all',
  GET_PROFILE: '/api/users/profile',
  UPDATE_PROFILE: '/api/users/Updateprofile',
  FORGOT_PASSWORD: '/api/users/forgot-password',
  VERIFY_RESET_OTP: '/api/users/verify-reset-otp',
  RESET_PASSWORD: '/api/users/reset-password',
  GOOGLE_LOGIN: '/api/users/google-login',
  // Payment Gateway endpoints
  CREATE_ORDER: '/api/payment-gateway/create-order',
  VERIFY_PAYMENT: '/api/payment-gateway/verify-payment',
  BANK_TRANSHE_PAY: '/api/payment-gateway/bank-transhe-pay',
  // Add more endpoints here as needed
}; 