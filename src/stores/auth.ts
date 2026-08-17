import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/composables/useApi'

export interface User {
  id: number | string
  name: string
  email: string
  phone?: string
  address?: string
  role?: string
  avatar?: string
  joinedDate?: string
}

/**
 * Helper to extract a user-friendly error message from Axios errors.
 * Handles Laravel's validation format: { errors: { field: ["msg"] } }
 */
export function getApiError(error: any): string {
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors
    return Object.values(errors).flat().join(', ')
  }
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref<string | null>(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!user.value && !!token.value)

  /**
   * Request OTP — sends a 6-digit code to the email
   * POST /api/user/auth/request-otp  { email }
   */
  async function requestOtp(email: string) {
    const { data } = await api.post('/api/user/auth/request-otp', { email })
    return data
  }

  /**
   * Verify OTP — validates the 6-digit code
   * POST /api/user/auth/verify-otp  { email, otp }
   * If the backend returns a token, we auto-login.
   */
  async function verifyOtp(email: string, otp: string) {
    try {
      const { data } = await api.post('/api/user/auth/verify-otp', { email, otp })
      if (data?.token) {
        setAuth(data.token, data.user)
      }
      return data
    } catch (err: any) {
      if (err.response?.status === 404) {
        const { data } = await api.post('/api/user/auth/request-otp', { email, otp })
        if (data?.token) {
          setAuth(data.token, data.user)
        }
        return data
      }
      throw err
    }
  }

  /**
   * Login with email + password
   * POST /api/user/auth/login  { email, password }
   */
  async function login(email: string, password: string) {
    const { data } = await api.post('/api/user/auth/login', { email, password })
    if (data.token) {
      setAuth(data.token, data.user)
    }
    return data
  }

  /**
   * Register a new user
   * POST /api/user/auth/register
   * { email, name, address, phone, password, password_confirmation }
   */
  async function register(payload: {
    email: string
    name: string
    address: string
    phone: string
    password: string
    password_confirmation: string
  }) {
    const { data } = await api.post('/api/user/auth/register', payload)
    if (data.token) {
      setAuth(data.token, data.user)
    }
    return data
  }

  /**
   * Forgot Password — sends OTP to email for password reset
   * POST /api/user/auth/forgot-password  { email }
   */
  async function forgotPassword(email: string) {
    const { data } = await api.post('/api/user/auth/forgot-password', { email })
    return data
  }

  /**
   * Reset Password — uses OTP + new password to reset
   * POST /api/user/auth/reset-password  { email, otp, password, password_confirmation }
   */
  async function resetPassword(payload: {
    email: string
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
      user.value = data.user || data
      localStorage.setItem('user', JSON.stringify(user.value))
      return user.value
    } catch (e) {
      logout()
      return null
    }
  }

  /** Persist token + user in localStorage and reactive refs */
  function setAuth(newToken: string, userData: any) {
    token.value = newToken
    user.value = userData
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  /** Clear auth state */
  function logout() {
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
    logout
  }
})
