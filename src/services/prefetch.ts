import { fetchApi } from '@/composables/useFetch'

/*
 * Loads the public data most pages need right after the app starts, into the shared GET cache
 * (memory + localStorage). Pages asking for the same URL then get it instantly, or share the
 * request that is already running instead of starting another one.
 *
 * The local backend answers one request at a time, so this runs at most two at once.
 */

/** Needed by the header, footer and home page: loaded straight away */
const FIRST = [
  '/api/service-categories',
  '/api/active-cities',
  '/api/trending-services',
  '/api/all-reviews',
  '/api/stats'
]

/** Other pages: loaded once the browser is idle */
const LATER = [
  '/api/reviews/latest',
  '/api/blogs/categories',
  '/api/blogs?page=1&per_page=9'
]

const CONCURRENCY = 2

async function runQueue(urls: string[]) {
  const queue = [...urls]
  const worker = async () => {
    while (queue.length) {
      const url = queue.shift()!
      await fetchApi(url).catch(() => { /* a failed prefetch is retried when the page asks */ })
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
}

const whenIdle = (fn: () => void) =>
  'requestIdleCallback' in window ? window.requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 1500)

let started = false

export function prefetchAppData() {
  if (started) return
  started = true

  runQueue(FIRST).then(() => {
    whenIdle(async () => {
      // Services of every category, so opening any category tab is instant
      type Category = { id: number }
      const categories = await fetchApi<{ data?: Category[] } | Category[]>('/api/service-categories').catch(() => null)
      const list: Category[] = Array.isArray(categories) ? categories : categories?.data || []
      runQueue([...LATER, ...list.map(c => `/api/services/${c.id}`)])
    })
  })
}
