<template>
  <div ref="mapEl" class="location-map"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type LatLng = { latitude: number; longitude: number }

const props = defineProps<{
  /** The pin; null shows the map without one */
  modelValue: LatLng | null
  /** Where to look when there is no pin yet */
  center: LatLng
}>()

const emit = defineEmits<{
  /** The customer tapped the map or dragged the pin */
  (e: 'pick', value: LatLng): void
}>()

const mapEl = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null

// CSS pin instead of Leaflet's default image icon (its image paths break under Vite)
const pinIcon = L.divIcon({
  className: 'map-pin',
  html: '<span class="map-pin-head"></span>',
  iconSize: [30, 40],
  iconAnchor: [15, 40]
})

const round = (n: number) => Number(n.toFixed(7))

function pick(latlng: L.LatLng) {
  emit('pick', { latitude: round(latlng.lat), longitude: round(latlng.lng) })
}

function syncMarker(value: LatLng | null, pan: boolean) {
  if (!map) return
  if (!value) {
    marker?.remove()
    marker = null
    return
  }
  const pos = L.latLng(value.latitude, value.longitude)
  if (!marker) {
    marker = L.marker(pos, { icon: pinIcon, draggable: true, autoPan: true }).addTo(map)
    marker.on('dragend', () => marker && pick(marker.getLatLng()))
  } else {
    marker.setLatLng(pos)
  }
  if (pan) map.setView(pos, Math.max(map.getZoom(), 16))
}

onMounted(() => {
  if (!mapEl.value) return
  const start = props.modelValue || props.center
  map = L.map(mapEl.value, { zoomControl: true, attributionControl: true })
    .setView([start.latitude, start.longitude], props.modelValue ? 16 : 12)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)
  map.on('click', (e: L.LeafletMouseEvent) => pick(e.latlng))
  syncMarker(props.modelValue, false)
})

// New pin from outside (e.g. live GPS): move the marker and show it
watch(() => props.modelValue, (value, old) => {
  const moved = !old || !value || old.latitude !== value.latitude || old.longitude !== value.longitude
  if (moved) syncMarker(value, true)
})

// Different city picked while there is no pin yet: look there instead
watch(() => props.center, (c) => {
  if (map && !props.modelValue) map.setView([c.latitude, c.longitude], 12)
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
  marker = null
})
</script>

<style scoped>
.location-map {
  width: 100%;
  height: 260px;
  border-radius: 12px;
  overflow: hidden;
  z-index: 0;
}

/* The pin is created by Leaflet outside this component's scope */
.location-map :deep(.map-pin) {
  background: none;
  border: none;
}

.location-map :deep(.map-pin-head) {
  position: absolute;
  left: 3px;
  top: 0;
  width: 24px;
  height: 24px;
  border-radius: 50% 50% 50% 0;
  background: #1A56DB;
  border: 3px solid #FFFFFF;
  box-shadow: 0 3px 8px rgba(15, 23, 42, 0.35);
  transform: rotate(-45deg);
  transform-origin: center;
  margin-top: 4px;
}

.location-map :deep(.map-pin-head)::after {
  content: '';
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  background: #FFFFFF;
}

@media (max-width: 600px) {
  .location-map {
    height: 220px;
  }
}
</style>
