<script setup lang="ts">
import { computed, ref } from 'vue'
import { isAxiosError } from 'axios'
import LocationPicker from '@/components/LocationPicker.vue'
import api from '@/composables/useApi'
import type { DeliveryLocation } from '@/types/location'

const props = defineProps<{
  orderId: string
}>()

const MAX_ADDRESS_LENGTH = 1000

const deliveryAddress = ref('')
const deliveryLatitude = ref<number | null>(null)
const deliveryLongitude = ref<number | null>(null)

interface FormErrors {
  address?: string
  location?: string
  form?: string
}

const errors = ref<FormErrors>({})
const hasTriedSubmit = ref(false)
const isSubmitting = ref(false)
const successMessage = ref('')

// decimal(10, 7) in the database, so send at most 7 decimals
function roundCoordinate(value: number): number {
  return Number(value.toFixed(7))
}

const payload = computed(() => ({
  address: deliveryAddress.value.trim(),
  latitude: deliveryLatitude.value === null ? null : roundCoordinate(deliveryLatitude.value),
  longitude: deliveryLongitude.value === null ? null : roundCoordinate(deliveryLongitude.value),
}))

function validateDeliveryLocation(): boolean {
  const nextErrors: FormErrors = {}
  const { address, latitude, longitude } = payload.value

  if (!address) {
    nextErrors.address = 'Please enter your delivery address.'
  } else if (address.length > MAX_ADDRESS_LENGTH) {
    nextErrors.address = `The delivery address must be ${MAX_ADDRESS_LENGTH} characters or fewer.`
  }

  if (latitude === null || longitude === null) {
    nextErrors.location =
      'Please select your delivery location on the map, or use your current location.'
  } else if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    nextErrors.location = 'Latitude must be between -90 and 90. Please select the location again.'
  } else if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    nextErrors.location =
      'Longitude must be between -180 and 180. Please select the location again.'
  }

  errors.value = nextErrors
  return Object.keys(nextErrors).length === 0
}

function handleLocationSelected(location: DeliveryLocation) {
  deliveryAddress.value = location.address
  deliveryLatitude.value = location.latitude
  deliveryLongitude.value = location.longitude
  successMessage.value = ''

  // After a failed submit, clear each message as soon as the customer fixes it
  if (hasTriedSubmit.value) {
    validateDeliveryLocation()
  }
}

function firstMessage(messages: unknown): string | undefined {
  return Array.isArray(messages) && typeof messages[0] === 'string' ? messages[0] : undefined
}

function applyServerErrors(error: unknown) {
  if (!isAxiosError(error) || !error.response) {
    errors.value = {
      form: 'Could not reach the server. Please check your connection and try again.',
    }
    return
  }

  const { status, data } = error.response
  if (status === 422) {
    const fieldErrors = data?.errors ?? {}
    errors.value = {
      address: firstMessage(fieldErrors.address),
      location: firstMessage(fieldErrors.latitude) ?? firstMessage(fieldErrors.longitude),
      form: data?.message,
    }
  } else if (status === 404) {
    errors.value = { form: 'This order could not be found.' }
  } else if (status === 401 || status === 403) {
    errors.value = { form: 'You are not allowed to update this order. Please sign in again.' }
  } else {
    errors.value = {
      form: 'Something went wrong while saving your delivery location. Please try again.',
    }
  }
}

async function placeOrder() {
  hasTriedSubmit.value = true
  successMessage.value = ''
  if (!validateDeliveryLocation()) return

  isSubmitting.value = true
  try {
    const { data } = await api.post(
      `/api/orders/${encodeURIComponent(props.orderId)}/location`,
      payload.value,
    )
    successMessage.value = data?.message ?? 'Delivery location saved.'
  } catch (error) {
    applyServerErrors(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="checkout-page">
    <header class="checkout-header">
      <h1>Checkout</h1>
      <p>Order #{{ props.orderId }}: tell us where to send the technician.</p>
    </header>

    <form class="checkout-card" novalidate @submit.prevent="placeOrder">
      <LocationPicker
        :address-error="errors.address"
        :location-error="errors.location"
        @location-selected="handleLocationSelected"
      />

      <p v-if="errors.form" class="form-error" role="alert">{{ errors.form }}</p>
      <p v-if="successMessage" class="form-success" role="status">{{ successMessage }}</p>

      <button type="submit" class="btn-place-order" :disabled="isSubmitting">
        {{ isSubmitting ? 'Placing order...' : 'Continue / Place Order' }}
      </button>
    </form>

    <section class="debug-panel">
      <h2>Debug: values the checkout will send</h2>
      <dl>
        <div>
          <dt>deliveryAddress</dt>
          <dd>{{ deliveryAddress || '(empty)' }}</dd>
        </div>
        <div>
          <dt>deliveryLatitude</dt>
          <dd>{{ deliveryLatitude ?? 'null' }}</dd>
        </div>
        <div>
          <dt>deliveryLongitude</dt>
          <dd>{{ deliveryLongitude ?? 'null' }}</dd>
        </div>
      </dl>
      <pre>
POST /api/orders/{{ props.orderId }}/location
{{ JSON.stringify(payload, null, 2) }}</pre>
    </section>
  </div>
</template>

<style scoped>
.checkout-page {
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.checkout-header h1 {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 6px;
}

.checkout-header p {
  color: #4a5568;
}

.checkout-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.btn-place-order {
  align-self: stretch;
  background: linear-gradient(135deg, #42b883 0%, #3aa876 100%);
  color: #ffffff;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font: inherit;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
}

.btn-place-order:disabled {
  opacity: 0.7;
  cursor: progress;
}

.form-error {
  color: #e53e3e;
  font-size: 14px;
}

.form-success {
  color: #2f855a;
  background: #f0fdf4;
  border: 1px solid #c6f6d5;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
}

.debug-panel {
  background: #f7fafc;
  border: 1px dashed #cbd5e0;
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 14px;
  color: #4a5568;
}

.debug-panel h2 {
  font-size: 15px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.debug-panel dl div {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.debug-panel dt {
  font-weight: 600;
  min-width: 150px;
}

.debug-panel dd {
  word-break: break-word;
}

.debug-panel pre {
  margin-top: 12px;
  padding: 12px;
  background: #2c3e50;
  color: #f7fafc;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 13px;
}
</style>
