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

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref<string | null>(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  async function requestOtp(email: string) {
    try {
      const { data } = await api.post('/api/user/auth/request-otp', { email })
      return data
    } catch (err: any) {
      try {
        const res = await fetch('http://mrhomeservices.test:8001/api/user/auth/request-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ email })
        })
        const resData = await res.json()
        if (res.ok && resData.status) return resData
        throw new Error(resData.message || 'Failed to send OTP.')
      } catch (fallbackErr) {
        throw err
      }
    }
  }
  async function verifyOtp(email: string, otp: string) {
    try {
      const { data } = await api.post('/api/user/auth/verify-otp', { email, otp })
      return data
    } catch (err: any) {
      try {
        const res = await fetch('http://mrhomeservices.test:8001/api/user/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ email, otp })
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
    email: string
    name: string
    address: string
    phone: string
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
   * 4. Login with email & password
   * POST http://mrhomeservices.test:8001/api/user/auth/login { email, password }
   */
  async function login(email: string, password: string) {
    let resData: any = null
    try {
      const { data } = await api.post('/api/user/auth/login', { email, password })
      resData = data
    } catch (err: any) {
      try {
        const res = await fetch('http://mrhomeservices.test:8001/api/user/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ email, password })
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

  function updateProfile(updatedData: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...updatedData }
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  /**
   * Forgot Password — sends OTP to email for password reset
   * POST /api/user/auth/forgot-password { email }
   */
  async function forgotPassword(email: string) {
    const { data } = await api.post('/api/user/auth/forgot-password', { email })
    return data
  }

  /**
   * Reset Password — uses OTP + new password to reset
   * POST /api/user/auth/reset-password { email, otp, password, password_confirmation }
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
      const fetchedUser = data.data?.user || data.user || data
      user.value = fetchedUser
      localStorage.setItem('user', JSON.stringify(fetchedUser))
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
    updateProfile,
    logout
  }
})
