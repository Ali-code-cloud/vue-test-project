<template>
  <div id="checkout-location" class="checkout-section-box location-card" :class="{ 'location-card-error': cartStore.locationError }">
    <div class="location-card-head">
      <h3 class="location-card-title"><span v-if="step" class="step-no">{{ step }}</span> Service Location <em>*</em></h3>
      <span v-if="cartStore.orderLocation?.source === 'live'" class="location-badge live">● Live GPS</span>
      <span v-else-if="cartStore.orderLocation" class="location-badge pinned">📍 Pinned on map</span>
      <span v-else class="location-badge required">Required</span>
    </div>

    <!-- Live / Pin on map toggle -->
    <div class="mode-toggle" role="tablist">
      <button type="button" role="tab" class="mode-btn" :class="{ active: cartStore.locationMode === 'live' }"
        :aria-selected="cartStore.locationMode === 'live'" @click="selectLive">
        📍 Current location
      </button>
      <button type="button" role="tab" class="mode-btn" :class="{ active: cartStore.locationMode === 'manual' }"
        :aria-selected="cartStore.locationMode === 'manual'" @click="selectManual">
        🗺️ Pin on map
      </button>
    </div>

    <!-- Live: ask for GPS first, then show it on the map -->
    <button v-if="cartStore.locationMode === 'live' && !cartStore.orderLocation" type="button" class="btn-locate"
      :disabled="isLocating" @click="locate">
      <span class="locate-icon">{{ isLocating ? '⏳' : '📍' }}</span>
      {{ isLocating ? 'Finding your exact location...' : 'Use my current location' }}
    </button>

    <div v-else class="map-wrap">
      <p class="map-hint">
        {{ cartStore.orderLocation
          ? 'Drag the pin or tap the map if it is not exactly at your home.'
          : 'Tap the map to drop a pin on your home. You can drag it to adjust.' }}
      </p>
      <LocationMap :model-value="cartStore.orderLocation" :center="mapCenter" :accuracy="liveAccuracy" @pick="onPick" />
      <div v-if="cartStore.orderLocation" class="map-footer">
        <span class="coords">{{ coordsText }}<template v-if="liveAccuracy"> · accurate to {{ formatAccuracy(liveAccuracy) }}</template></span>
        <div class="map-actions">
          <a :href="mapsLink" target="_blank" rel="noopener" class="map-link">Open in Maps</a>
          <button type="button" class="map-action" :disabled="isLocating" @click="locate">
            {{ isLocating ? 'Locating...' : 'Use GPS' }}
          </button>
          <button type="button" class="map-action danger" @click="clearLocation">Remove</button>
        </div>
      </div>
    </div>

    <!-- GPS readings get better over a few seconds; show progress and let the customer stop early -->
    <p v-if="isLocating" class="locate-progress">
      <span>{{ bestAccuracy ? `Improving accuracy... currently ±${formatAccuracy(bestAccuracy)}` : 'Waiting for your device location...' }}</span>
      <button v-if="bestAccuracy" type="button" class="map-action" @click="finishLocating">Use this location</button>
    </p>

    <p v-if="accuracyNote" class="accuracy-note">{{ accuracyNote }}</p>

    <p v-if="isGeocoding" class="address-hint">Finding your address...</p>
    <p v-else-if="addressFilled" class="address-hint filled">Address filled from your location. Please add your house number if it is missing.</p>
    <p v-else-if="geocodeFailed" class="address-hint">We could not find the address for this location. Please type it below.</p>

    <p v-if="locationNotice" class="location-error">{{ locationNotice }}</p>
    <p v-else-if="cartStore.locationError" class="location-error">{{ cartStore.locationError }}</p>

    <!-- Address fields (GPS and pins don't give the house number) -->
    <div class="address-fields">
      <label class="field field-full">
        <span class="field-label">House / Flat / Street <em>*</em></span>
        <input id="checkout-address" v-model="cartStore.selectedAddress" type="text" class="field-input"
          :class="{ invalid: cartStore.addressError }" placeholder="e.g. House 5, Street 2" autocomplete="street-address"
          @input="cartStore.addressError = ''" />
        <span v-if="cartStore.addressError" class="field-error">{{ cartStore.addressError }}</span>
      </label>

      <label class="field">
        <span class="field-label">City</span>
        <select v-model="cartStore.selectedCity" class="field-input">
          <option value="">{{ citiesLoading ? 'Loading cities...' : 'Select city' }}</option>
          <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
        </select>
      </label>

      <label class="field">
        <span class="field-label">Area / Town</span>
        <input v-model="cartStore.selectedTown" type="text" class="field-input" placeholder="e.g. DHA Phase 6"
          autocomplete="address-level3" />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useCities } from '@/composables/useCities'
