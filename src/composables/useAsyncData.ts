import { ref, onScopeDispose, getCurrentScope, type Ref } from 'vue'
import { readCache, writeCache, onCacheUpdate, CACHE_TTL } from './useFetch'

const inflight = new Map<string, Promise<unknown>>()

export interface AsyncDataOptions<T> {
  /** How long a cached copy is used without running the handler again (default 5 min) */
  ttl?: number
  /** Save to localStorage so a page refresh shows it immediately (default true) */
  persist?: boolean
  /** Value before anything is loaded */
  default?: T
  /** Run straight away (default true) */
  immediate?: boolean
}

/**
 * Nuxt-style useAsyncData: caches any async result under `key`.
 *
 *   const { data: categories, pending } = useAsyncData('categories', () => service.getCategories())
 *
 * A cached value is returned at once (also after a page refresh); when it is older than `ttl`
 * the handler runs again in the background and `data` updates. Same key = one shared request.
 */
export function useAsyncData<T = unknown>(key: string, handler: () => Promise<T>, options: AsyncDataOptions<T> = {}) {
  const cacheKey = `asyncData:${key}`
  const cached = readCache(cacheKey)
  const data = ref<T | undefined>(cached ? cached.data : options.default) as Ref<T | undefined>
  const pending = ref(!cached)
  const error = ref<unknown>(null)

  const run = () => {
    let p = inflight.get(cacheKey) as Promise<T> | undefined
    if (!p) {
      p = handler().then(result => {
        writeCache(cacheKey, result, options.persist ?? true)
        return result
      })
      inflight.set(cacheKey, p)
      const clear = () => inflight.delete(cacheKey)
      p.then(clear, clear)
    }
    return p
  }

  /** Load (or reload with force) and return the value */
  async function refresh({ force = false } = {}): Promise<T | undefined> {
    const hit = readCache(cacheKey)
    if (hit && !force) {
      data.value = hit.data
      if (Date.now() - hit.timestamp < (options.ttl ?? CACHE_TTL)) return hit.data
      // Stale: keep showing it and refresh in the background
      run().catch(e => { error.value = e })
      return hit.data
    }
    pending.value = true
    error.value = null
    try {
      data.value = await run()
      return data.value
    } catch (e) {
      error.value = e
      return data.value
    } finally {
      pending.value = false
    }
  }

  // Pick up fresh copies from background refreshes and prefetching
  const stop = onCacheUpdate(cacheKey, value => { data.value = value })
  if (getCurrentScope()) onScopeDispose(stop)

  if (options.immediate !== false) refresh()

  return { data, pending, error, refresh }
}

export default useAsyncData
