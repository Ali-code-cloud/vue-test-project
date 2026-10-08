<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import type View from 'ol/View'
import type { Coordinate } from 'ol/coordinate'
import { reverseGeocode } from '@/services/geocoding'
import type { DeliveryLocation, LngLat } from '@/types/location'

const props = withDefaults(
  defineProps<{
    defaultCenter?: LngLat
    defaultZoom?: number
    mapHeight?: string
    addressError?: string
    locationError?: string
  }>(),
  {
    defaultCenter: () => [74.3587, 31.5204],
    defaultZoom: 12,
    mapHeight: '400px',
    addressError: '',
    locationError: '',
  },
)

const emit = defineEmits<{
  'location-selected': [location: DeliveryLocation]
}>()
const GPS_ZOOM = 17
const SELECTION_ANIMATION_MS = 400
const markerIcon = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">' +
  '<path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 26 16 26s16-14 16-26C32 7.2 24.8 0 16 0z" fill="#e53e3e"/>' +
  '<circle cx="16" cy="16" r="6" fill="#fff"/></svg>',
)}`

const addressInputId = useId()
const viewRef = ref<{ view: View } | null>(null)
const selectedCoords = ref<LngLat | null>(null)
const address = ref('')
const addressEditedByUser = ref(false)
const suggestedAddress = ref('')
const isLocating = ref(false)
const isGeocoding = ref(false)
const gpsError = ref('')
const geocodeError = ref('')

let geocodeController: AbortController | null = null
let gpsRequestId = 0
const selectedLatitude = computed(() => selectedCoords.value?.[1] ?? null)
const selectedLongitude = computed(() => selectedCoords.value?.[0] ?? null)
function formatCoordinate(value: number | null): string {
  return value === null ? 'Not selected' : value.toFixed(7)
}
function normalizeLongitude(longitude: number): number {
  return ((((longitude + 180) % 360) + 360) % 360) - 180
}
function emitLocation() {
  emit('location-selected', {
    address: address.value,
    latitude: selectedLatitude.value,
    longitude: selectedLongitude.value,
  })
}
function applyGeocodedAddress(foundAddress: string) {
  if (!foundAddress) {
    geocodeError.value = 'No street address was found for this spot. Please type your address.'
    return
  }
  if (addressEditedByUser.value) {
    suggestedAddress.value = foundAddress
  } else {
    address.value = foundAddress
  }
}
async function selectLocation(coords: LngLat, zoom?: number) {
  const point: LngLat = [normalizeLongitude(coords[0]), coords[1]]
  selectedCoords.value = point
  viewRef.value?.view.animate(
    zoom === undefined
      ? { center: point, duration: SELECTION_ANIMATION_MS }
      : { center: point, zoom, duration: SELECTION_ANIMATION_MS },
  )
  geocodeController?.abort()
  const controller = new AbortController()
  geocodeController = controller
  suggestedAddress.value = ''
  geocodeError.value = ''
  isGeocoding.value = true

  try {
    const foundAddress = await reverseGeocode(point[0], point[1], controller.signal)
    if (controller.signal.aborted) return
    applyGeocodedAddress(foundAddress)
  } catch {
    if (controller.signal.aborted) return
    geocodeError.value = 'We could not look up the address for this spot. Please type your address.'
  } finally {
    if (geocodeController === controller) {
      geocodeController = null
      isGeocoding.value = false
    }
  }
  emitLocation()
}

function cancelPendingGpsRequest() {
  gpsRequestId++
  isLocating.value = false
}
function handleMapClick(event: { coordinate: Coordinate }) {
  const coords = event.coordinate
  const longitude = coords[0]
  const latitude = coords[1]
  if (longitude === undefined || latitude === undefined || Math.abs(latitude) > 90) return
  cancelPendingGpsRequest()
  gpsError.value = ''
  void selectLocation([longitude, latitude])
}
function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    })
  })
}

function describeGeolocationError(error: unknown): string {
  const fallback = ' You can still click on the map to choose your location.'
  switch ((error as GeolocationPositionError | undefined)?.code) {
    case 1:
      return (
        'Location permission was denied. To use GPS, allow location access for this site ' +
        'in your browser settings.' +
        fallback
      )
    case 2:
      return 'Your location is unavailable right now (no GPS or network signal).' + fallback
    case 3:
      return 'Getting your location took too long. Please try again.' + fallback
    default:
      return 'We could not get your location.' + fallback
  }
}

async function detectCurrentLocation() {
  gpsError.value = ''
  if (!('geolocation' in navigator)) {
    gpsError.value =
      'Your browser does not support location detection. Please click on the map to choose your location.'
    return
  }
  // Browsers only allow geolocation on HTTPS pages (and http://localhost during development)
  if (!window.isSecureContext) {
    gpsError.value =
      'Location detection needs a secure (HTTPS) connection. Please click on the map to choose your location.'
    return
  }

  const requestId = ++gpsRequestId
  isLocating.value = true
  try {
    const position = await getCurrentPosition()
    if (requestId !== gpsRequestId) return

    // Browser GPS gives named latitude/longitude; OpenLayers needs [longitude, latitude]
    const latitude = position.coords.latitude
    const longitude = position.coords.longitude
    const coords: LngLat = [longitude, latitude]

    // Same path as a map click. Not awaited: the GPS part is done, the address lookup has its own status.
    void selectLocation(coords, GPS_ZOOM)
  } catch (error) {
    if (requestId === gpsRequestId) {
      gpsError.value = describeGeolocationError(error)
    }
  } finally {
    if (requestId === gpsRequestId) {
      isLocating.value = false
    }
  }
}

function handleAddressInput(event: Event) {
  address.value = (event.target as HTMLTextAreaElement).value
  // Clearing the field hands it back to automatic filling
  addressEditedByUser.value = address.value.trim() !== ''
  emitLocation()
}

function acceptSuggestedAddress() {
  address.value = suggestedAddress.value
  suggestedAddress.value = ''
  addressEditedByUser.value = false
  emitLocation()
}
</script>

<template>
  <div class="location-picker">
    <div class="field">
      <label :for="addressInputId" class="field-label">
        Delivery Address <span class="required" aria-hidden="true">*</span>
      </label>
      <textarea :id="addressInputId" :value="address" class="address-input" :class="{ 'has-error': addressError }"
        rows="3" maxlength="1000" placeholder="House number, street, area, city" required
        :aria-invalid="addressError ? 'true' : 'false'" @input="handleAddressInput"></textarea>

      <p v-if="isGeocoding" class="status">Looking up address...</p>
      <p v-if="geocodeError" class="notice">{{ geocodeError }}</p>
      <div v-if="suggestedAddress" class="suggestion">
        <span>
          Address for the new pin: <strong>{{ suggestedAddress }}</strong>
        </span>
        <button type="button" class="btn-suggestion" @click="acceptSuggestedAddress">
          Use this address
        </button>
      </div>
      <p v-if="addressError" class="field-error">{{ addressError }}</p>
    </div>

    <div class="field">
      <button type="button" class="btn-gps" :disabled="isLocating" :aria-busy="isLocating"
        @click="detectCurrentLocation">
        {{ isLocating ? 'Getting location...' : '📍 Use My Current Location' }}
      </button>
      <p v-if="gpsError" class="field-error" role="alert">{{ gpsError }}</p>
    </div>

    <p class="map-hint">Or click anywhere on the map</p>

    <!--
      <ol-map> creates the OpenLayers map and its <div>. Every coordinate below is in the
      view's projection, EPSG:4326, which means plain degrees in [longitude, latitude] order.
      singleclick (unlike click) is not fired for double-clicks, which zoom the map instead.
    -->
    <ol-map class="map" :class="{ 'has-error': locationError }" :style="{ height: mapHeight }"
      :load-tiles-while-animating="true" :load-tiles-while-interacting="true" @singleclick="handleMapClick">
      <!-- <ol-view> is the camera: what is centered, how far zoomed, which projection -->
      <ol-view ref="viewRef" :center="props.defaultCenter" :zoom="props.defaultZoom" projection="EPSG:4326" />

      <!-- Base map: OpenStreetMap raster tiles (OpenLayers reprojects them to EPSG:4326) -->
      <ol-tile-layer>
        <ol-source-osm />
      </ol-tile-layer>

      <!-- Our own drawings on top of the tiles: the marker for the selected point -->
      <ol-vector-layer>
        <ol-source-vector>
          <ol-feature v-if="selectedCoords">
            <ol-geom-point :coordinates="selectedCoords" />
            <ol-style>
              <ol-style-icon :src="markerIcon" :anchor="[0.5, 1]" />
            </ol-style>
          </ol-feature>
        </ol-source-vector>
      </ol-vector-layer>
    </ol-map>
    <p v-if="locationError" class="field-error">{{ locationError }}</p>

    <dl class="coords">
      <div>
        <dt>Latitude:</dt>
        <dd>{{ formatCoordinate(selectedLatitude) }}</dd>
      </div>
      <div>
        <dt>Longitude:</dt>
        <dd>{{ formatCoordinate(selectedLongitude) }}</dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.location-picker {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-weight: 600;
  color: #2c3e50;
}

.required {
  color: #e53e3e;
}

.address-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font: inherit;
  color: #2c3e50;
  resize: vertical;
}

.address-input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.2);
}

.has-error {
  border-color: #e53e3e;
}

.btn-gps {
  align-self: flex-start;
  background: #ffffff;
  border: 1px solid #42b883;
  color: #2f855a;
  padding: 10px 18px;
  border-radius: 8px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-gps:hover:not(:disabled) {
  background: #f0fdf4;
}

.btn-gps:disabled {
  opacity: 0.7;
  cursor: progress;
}

.map-hint {
  color: #4a5568;
  font-size: 14px;
}

.map {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  cursor: crosshair;
}

.status {
  color: #4a5568;
  font-size: 13px;
}

.notice {
  color: #b7791f;
  font-size: 13px;
}

.field-error {
  color: #e53e3e;
  font-size: 13px;
}

.suggestion {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  padding: 10px 12px;
  background: #f7fafc;
  border: 1px dashed #cbd5e0;
  border-radius: 8px;
  font-size: 14px;
  color: #4a5568;
}

.btn-suggestion {
  background: #42b883;
  color: #ffffff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.btn-suggestion:hover {
  background: #3aa876;
}

.coords {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  font-size: 14px;
  color: #4a5568;
}

.coords div {
  display: flex;
  gap: 6px;
}

.coords dt {
  font-weight: 600;
}
</style>
