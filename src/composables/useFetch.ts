import { ref, unref, watchEffect, getCurrentScope, onScopeDispose, type Ref } from 'vue'
import axios, { type AxiosRequestConfig } from 'axios'

/*
 * GET cache, shared by useFetch, fetchApi and useAsyncData:
 * - Younger than CACHE_TTL (or options.ttl): served with no request at all.
 * - Older, up to MAX_AGE: served instantly, and a fresh copy is fetched in the background
 *   (stale-while-revalidate). The useFetch `data` ref and useAsyncData update when it arrives.
 * - Saved in localStorage too, so a page refresh shows the last data immediately.
 *   Searches and per-user data (account, orders, cart) are kept in memory only.
 */
type CacheEntry = { data: any; timestamp: number }
const apiCache = new Map<string, CacheEntry>()
export const CACHE_TTL = 300000 // 5 minutes: no request at all
const MAX_AGE = 24 * 60 * 60 * 1000 // 1 day: still shown while refreshing
const STORAGE_PREFIX = 'mhs-api-cache:v1:'
const inflight = new Map<string, Promise<any>>()
const listeners = new Map<string, Set<(data: any) => void>>()

/** Not saved to localStorage: results depend on the user or on what was typed */
function isPersistable(url: string): boolean {
  return !/^\/?api\/(search|user|orders|cart|addresses|payment-methods|bookings)/.test(url.replace(/^https?:\/\/[^/]+/, ''))
}

export function readCache(key: string): CacheEntry | null {
  const hit = apiCache.get(key)
  if (hit) return hit
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry
    if (Date.now() - entry.timestamp > MAX_AGE) {
      localStorage.removeItem(STORAGE_PREFIX + key)
      return null
    }
    apiCache.set(key, entry)
    return entry
  } catch {
    return null
  }
}

export function writeCache(key: string, data: any, persist = true) {
  const entry = { data, timestamp: Date.now() }
  apiCache.set(key, entry)
  listeners.get(key)?.forEach(fn => fn(data))
  if (!persist) return
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry))
  } catch {
    // Storage full: drop our saved responses and keep going with memory only
    clearApiCache({ memory: false })
  }
}

/** Be told when a fresh copy of `key` arrives (background refresh, prefetch) */
export function onCacheUpdate(key: string, fn: (data: any) => void): () => void {
  if (!listeners.has(key)) listeners.set(key, new Set())
  listeners.get(key)!.add(fn)
  return () => listeners.get(key)?.delete(fn)
}

/** Forget cached responses (e.g. after changing data in the admin panel) */
export function clearApiCache({ memory = true } = {}) {
  if (memory) apiCache.clear()
  try {
    Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX)).forEach(k => localStorage.removeItem(k))
  } catch {
    // Storage unavailable
  }
}

/** Same key useFetch uses, so prefetch and components share entries */
export function cacheKeyFor(url: string, params?: any): string {
  return `${url}_${JSON.stringify(params || {})}`
}

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
    // Callers that handle 401 themselves (checkout keeps the cart and asks to sign in again) opt out
    if (error.response && error.response.status === 401 && !error.config?.skipAuthRedirect) {
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
  /** How long a cached copy is used without asking the server (default 5 min) */
  ttl?: number
  fallbackData?: any
  /** Save to localStorage (default: yes, except search and per-user endpoints) */
  persist?: boolean
  /** Skip the cache and ask the server */
  force?: boolean
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

  // A fresh copy arriving later (background refresh, prefetch) updates `data`
  if (typeof url === 'string' && getCurrentScope()) {
    onScopeDispose(onCacheUpdate(options.cacheKey || cacheKeyFor(url, options.params), fresh => { data.value = fresh }))
  }

  const execute = async (overrideParams?: any) => {
    const rawUrl = unref(url)
    if (!rawUrl) return null

    const cacheKey = options.cacheKey || cacheKeyFor(rawUrl, overrideParams || options.params)
    const isGet = !options.method || options.method.toUpperCase() === 'GET'
    const persist = options.persist ?? isPersistable(rawUrl)

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
        writeCache(cacheKey, res.data, persist)
      }
      return res.data
    }

    // Components asking for the same GET at the same time share one request,
    // so a single-threaded backend isn't flooded with duplicates
    const shared = () => {
      let pending = isGet ? inflight.get(cacheKey) : undefined
      if (!pending) {
        pending = request()
        if (isGet) {
          inflight.set(cacheKey, pending)
          const clear = () => inflight.delete(cacheKey)
          pending.then(clear, clear)
        }
      }
      return pending
    }

    // 1. Cached: fresh copies are used as they are; older ones are shown now and refreshed quietly
    if (isGet && !options.force) {
      const cached = readCache(cacheKey)
      if (cached) {
        data.value = cached.data
        if (Date.now() - cached.timestamp >= (options.ttl ?? CACHE_TTL)) {
          shared().then(fresh => { data.value = fresh }, () => { /* keep showing the cached copy */ })
        }
        isLoading.value = false
        return cached.data
      }
    }

    isLoading.value = true
    error.value = null

    try {
      const resData = await shared()
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
