const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse'
const MIN_REQUEST_INTERVAL_MS = 1000

let lastRequestAt = 0

interface NominatimReverseResponse {
  display_name?: string
  error?: string
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(signal.reason)
      },
      { once: true },
    )
  })
}
export async function reverseGeocode(
  longitude: number,
  latitude: number,
  signal?: AbortSignal,
): Promise<string> {
  const waitMs = lastRequestAt + MIN_REQUEST_INTERVAL_MS - Date.now()
  if (waitMs > 0) {
    await delay(waitMs, signal)
  }
  signal?.throwIfAborted()
  lastRequestAt = Date.now()
  const params = new URLSearchParams({
    format: 'json',
    lat: String(latitude),
    lon: String(longitude),
    zoom: '18',
    addressdetails: '1',
  })

  const response = await fetch(`${NOMINATIM_REVERSE_URL}?${params}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error(`Reverse geocoding failed with HTTP ${response.status}`)
  }

  const data = (await response.json()) as NominatimReverseResponse
  if (data.error || !data.display_name) {
    return ''
  }
  return data.display_name
}