import LocationMap from '@/components/LocationMap.vue'
import { reverseGeocode } from '@/utils/reverseGeocode'

// Optional step number shown before the title (the cart page numbers its sections)
defineProps<{ step?: number }>()

const cartStore = useCartStore()
const authStore = useAuthStore()
const { cities, isLoading: citiesLoading } = useCities()

const isLocating = ref(false)
// Best (smallest) accuracy radius seen while locating, in metres
const bestAccuracy = ref<number | null>(null)

// Accuracy targets for live location, in metres
const GOOD_ACCURACY = 30 // stop as soon as a reading is this close
const OK_ACCURACY = 100 // good enough once SETTLE_MS has passed
const SETTLE_MS = 5000
const MAX_WAIT_MS = 12000
// Wider than this is a network / IP guess, not GPS (common on computers): ask the customer to move the pin
const APPROXIMATE_ACCURACY = 1000

let watchId: number | null = null
let settleTimer: ReturnType<typeof setTimeout> | undefined
let maxTimer: ReturnType<typeof setTimeout> | undefined
let bestPosition: GeolocationPosition | null = null
// GPS problems (denied, timed out, unsupported); separate from the "location required" error
const locationNotice = ref('')

// Where the map opens before there is a pin: the selected city, else Lahore
const CITY_CENTERS: Record<string, { latitude: number; longitude: number }> = {
  lahore: { latitude: 31.5204, longitude: 74.3587 },
  karachi: { latitude: 24.8607, longitude: 67.0011 },
  islamabad: { latitude: 33.6844, longitude: 73.0479 },
  rawalpindi: { latitude: 33.5651, longitude: 73.0169 },
  faisalabad: { latitude: 31.4504, longitude: 73.135 },
  multan: { latitude: 30.1575, longitude: 71.5249 },
  peshawar: { latitude: 34.0151, longitude: 71.5249 },
  quetta: { latitude: 30.1798, longitude: 66.975 },
  sialkot: { latitude: 32.4945, longitude: 74.5229 },
  gujranwala: { latitude: 32.1877, longitude: 74.1945 }
}
const DEFAULT_CENTER = { latitude: 31.5204, longitude: 74.3587 }

const mapCenter = computed(() => CITY_CENTERS[cartStore.selectedCity.trim().toLowerCase()] || DEFAULT_CENTER)

const coordsText = computed(() => {
  const loc = cartStore.orderLocation
  return loc ? `${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}` : ''
})

/** Accuracy circle only for a live reading; a moved pin is exactly where the customer put it */
const liveAccuracy = computed(() => {
  const loc = cartStore.orderLocation
  return loc?.source === 'live' && loc.accuracy ? loc.accuracy : null
})

