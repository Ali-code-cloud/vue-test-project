import { ref } from 'vue'
import { fetchApi } from './useFetch'

// Shared across Header and Footer so the cities are fetched once per page load
const cities = ref<string[]>([])
const isLoading = ref(false)
let pending: Promise<void> | null = null

async function loadCities() {
  isLoading.value = true
  try {
    const resData: any = await fetchApi('/api/active-cities')
    const rawCities = resData?.data || (Array.isArray(resData) ? resData : [])
    if (Array.isArray(rawCities)) {
      cities.value = rawCities
        .map((c: any) => (typeof c === 'string' ? c : c?.name || c?.city_name))
        .filter((name: any): name is string => typeof name === 'string' && name.length > 0)
    }
  } finally {
    isLoading.value = false
    // Allow a retry on the next mount if nothing came back
    if (cities.value.length === 0) pending = null
  }
}

/**
 * Active cities from GET /api/active-cities (no hardcoded fallback)
 */
export function useCities() {
  if (!pending) pending = loadCities()
  return { cities, isLoading, ready: pending }
}
