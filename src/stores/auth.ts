import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/composables/useApi'
import { getActiveBaseUrl } from '@/composables/useFetch'

export type SocialProvider = 'google' | 'facebook'

/** sessionStorage key: where to send the user after the social login round trip */
export const SOCIAL_REDIRECT_KEY = 'social_login_redirect'

export interface User {
  id: number | string
  name: string
  email: string | null // null for Facebook accounts registered with a phone number
  phone?: string | null // null for new social logins; checkout asks for it
  phone_verified_at?: string | null // set once the phone is confirmed by SMS code; checkout requires it
  address?: string | null
  role?: string
  avatar?: string
  joinedDate?: string
  is_verified?: boolean
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

/**
 * Helper to extract a user-friendly error message from Axios or Fetch errors.
 * Handles Laravel's validation format: { errors: { field: ["msg"] } }
 */
export function getApiError(error: any): string {
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors
    return Object.values(errors).flat().join(', ')
  }
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  if (error?.message) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}

/** Login / OTP identifier: the backend takes either { email } or { phone } */
export type AuthIdentifier = { email: string } | { phone: string }

/** Anything with an @ is an email; everything else is treated as a phone number */
export function toIdentifier(value: string): AuthIdentifier {
  const v = value.trim()
  return v.includes('@') ? { email: v } : { phone: v }
}

/** Digits after +92: "+92 300 1234567", "923001234567", "03001234567" -> "3001234567" */
function pkLocalDigits(value: string): string {
  return value.replace(/\D/g, '').replace(/^(92|0)/, '')
}

/** Pakistani mobile number (the +92 field gives 03001234567) */
export function getPhoneError(value: string): string {
  const digits = pkLocalDigits(value || '')
  if (!digits) return 'Phone Number is required.'
  if (!/^3\d{9}$/.test(digits)) return 'Please enter a valid mobile number, e.g. 300 1234567.'
  return ''
}

/** For display: 03001234567 -> "+92 300 1234567" */
export function formatPhone(value?: string | null): string {
  const digits = pkLocalDigits(value || '')
  if (!digits) return ''
  return /^3\d{9}$/.test(digits) ? `+92 ${digits.slice(0, 3)} ${digits.slice(3)}` : (value || '')
}

