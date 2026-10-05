import { ref, unref, watchEffect, type Ref } from 'vue'
import axios, { type AxiosRequestConfig } from 'axios'

// In-memory cache for GET requests to eliminate duplicate API calls & slow page load delays
const apiCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 300000 // 5 minutes cache
const inflight = new Map<string, Promise<any>>()

// Set: on localhost the last entry would repeat localhost:8001 and get probed twice
export const API_BASE_URLS = [...new Set([
  'http://127.0.0.1:8001',
  'http://mrhomeservices.test:8001',
  'http://localhost:8001',
  // Same machine that served the page, e.g. a phone opening http://192.168.x.x:5173
  `http://${window.location.hostname}:8001`
])]

let activeBaseUrl = 'http://127.0.0.1:8001'

export function getActiveBaseUrl(): string {
  return activeBaseUrl
}

let probe: Promise<string> | null = null

/**
 * Fast detection of active backend server.
 * Requests that fail at the same time share one probe, and the result is reused for 30s;
 * before, every failed request probed every server on its own (one HEAD per server each).
 */
export function getFastApiBaseUrl(): Promise<string> {
  if (!probe) {
    probe = detectApiBaseUrl()
    probe.finally(() => setTimeout(() => { probe = null }, 30000))
  }
  return probe
}

async function detectApiBaseUrl(): Promise<string> {
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
// No fixed baseURL: the interceptor uses whichever server was detected last
export const apiClient = axios.create({
  timeout: 15000,
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
  if (!config.baseURL || config.baseURL === 'http://localhost:5173') {
    config.baseURL = activeBaseUrl
  }
  return config
})

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const hadToken = !!localStorage.getItem('token')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Token expired or revoked: send the user to log in again. The full reload
      // also resets the Pinia auth store. The OAuth callback page handles its own 401.
      const path = window.location.pathname
      if (hadToken && path !== '/login' && path !== '/auth/callback') {
        window.location.assign('/login')
      }
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

    const request = async () => {
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
            timeout: 10000
          })
        } else {
          throw err
        }
      }
      if (isGet) {
        apiCache.set(cacheKey, { data: res.data, timestamp: Date.now() })
      }
      return res.data
    }

    try {
      // Components asking for the same GET at the same time share one request,
      // so a single-threaded backend isn't flooded with duplicates
      let pending = isGet ? inflight.get(cacheKey) : undefined
      if (!pending) {
        pending = request()
        if (isGet) {
          inflight.set(cacheKey, pending)
          const clear = () => inflight.delete(cacheKey)
          pending.then(clear, clear)
        }
      }

      const resData = await pending
      data.value = resData

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