function formatAccuracy(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)} m`
  return `${(metres / 1000).toFixed(metres >= 10000 ? 0 : 1)} km`
}

// Only warn when the reading is a rough network / IP guess; normal readings show no message
const accuracyNote = computed(() => {
  const acc = liveAccuracy.value
  if (!acc || isLocating.value || acc <= APPROXIMATE_ACCURACY) return ''
  return `Your device could only find an approximate area (about ${formatAccuracy(acc)} wide). This happens on devices without GPS, such as most computers. Please drag the pin or tap the map on your home, or open this page on your phone for an exact location.`
})

const mapsLink = computed(() => {
  const loc = cartStore.orderLocation
  return loc ? `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}` : '#'
})

// Address auto-fill from the location. Values we filled in (or took from the profile) may be replaced
// by the next lookup; anything the customer typed is left alone.
const isGeocoding = ref(false)
const addressFilled = ref(false)
const geocodeFailed = ref(false)
const autoFilled = { street: '', town: '' }
let geocodeTimer: ReturnType<typeof setTimeout> | undefined
let geocodeAbort: AbortController | null = null

onMounted(() => {
  // Start from the address saved on the profile
  if (!cartStore.selectedAddress.trim() && authStore.user?.address) {
    cartStore.selectedAddress = authStore.user.address
    autoFilled.street = authStore.user.address
  }
})

onBeforeUnmount(() => {
  clearTimeout(geocodeTimer)
  geocodeAbort?.abort()
  stopWatching()
})

// Any location clears the "location required" error and fills the address
watch(() => cartStore.orderLocation, (loc, oldLoc) => {
  if (!loc) return
  cartStore.locationError = ''
  locationNotice.value = ''
  if (oldLoc && oldLoc.latitude === loc.latitude && oldLoc.longitude === loc.longitude) return
  // Wait a moment so dragging the pin does one lookup, not many
  clearTimeout(geocodeTimer)
  // A rough network guess (often the wrong town) would fill in a wrong address; wait for the customer to move the pin
  if (loc.source === 'live' && (loc.accuracy ?? 0) > APPROXIMATE_ACCURACY) {
    addressFilled.value = false
    geocodeFailed.value = false
    return
  }
  geocodeTimer = setTimeout(() => fillAddressFrom(loc.latitude, loc.longitude), 500)
})

async function fillAddressFrom(latitude: number, longitude: number) {
  geocodeAbort?.abort()
  const controller = new AbortController()
  geocodeAbort = controller
  isGeocoding.value = true
  addressFilled.value = false
  geocodeFailed.value = false
  const found = await reverseGeocode(latitude, longitude, controller.signal)
  if (controller.signal.aborted) return
  isGeocoding.value = false
  if (!found) {
    geocodeFailed.value = true
    return
  }

  const canReplace = (current: string, auto: string) => !current.trim() || current.trim() === auto.trim()
  let changed = false

  if (found.street && canReplace(cartStore.selectedAddress, autoFilled.street)) {
    cartStore.selectedAddress = found.street
    autoFilled.street = found.street
    cartStore.addressError = ''
    changed = true
  }
  if (found.town && canReplace(cartStore.selectedTown, autoFilled.town)) {
    cartStore.selectedTown = found.town
    autoFilled.town = found.town
    changed = true
  }
  // Only pick a city we serve (the list comes from the API)
  const city = cities.value.find((c) => c.toLowerCase() === found.city.toLowerCase())
  if (city && cartStore.selectedCity !== city) {
    cartStore.selectedCity = city
    changed = true
  }
  addressFilled.value = changed
}

/**
 * Live location: watch the device position for a few seconds and keep the most accurate reading.
 * The first reading is often a rough network guess; the GPS readings that follow are much closer.
 * maximumAge 0 never reuses an old position.
 */
function locate() {
  locationNotice.value = ''
  // Browsers only share GPS on secure pages (https:// or localhost)
  if (!window.isSecureContext) {
    locationNotice.value = 'Live location only works on a secure (https://) page. Please pin your address on the map.'
    cartStore.locationMode = 'manual'
    return
  }
  if (!navigator.geolocation) {
    locationNotice.value = 'Live location is not available in this browser. Please pin your address on the map.'
    cartStore.locationMode = 'manual'
    return
  }

  stopWatching()
  isLocating.value = true
  bestPosition = null
  bestAccuracy.value = null
  const startedAt = Date.now()

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      if (!bestPosition || pos.coords.accuracy < bestPosition.coords.accuracy) {
        bestPosition = pos
        bestAccuracy.value = pos.coords.accuracy
      }
      if (import.meta.env.DEV) {
        console.info('[location]', pos.coords.latitude, pos.coords.longitude, `±${Math.round(pos.coords.accuracy)} m`)
      }
      const acc = bestPosition.coords.accuracy
      if (acc <= GOOD_ACCURACY || (acc <= OK_ACCURACY && Date.now() - startedAt >= SETTLE_MS)) finishLocating()
    },
    (err) => {
      // A slow reading: keep waiting while there is time left, unless access was refused
      if (err.code !== err.PERMISSION_DENIED && Date.now() - startedAt < MAX_WAIT_MS) return
      if (bestPosition) return finishLocating()
      failLocating(err.code === err.PERMISSION_DENIED
        ? 'Could not read your live location. Please allow location access or pin your address on the map.'
        : 'Could not get your location right now. Please try again or pin your address on the map.')
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: MAX_WAIT_MS }
  )

  settleTimer = setTimeout(() => {
    if (bestPosition && bestPosition.coords.accuracy <= OK_ACCURACY) finishLocating()
  }, SETTLE_MS)
  maxTimer = setTimeout(() => {
    if (bestPosition) finishLocating()
    else failLocating('Could not get your location right now. Please try again or pin your address on the map.')
  }, MAX_WAIT_MS)
}

/** Use the best reading so far (also the "Use this location" button) */
function finishLocating() {
  const pos = bestPosition
  stopWatching()
  isLocating.value = false
  if (!pos) return
  cartStore.locationMode = 'live'
  cartStore.orderLocation = {
    latitude: Number(pos.coords.latitude.toFixed(7)),
    longitude: Number(pos.coords.longitude.toFixed(7)),
    source: 'live',
    accuracy: Math.round(pos.coords.accuracy)
  }
}

/** Denied or no reading: let the customer pin it on the map instead */
function failLocating(message: string) {
  stopWatching()
  isLocating.value = false
  locationNotice.value = message
  if (!cartStore.orderLocation) cartStore.locationMode = 'manual'
}

function stopWatching() {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId)
  watchId = null
  clearTimeout(settleTimer)
  clearTimeout(maxTimer)
}

// Tapping the map or dragging the pin makes it a manual pin
function onPick(value: { latitude: number; longitude: number }) {
  cartStore.orderLocation = { ...value, source: 'manual' }
}

function selectLive() {
  cartStore.locationMode = 'live'
  if (cartStore.orderLocation?.source !== 'live') locate()
}

function selectManual() {
  cartStore.locationMode = 'manual'
  locationNotice.value = ''
}

function clearLocation() {
  cartStore.orderLocation = null
  addressFilled.value = false
  geocodeFailed.value = false
}
</script>

<style scoped>
.location-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.location-card-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 800;
  color: #0F172A;
  margin: 0;
}

.location-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

.location-badge.live {
  background: #ECFDF5;
  color: #047857;
}

.location-badge.pinned {
  background: #EFF4FF;
  color: #1A56DB;
}

.location-badge.required {
  background: #FEF2F2;
  color: #B91C1C;
}

.location-card-title em {
  color: #DC2626;
  font-style: normal;
}

.location-card.location-card-error {
  border-color: #FCA5A5 !important;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.08);
}

/* Address auto-fill status */
.address-hint {
  margin: 10px 0 0;
  font-size: 13px;
  color: #64748B;
}

.address-hint.filled {
  color: #047857;
}

/* Live location progress and accuracy */
.locate-progress {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px 12px;
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #EFF6FF;
  color: #1E40AF;
  font-size: 13px;
}

.accuracy-note {
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.45;
  background: #FFF7ED;
  color: #9A3412;
  border: 1px solid #FED7AA;
}

/* Toggle */
.mode-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 4px;
  background: #F1F5F9;
  border-radius: 12px;
  margin-bottom: 14px;
}

.mode-btn {
  padding: 10px 8px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: #475569;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.mode-btn.active {
  background: #FFFFFF;
  color: #1A56DB;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
}

.btn-locate {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: 1.5px dashed #1A56DB;
  border-radius: 12px;
  background: #EFF6FF;
  color: #1A56DB;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  margin-bottom: 14px;
}

.btn-locate:disabled {
  opacity: 0.75;
  cursor: wait;
}

.map-wrap {
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
  background: #FFFFFF;
  margin-bottom: 14px;
}

.map-wrap :deep(.location-map) {
  border-radius: 0;
}

.map-hint {
  margin: 0;
  padding: 10px 12px;
  font-size: 13px;
  color: #475569;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
}

.map-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  padding: 10px 12px;
}

.coords {
  font-size: 13px;
  color: #475569;
  font-variant-numeric: tabular-nums;
}

.map-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.map-link,
.map-action {
  font-size: 13px;
  font-weight: 700;
  color: #1A56DB;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-decoration: none;
}

.map-action.danger {
  color: #DC2626;
}

.map-action:disabled {
  opacity: 0.6;
  cursor: wait;
}

.location-error {
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #FEF2F2;
  color: #B91C1C;
  font-size: 13px;
}

/* Address fields */
.address-fields {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.field-full {
  grid-column: 1 / -1;
}

.field-label {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
}

.field-label em {
  color: #DC2626;
  font-style: normal;
}

.field-input {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 12px;
  border: 1px solid #CBD5E1;
  border-radius: 10px;
  background: #FFFFFF;
  color: #0F172A;
  font-size: 15px;
  font-family: inherit;
}

.field-input:focus {
  outline: none;
  border-color: #1A56DB;
  box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.15);
}

.field-input.invalid {
  border-color: #DC2626;
}

.field-error {
  font-size: 12px;
  color: #DC2626;
}

@media (max-width: 600px) {
  .location-card-title {
    font-size: 16px;
  }

  .mode-btn {
    font-size: 13px;
  }

  .address-fields {
    grid-template-columns: minmax(0, 1fr);
  }

  /* 16px stops iOS from zooming into the field */
  .field-input {
    font-size: 16px;
  }
}
</style>