export function isPhoneIdentifier(value: string): boolean {
  return !value.trim().includes('@')
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref<string | null>(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  /** POST /api/user/auth/request-otp { email } or { phone } */
  async function requestOtp(identifier: string) {
    const body = toIdentifier(identifier)
    try {
      const { data } = await api.post('/api/user/auth/request-otp', body)
      return data
    } catch (err: any) {
      try {
        const res = await fetch('http://mrhomeservices.test:8001/api/user/auth/request-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(body)
        })
        const resData = await res.json()
        if (res.ok && resData.status) return resData
        throw new Error(resData.message || 'Failed to send OTP.')
      } catch (fallbackErr) {
        throw err
      }
    }
  }
  /** POST /api/user/auth/verify-otp — must use the same field as request-otp */
  async function verifyOtp(identifier: string, otp: string) {
    const body = { ...toIdentifier(identifier), otp }
    try {
      const { data } = await api.post('/api/user/auth/verify-otp', body)
      return data
    } catch (err: any) {
      try {
        const res = await fetch('http://mrhomeservices.test:8001/api/user/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(body)
        })
        const resData = await res.json()
        if (res.ok && resData.status) return resData
        throw new Error(resData.message || 'Failed to verify OTP.')
      } catch (fallbackErr) {
        throw err
      }
    }
  }

  async function register(payload: {
    email?: string // optional when signing up with a phone number
    name: string
    address?: string
    phone?: string
    password: string
    password_confirmation: string
  }) {
    let resData: any = null
    try {
      const { data } = await api.post('/api/user/auth/register', payload)
      resData = data
    } catch (err: any) {
      try {
        const res = await fetch('http://mrhomeservices.test:8001/api/user/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        })
        resData = await res.json()
        if (!res.ok || !resData.status) {
          throw err
        }
      } catch (fallbackErr) {
        throw err
      }
    }

    const userData = resData?.data?.user || resData?.user
    const accessToken = resData?.data?.access_token || resData?.access_token || resData?.token

    if (accessToken && userData) {
      setAuth(accessToken, userData)
    }

    return resData
  }

  /**
   * 4. Login with email or phone + password
   * POST /api/user/auth/login { email | phone, password }
   */
  async function login(identifier: string, password: string) {
    const body = { ...toIdentifier(identifier), password }
    let resData: any = null
    try {
      const { data } = await api.post('/api/user/auth/login', body)
      resData = data
    } catch (err: any) {
      try {
        const res = await fetch('http://mrhomeservices.test:8001/api/user/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(body)
        })
        resData = await res.json()
        if (!res.ok || !resData.status) {
          throw err
        }
      } catch (fallbackErr) {
        throw err
      }
    }

    const userData = resData?.data?.user || resData?.user
    const accessToken = resData?.data?.access_token || resData?.access_token || resData?.token

    if (accessToken && userData) {
      setAuth(accessToken, userData)
    }

    return resData
  }

  /**
   * Checkout phone check: text a code to the phone (logged-in user)
   * POST /api/user/auth/phone/send-otp { phone }
   */
  async function sendPhoneOtp(phone: string) {
    const { data } = await api.post('/api/user/auth/phone/send-otp', { phone })
    return data?.data as { phone: string; resend_after_seconds?: number } | undefined
  }

  /**
   * Confirm the code; the backend saves the phone to the profile as verified
   * POST /api/user/auth/phone/verify-otp { phone, otp }
   */
  async function verifyPhoneOtp(phone: string, otp: string) {
    const { data } = await api.post('/api/user/auth/phone/verify-otp', { phone, otp })
    const verifiedUser = data?.data?.user
    if (verifiedUser) updateProfile(verifiedUser)
    return verifiedUser as User | undefined
  }

  /**
   * Reload the profile (GET /api/user/auth/me) and return whether its phone is verified by SMS code.
   * Keeps the session on failure and answers from the saved profile.
   */
  async function refreshUser(): Promise<boolean> {
    try {
      const { data } = await api.get('/api/user/auth/me')
      if (data?.data?.user) updateProfile(data.data.user)
      if (typeof data?.data?.phone_verified === 'boolean') return data.data.phone_verified
    } catch {
      // Offline or slow: keep the saved profile
    }
    return !!user.value?.phone && !!user.value?.phone_verified_at
  }

  function updateProfile(updatedData: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...updatedData }
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  /**
   * Forgot Password — sends OTP to the phone for password reset
   * POST /api/user/auth/forgot-password { phone }
   */
  async function forgotPassword(phone: string) {
    const { data } = await api.post('/api/user/auth/forgot-password', { phone })
    return data
  }

  /**
   * Reset Password — uses OTP + new password to reset
   * POST /api/user/auth/reset-password { phone, otp, password, password_confirmation }
   */
  async function resetPassword(payload: {
    phone: string
    otp: string
    password: string
    password_confirmation: string
  }) {
    const { data } = await api.post('/api/user/auth/reset-password', payload)
    return data
  }

  /**
   * Fetch authenticated user profile
   * GET /api/user
   */
  async function fetchUser() {
    try {
      const { data } = await api.get('/api/user')
      const fetchedUser = data.data?.user || data.user || data
      user.value = fetchedUser
      localStorage.setItem('user', JSON.stringify(fetchedUser))
      return user.value
    } catch (e) {
      logout()
      return null
    }
  }

  /**
   * Social login — full-page redirect to the backend, which returns to /auth/callback
   * GET /api/user/auth/{provider}
   */
  function startSocialLogin(provider: SocialProvider, redirectTo?: string) {
    if (redirectTo) sessionStorage.setItem(SOCIAL_REDIRECT_KEY, redirectTo)
    window.location.href = `${getActiveBaseUrl()}/api/user/auth/${provider}`
  }

  /**
   * Finish social login with the token from the callback URL
   * GET /api/user/auth/me
   */
  async function loginWithToken(newToken: string) {
    localStorage.setItem('token', newToken)
    try {
      const { data } = await api.get('/api/user/auth/me')
      const userData = data?.data?.user
      if (!userData) throw new Error('Could not load your account.')
      setAuth(newToken, userData)
      return userData as User
    } catch (e) {
      logout()
      throw e
    }
  }

  /** Persist token + user in localStorage and reactive refs */
  function setAuth(newToken: string, userData: any) {
    token.value = newToken
    user.value = userData
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  /**
   * Revoke the token on the backend (best effort) and clear auth state
   * POST /api/user/auth/logout
   */
  function logout() {
    if (token.value) {
      fetch(`${getActiveBaseUrl()}/api/user/auth/logout`, {
        method: 'POST',
        keepalive: true,
        headers: { Authorization: `Bearer ${token.value}`, Accept: 'application/json' }
      }).catch(() => {})
    }
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    isAuthenticated,
    requestOtp,
    verifyOtp,
    login,
    register,
    forgotPassword,
    resetPassword,
    fetchUser,
    setAuth,
    startSocialLogin,
    loginWithToken,
    updateProfile,
    sendPhoneOtp,
    verifyPhoneOtp,
    refreshUser,
    logout
  }
})
