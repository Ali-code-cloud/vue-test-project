import { ref, unref, watchEffect, type Ref } from 'vue'
import axios, { type AxiosRequestConfig } from 'axios'

// In-memory cache for GET requests to eliminate duplicate API calls & slow page load delays
const apiCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 300000 // 5 minutes cache

export const API_BASE_URLS = [
  'http://127.0.0.1:8001',
  'http://mrhomeservices.test:8001',
  'http://localhost:8001'
]

let activeBaseUrl = 'http://127.0.0.1:8001'

/**
 * Fast detection of active backend server
 */
export async function getFastApiBaseUrl(): Promise<string> {
  for (const baseUrl of API_BASE_URLS) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 800)
      const res = await fetch(`${baseUrl}/api/service-categories`, { signal: controller.signal, method: 'HEAD' })
      clearTimeout(timer)
      if (res.ok || res.status < 500) {
        activeBaseUrl = baseUrl
        return baseUrl
      }
    } catch (e) {
      // Try next candidate
    }
  }
  return activeBaseUrl
}

// Configured Axios Instance with fast timeout & auto auth token
export const apiClient = axios.create({
  baseURL: activeBaseUrl,
  timeout: 4000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

// Request Interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (!config.baseURL || config.baseURL === '' || config.baseURL === 'http://localhost:5173') {
    config.baseURL = activeBaseUrl
  }
  return config
})

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  }
)

export interface UseFetchOptions extends AxiosRequestConfig {
  immediate?: boolean
  cacheKey?: string
  ttl?: number
  fallbackData?: any
}

/**
 * Primary Vue composable useFetch()
 * Features:
 * - Reactive data, error, isLoading, and refetch
 * - Instant cache serving for GET endpoints
 * - Ultra-fast automatic fallback handling
 */
export function useFetch<T = any>(
  url: string | Ref<string>,
  options: UseFetchOptions = {}
) {
  const data = ref<T | null>(options.fallbackData ?? null) as Ref<T | null>
  const error = ref<any>(null)
  const isLoading = ref<boolean>(false)

  const execute = async (overrideParams?: any) => {
    const rawUrl = unref(url)
    if (!rawUrl) return null

    const cacheKey = options.cacheKey || `${rawUrl}_${JSON.stringify(overrideParams || options.params || {})}`
    const isGet = !options.method || options.method.toUpperCase() === 'GET'

    // 1. Return cached response instantly if available
    if (isGet && apiCache.has(cacheKey)) {
      const cached = apiCache.get(cacheKey)!
      if (Date.now() - cached.timestamp < (options.ttl || CACHE_TTL)) {
        data.value = cached.data
        isLoading.value = false
        return cached.data
      }
    }

    isLoading.value = true
    error.value = null

    try {
      let res: any
      try {
        res = await apiClient.request<T>({
          url: rawUrl,
          method: options.method || 'GET',
          params: overrideParams || options.params,
          data: options.data,
          ...options
        })
      } catch (err: any) {
        if (!err.response) {
          const fastUrl = await getFastApiBaseUrl()
          res = await axios.request<T>({
            url: `${fastUrl}${rawUrl.startsWith('/') ? rawUrl : '/' + rawUrl}`,
            method: options.method || 'GET',
            params: overrideParams || options.params,
            data: options.data,
            headers: {
              Accept: 'application/json',
              Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
            },
            timeout: 3000
          })
        } else {
          throw err
        }
      }

      const resData = res.data
      data.value = resData

      if (isGet) {
        apiCache.set(cacheKey, { data: resData, timestamp: Date.now() })
      }

      return resData
    } catch (err: any) {
      error.value = err
      if (options.fallbackData !== undefined) {
        data.value = options.fallbackData
      }
      return options.fallbackData ?? null
    } finally {
      isLoading.value = false
    }
  }

  if (options.immediate !== false) {
    watchEffect(() => {
      execute()
    })
  }

  return {
    data,
    error,
    isLoading,
    execute,
    refetch: execute
  }
}

/**
 * Direct async fetch helper using useFetch engine
 */
export async function fetchApi<T = any>(url: string, options: UseFetchOptions = {}): Promise<T> {
  const { execute } = useFetch<T>(url, { ...options, immediate: false })
  const result = await execute()
  return result as T
}

export default useFetch
