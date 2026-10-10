/** Address parts for the checkout form, worked out from map coordinates */
export interface GeocodedAddress {
  street: string
  town: string
  city: string
}

type NominatimAddress = Partial<Record<
  'house_number' | 'road' | 'neighbourhood' | 'residential' | 'quarter' | 'suburb' | 'city_district'
  | 'city' | 'town' | 'village' | 'municipality' | 'county',
  string
>>

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'
// The free service is sometimes slow; give up after this so the form is not stuck on "Finding..."
const TIMEOUT_MS = 8000

/**
 * Coordinates -> street, area and city, from OpenStreetMap Nominatim (free, no key).
 * Returns null when the lookup fails, so the customer can still type the address.
 */
export async function reverseGeocode(latitude: number, longitude: number, signal?: AbortSignal): Promise<GeocodedAddress | null> {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(latitude),
    lon: String(longitude),
    zoom: '18',
    addressdetails: '1',
    'accept-language': 'en' // map labels in Pakistan are often Urdu
  })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  signal?.addEventListener('abort', () => controller.abort())

  try {
    const res = await fetch(`${NOMINATIM_URL}?${params}`, { signal: controller.signal, headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    const data = await res.json()
    const a: NominatimAddress = data?.address || {}

    const town = a.suburb || a.neighbourhood || a.residential || a.quarter || a.city_district || ''
    const city = a.city || a.town || a.municipality || a.village || a.county || ''
    const houseAndRoad = [a.house_number, a.road].filter(Boolean).join(' ')
    const area = a.neighbourhood || a.residential || a.quarter || ''
    const street = [houseAndRoad, area && area !== town ? area : ''].filter(Boolean).join(', ')
      || firstParts(data?.display_name, 2)

    return { street, town, city }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/** "Street 5, Block C, Lahore, Punjab, Pakistan" -> "Street 5, Block C" */
function firstParts(displayName: unknown, count: number): string {
  if (typeof displayName !== 'string') return ''
  return displayName.split(',').map((p) => p.trim()).filter(Boolean).slice(0, count).join(', ')
}
