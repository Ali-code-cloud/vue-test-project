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
      {{ isLocating ? 'Getting your location...' : 'Use my current location' }}
    </button>

    <div v-else class="map-wrap">
      <p class="map-hint">
        {{ cartStore.orderLocation
          ? 'Drag the pin or tap the map if it is not exactly at your home.'
          : 'Tap the map to drop a pin on your home. You can drag it to adjust.' }}
      </p>
      <LocationMap :model-value="cartStore.orderLocation" :center="mapCenter" @pick="onPick" />
      <div v-if="cartStore.orderLocation" class="map-footer">
        <span class="coords">{{ coordsText }}</span>
        <div class="map-actions">
          <a :href="mapsLink" target="_blank" rel="noopener" class="map-link">Open in Maps</a>
          <button type="button" class="map-action" :disabled="isLocating" @click="locate">
            {{ isLocating ? 'Locating...' : 'Use GPS' }}
          </button>
          <button type="button" class="map-action danger" @click="clearLocation">Remove</button>
        </div>
      </div>
    </div>

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
import { ref, computed, onMounted, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useCities } from '@/composables/useCities'
import LocationMap from '@/components/LocationMap.vue'

// Optional step number shown before the title (the cart page numbers its sections)
defineProps<{ step?: number }>()

const cartStore = useCartStore()
const authStore = useAuthStore()
const { cities, isLoading: citiesLoading } = useCities()

const isLocating = ref(false)
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

const mapsLink = computed(() => {
  const loc = cartStore.orderLocation
  return loc ? `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}` : '#'
})

onMounted(() => {
  // Start from the address saved on the profile
  if (!cartStore.selectedAddress.trim() && authStore.user?.address) {
    cartStore.selectedAddress = authStore.user.address
  }
})

// Any location clears the "location required" error
watch(() => cartStore.orderLocation, (loc) => {
  if (loc) {
    cartStore.locationError = ''
    locationNotice.value = ''
  }
})

function locate() {
  locationNotice.value = ''
  if (!navigator.geolocation || !window.isSecureContext) {
    locationNotice.value = 'Live location is not available in this browser. Please pin your address on the map.'
    cartStore.locationMode = 'manual'
    return
  }
  isLocating.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      isLocating.value = false
      cartStore.locationMode = 'live'
      cartStore.orderLocation = {
        latitude: Number(pos.coords.latitude.toFixed(7)),
        longitude: Number(pos.coords.longitude.toFixed(7)),
        source: 'live'
      }
    },
    (err) => {
      isLocating.value = false
      // Denied or timed out: let the customer pin it on the map instead
      locationNotice.value = err.code === err.PERMISSION_DENIED
        ? 'Could not read your live location. Please allow location access or pin your address on the map.'
        : 'Could not get your location right now. Please try again or pin your address on the map.'
      if (!cartStore.orderLocation) cartStore.locationMode = 'manual'
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  )
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
