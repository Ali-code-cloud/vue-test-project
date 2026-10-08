<template>
  <div class="cart-page-container">
    <div class="cart-wrapper">
      <!-- Page header -->
      <div class="cart-top-bar">
        <BackButton fallback="/services" label="Back to Services" />
        <div class="cart-heading">
          <h1 class="cart-page-title">Checkout</h1>
          <p class="cart-page-subtitle">Pick a time, set your location and confirm your booking.</p>
        </div>
      </div>

      <!-- If Cart is Empty -->
      <div v-if="cartStore.totalCartCount === 0" class="empty-cart-box">
        <div class="empty-icon">🛒</div>
        <h2>Your Cart is Empty</h2>
        <p>You haven't added any home services to your cart yet.</p>
        <button class="btn-browse-services" @click="router.push('/services')">
          Browse AC & Home Services
        </button>
      </div>

      <div v-else class="checkout-grid">
        <!-- Left Column -->
        <div class="checkout-left-col">
          <!-- 1. Items -->
          <div class="checkout-section-box">
            <h3 class="checkout-section-title">
              <span class="title-text"><span class="step-no">1</span> Your Services</span>
              <span class="title-meta">{{ cartStore.totalCartCount }} {{ cartStore.totalCartCount === 1 ? 'item' : 'items' }}</span>
            </h3>
            <div class="checkout-items-list">
              <div v-for="item in cartStore.cartItemsList" :key="item.service.id" class="checkout-item-row">
                <img :src="getImageUrl(item.service.image)" class="checkout-item-img" alt="" />

                <div class="checkout-item-details">
                  <h4>{{ item.service.name }}</h4>
                  <div class="checkout-item-price">
                    <span v-if="Number(item.service.original_price) > Number(item.service.discounted_price)" class="old-price">
                      Rs {{ Math.round(Number(item.service.original_price)) }}
                    </span>
                    <span class="new-price">Rs {{ Math.round(Number(item.service.discounted_price)) }}</span>
                  </div>
                </div>

                <!-- Stepper [- 1 +] -->
                <div class="stepper-box">
                  <button class="btn-step" type="button" aria-label="Decrease quantity"
                    @click="cartStore.decrementFromCart(item.service.id)">−</button>
                  <span class="step-count">{{ item.quantity }}</span>
                  <button class="btn-step" type="button" aria-label="Increase quantity"
                    @click="cartStore.addToCart(item.service)">+</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Select Date and Time -->
          <div class="checkout-section-box">
            <h3 class="checkout-section-title">
              <span class="title-text"><span class="step-no">2</span> Date &amp; Time</span>
              <span class="title-meta">{{ monthLabel }}</span>
            </h3>

            <!-- Days Selector Strip: today + the next 13 days -->
            <div class="days-slider">
              <button v-for="day in calendarDays" :key="day.iso" type="button" class="day-pill"
                :class="{ active: cartStore.selectedDate === day.iso }" :disabled="!hasOpenSlot(day.iso)"
                @click="selectDate(day.iso)">
                <span class="day-name">{{ day.dayName }}</span>
                <span class="day-num">{{ day.dateNum }}</span>
              </button>
            </div>

            <!-- Time Slots Grid: slots that have passed today are disabled -->
            <div class="time-slots-grid">
              <button v-for="time in timeSlots" :key="time" type="button" class="time-pill"
                :class="{ active: cartStore.selectedTimeSlot === time }"
                :disabled="isSlotPast(cartStore.selectedDate, time)" @click="cartStore.selectedTimeSlot = time">
                {{ time }}
              </button>
            </div>
          </div>

          <!-- 3. Service Location (live GPS or manual address) -->
          <CheckoutLocation :step="3" />

          <!-- 4. Problem details (optional) -->
          <div class="checkout-section-box">
            <h3 class="checkout-section-title">
              <span class="title-text"><span class="step-no">4</span> Problem Details</span>
              <span class="title-meta">Optional</span>
            </h3>

            <div class="problem-details">
              <div class="upload-box" role="button" tabindex="0" aria-label="Add a photo of the problem"
                @click="triggerImageUpload" @keydown.enter.prevent="triggerImageUpload">
                <input type="file" ref="fileInput" class="hidden-file-input" @change="onFileSelected" accept="image/*" />
                <img v-if="cartStore.uploadedPreview" :src="cartStore.uploadedPreview" class="preview-img"
                  alt="Problem photo" />
                <div v-else class="upload-placeholder">
                  <span class="plus-large">+</span>
                  <span class="upload-label">Add photo</span>
                </div>
              </div>

              <textarea v-model="cartStore.problemMessage" rows="3" class="problem-textarea"
                placeholder="Describe the problem, e.g. AC is not cooling and makes noise."></textarea>
            </div>
          </div>
        </div>

        <!-- Right Column: order summary, stays in view while scrolling -->
        <div class="checkout-right-col">
          <div class="billing-card">
            <h3 class="billing-title">Order Summary</h3>

            <div v-for="item in cartStore.cartItemsList" :key="item.service.id" class="billing-row">
              <span class="billing-item-name">{{ item.service.name }} <em>× {{ item.quantity }}</em></span>
              <span>Rs {{ Math.round(Number(item.service.discounted_price)) * item.quantity }}</span>
            </div>

            <div class="billing-divider"></div>

            <div class="billing-row">
              <span>Booking</span>
              <span class="bold-text">{{ bookingSummary }}</span>
            </div>
            <div class="billing-row">
              <span>Payment</span>
              <span class="cash-badge">Cash on service</span>
            </div>

            <div class="billing-divider"></div>

            <div class="billing-row total-row">
              <span>Total</span>
              <span class="total-price-text">Rs {{ cartStore.totalCartPrice }}</span>
            </div>

            <button type="button" class="btn-summary-order blink-anim" :disabled="isPlacingOrder"
              @click="handlePlaceOrder">
              {{ isPlacingOrder ? 'Placing Order...' : 'Place Order' }}
            </button>
            <p class="summary-note">No advance payment. Pay after the work is done.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Place Order bar (tablets and phones, where the summary is below the form) -->
    <transition name="floating-slide">
      <div v-if="cartStore.totalCartCount > 0" class="floating-cart-bar">
        <div class="floating-bar-inner">
          <div class="cart-summary-group">
            <span class="cart-count-badge">{{ cartStore.totalCartCount }}</span>
            <span class="cart-total-text">Rs {{ cartStore.totalCartPrice }}</span>
          </div>

          <button class="btn-place-order blink-anim" :disabled="isPlacingOrder" @click="handlePlaceOrder">
            {{ isPlacingOrder ? 'Placing Order...' : 'Place Order' }}
          </button>
        </div>
      </div>
    </transition>

    <!-- Success Modal -->
    <div v-if="cartStore.showSuccessModal" class="modal-overlay">
      <div class="success-modal-card">
        <div class="success-icon-circle">✓</div>
        <h2>Booking Order Confirmed!</h2>
        <p>Your Mr Home Services request has been received. Our team will visit on {{
          formatBookingDate(cartStore.selectedDate) }}, at {{ cartStore.selectedTimeSlot }}.</p>

        <div class="modal-order-details">
          <p v-if="cartStore.lastOrder?.order_number"><strong>Order #:</strong> {{ cartStore.lastOrder.order_number }}</p>
          <p><strong>Address:</strong> {{ orderAddressText }}</p>
          <p v-if="cartStore.lastOrder?.latitude != null">
            <strong>Location:</strong>
            {{ cartStore.lastOrder.location_source === 'live' ? 'Live GPS' : 'Pin on map' }} ·
            <a :href="`https://www.google.com/maps?q=${cartStore.lastOrder.latitude},${cartStore.lastOrder.longitude}`"
              target="_blank" rel="noopener">Open in Maps</a>
          </p>
          <p><strong>Total Amount:</strong> Rs {{ Math.round(Number(cartStore.lastOrder?.total_amount ?? 0)) }}</p>
          <p><strong>Payment:</strong> Cash on Delivery</p>
        </div>

        <button class="btn-modal-close" @click="finishOrder">
          View Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore, LOCATION_REQUIRED, CheckoutError } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { showPromptAlert, showErrorAlert } from '@/utils/alert'
import CheckoutLocation from '@/components/CheckoutLocation.vue'
import BackButton from '@/components/BackButton.vue'
import { useBookingSlots, formatBookingDate } from '@/composables/useBookingSlots'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const fileInput = ref<any>(null)
const isPlacingOrder = ref(false)
const orderError = ref('')

const { calendarDays, timeSlots, monthLabel, isSlotPast, hasOpenSlot, selectDate, ensureValidSelection } = useBookingSlots()

function getImageUrl(imagePath?: string | null): string {
  if (!imagePath) return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80'
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath
  return `http://127.0.0.1:8001/storage/${imagePath.replace(/^\//, '')}`
}

// "Thu, 8 Oct · 11:00 AM" for the order summary
const bookingSummary = computed(() => {
  if (!cartStore.selectedDate) return 'Choose a time'
  const date = new Date(`${cartStore.selectedDate}T00:00:00`)
  const day = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  return cartStore.selectedTimeSlot ? `${day} · ${cartStore.selectedTimeSlot}` : day
})

// Address line for the success modal, from the order the backend saved
const orderAddressText = computed(() => {
  const o = cartStore.lastOrder
  if (!o) return cartStore.selectedAddress
  return [o.address, o.town, o.city].filter(Boolean).join(', ')
})

const triggerImageUpload = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const onFileSelected = (e: any) => {
  const file = e.target.files[0]
  if (file) {
    cartStore.uploadedPreview = URL.createObjectURL(file)
  }
}

const handlePlaceOrder = async () => {
  orderError.value = ''
  if (!authStore.isAuthenticated) {
    cartStore.openAuthModal()
    return
  }

  // The chosen slot may have passed while the page was open
  if (isSlotPast(cartStore.selectedDate, cartStore.selectedTimeSlot)) {
    ensureValidSelection()
    showErrorAlert('Time Slot Passed', `That time is no longer available. We picked the next open slot: ${formatBookingDate(cartStore.selectedDate)}, ${cartStore.selectedTimeSlot}. Please check it and place the order again.`)
    return
  }

  // Location is required: live GPS or a pin on the map
  if (!cartStore.orderLocation) {
    showLocationError(LOCATION_REQUIRED)
    return
  }

  if (!cartStore.selectedAddress.trim()) {
    cartStore.addressError = 'Please enter your house, flat or street address.'
    const field = document.getElementById('checkout-address')
    field?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    field?.focus({ preventScroll: true })
    return
  }

  const userPhone = (authStore.user?.phone || cartStore.userPhoneNumber || '').trim()
  if (!userPhone) {
    const result = await showPromptAlert('Phone Number Required', 'Please confirm your phone number before placing an order:', cartStore.userPhoneNumber)
    if (result.isConfirmed && result.value && result.value.trim()) {
      cartStore.userPhoneNumber = result.value.trim()
    } else {
      await showErrorAlert('Phone Required', 'Phone number is required. Please confirm your phone number before placing an order.')
      return
    }
  }

  isPlacingOrder.value = true
  try {
    await cartStore.placeOrder()
  } catch (err: any) {
    orderError.value = err.message || 'Failed to place order. Please try again.'
    const fields: Record<string, string> = err instanceof CheckoutError ? err.fields : {}

    // 401: the sign-in popup is already open and the cart is kept
    if (cartStore.showAuthModal) return

    // 422 on latitude / longitude / location_source: ask for the location again on the card
    const locationMsg = fields.latitude || fields.longitude || fields.location_source
    if (locationMsg) {
      cartStore.orderLocation = null
      showLocationError(locationMsg)
      return
    }

    // 422 on address: show it under the address field
    if (fields.address) {
      cartStore.addressError = fields.address
      const field = document.getElementById('checkout-address')
      field?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      field?.focus({ preventScroll: true })
      return
    }

    await showErrorAlert('Order Placement Failed', orderError.value)
  } finally {
    isPlacingOrder.value = false
  }
}

function showLocationError(message: string) {
  cartStore.locationError = message
  document.getElementById('checkout-location')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const finishOrder = () => {
  cartStore.showSuccessModal = false
  router.push('/dashboard')
}
</script>

<style scoped>
/* The layout already adds the page gutter, so only room for the floating bar is added here */
.cart-page-container {
  padding-bottom: 80px;
}

.cart-wrapper {
  max-width: 1160px;
  margin: 0 auto;
}

.cart-top-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.cart-heading {
  min-width: 0;
}

.cart-page-title {
  font-size: 26px;
  font-weight: 800;
  color: #0F172A;
  margin: 0;
  line-height: 1.2;
}

.cart-page-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: #64748B;
}

.empty-cart-box {
  text-align: center;
  padding: 72px 20px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
}

.empty-icon {
  font-size: 54px;
  margin-bottom: 16px;
}

.empty-cart-box h2 {
  font-size: 24px;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 8px;
}

.empty-cart-box p {
  color: #64748B;
  margin-bottom: 24px;
}

.btn-browse-services {
  background: #1A56DB;
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 24px;
  font-weight: 700;
  cursor: pointer;
}

/* Two columns: form on the left, order summary on the right */
.checkout-grid {
  display: grid;
  /* minmax(0, …) stops the wide date strip from stretching the columns past the screen */
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 24px;
  align-items: start;
}

.checkout-left-col,
.checkout-right-col {
  min-width: 0;
}

.checkout-right-col {
  position: sticky;
  top: 96px;
}

/* Every card on the page (the location card is the root of CheckoutLocation and gets this too) */
.checkout-section-box {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 22px 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.checkout-section-title {
  font-size: 17px;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.title-text {
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

/* Numbered step badge, also used in the CheckoutLocation title */
:deep(.step-no) {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #EFF4FF;
  color: #1A56DB;
  font-size: 13px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.title-meta {
  font-size: 13px;
  font-weight: 600;
  color: #64748B;
  white-space: nowrap;
}

/* Days Slider Strip */
.days-slider {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 6px;
  margin-bottom: 14px;
  scrollbar-width: thin;
}

.day-pill {
  min-width: 58px;
  padding: 8px 6px;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  background: #FFFFFF;
  color: #0F172A;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.15s ease;
}

.day-pill:hover:not(:disabled):not(.active) {
  border-color: #93B4F5;
  background: #F5F8FF;
}

.day-pill.active {
  background: #1A56DB;
  color: white;
  border-color: #1A56DB;
  box-shadow: 0 4px 10px rgba(26, 86, 219, 0.25);
}

.day-name {
  font-size: 11px;
  font-weight: 600;
  color: #64748B;
}

.day-pill.active .day-name {
  color: rgba(255, 255, 255, 0.85);
}

.day-num {
  font-size: 17px;
  font-weight: 800;
}

/* Time Slots */
.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 8px;
}

.time-pill {
  padding: 10px 4px;
  border-radius: 10px;
  border: 1px solid #E2E8F0;
  background: #FFFFFF;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s ease;
}

.time-pill:hover:not(:disabled):not(.active) {
  border-color: #93B4F5;
  background: #F5F8FF;
}

.time-pill.active {
  background: #1A56DB;
  color: white;
  border-color: #1A56DB;
}

/* Slots that have passed today (and days with none left) */
.time-pill:disabled,
.day-pill:disabled {
  background: #F8FAFC;
  border-color: #EEF2F6;
  color: #CBD5E1;
  cursor: not-allowed;
  text-decoration: line-through;
}

.day-pill:disabled .day-name {
  color: #CBD5E1;
}

/* Checkout Items */
.checkout-items-list {
  display: flex;
  flex-direction: column;
}

.checkout-item-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border-top: 1px solid #F1F5F9;
}

.checkout-item-row:first-child {
  border-top: none;
  padding-top: 0;
}

.checkout-item-row:last-child {
  padding-bottom: 0;
}

.checkout-item-img {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.checkout-item-details {
  flex: 1;
  min-width: 0;
}

.checkout-item-details h4 {
  font-size: 15px;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 4px;
  line-height: 1.3;
}

.old-price {
  font-size: 13px;
  color: #94A3B8;
  text-decoration: line-through;
  margin-right: 6px;
}

.new-price {
  font-size: 14px;
  font-weight: 800;
  color: #1A56DB;
}

/* Stepper [- 1 +] */
.stepper-box {
  display: flex;
  align-items: center;
  border: 1px solid #DBE4F3;
  border-radius: 999px;
  padding: 3px;
  flex-shrink: 0;
}

.btn-step {
  background: #EFF4FF;
  border: none;
  color: #1A56DB;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.btn-step:hover {
  background: #1A56DB;
  color: #FFFFFF;
}

.step-count {
  min-width: 30px;
  text-align: center;
  font-size: 15px;
  font-weight: 800;
  color: #0F172A;
}

/* Problem details: photo tile + description */
.problem-details {
  display: flex;
  gap: 14px;
  align-items: stretch;
}

.upload-box {
  width: 92px;
  min-height: 92px;
  background: #F8FAFC;
  border: 2px dashed #CBD5E1;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
  transition: border-color 0.15s, background 0.15s;
}

.upload-box:hover,
.upload-box:focus-visible {
  border-color: #1A56DB;
  background: #F5F8FF;
  outline: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: #64748B;
}

.hidden-file-input {
  display: none;
}

.plus-large {
  font-size: 24px;
  line-height: 1;
}

.upload-label {
  font-size: 12px;
  font-weight: 600;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.problem-textarea {
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid #CBD5E1;
  border-radius: 12px;
  padding: 12px 14px;
  font-family: inherit;
  font-size: 14px;
  color: #0F172A;
  outline: none;
  resize: vertical;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.problem-textarea:focus {
  border-color: #1A56DB;
  box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.12);
}

/* Order summary */
.billing-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 22px 24px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.billing-title {
  font-size: 17px;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 16px;
}

.billing-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  color: #475569;
  margin-bottom: 10px;
}

.billing-row span:last-child {
  text-align: right;
  white-space: nowrap;
}

.billing-item-name em {
  font-style: normal;
  color: #94A3B8;
  white-space: nowrap;
}

.billing-divider {
  height: 1px;
  background: #E2E8F0;
  margin: 14px 0;
}

.bold-text {
  font-weight: 700;
  color: #0F172A;
}

.cash-badge {
  font-weight: 700;
  color: #15803D;
}

.total-row {
  align-items: center;
  font-size: 16px;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 18px;
}

.total-price-text {
  color: #0F172A;
  font-size: 22px;
  font-weight: 800;
}

.btn-summary-order {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #1A56DB 0%, #1E40AF 100%);
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(26, 86, 219, 0.3);
  transition: transform 0.15s, box-shadow 0.15s;
}

.btn-summary-order:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(26, 86, 219, 0.35);
}

.btn-summary-order:disabled {
  opacity: 0.7;
  cursor: wait;
}

.summary-note {
  margin: 10px 0 0;
  text-align: center;
  font-size: 12px;
  color: #64748B;
}

/* Floating Place Order bar: only where the summary is not beside the form */
.floating-cart-bar {
  display: none;
  position: fixed;
  left: 20px;
  right: 20px;
  bottom: 20px;
  z-index: 1050;
}

.floating-bar-inner {
  max-width: 560px;
  margin: 0 auto;
  background: linear-gradient(135deg, #1A56DB 0%, #1E40AF 100%);
  color: white;
  border-radius: 14px;
  padding: 8px 8px 8px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 10px 30px rgba(26, 86, 219, 0.4);
}

.cart-summary-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cart-count-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.8);
  min-width: 24px;
  height: 24px;
  padding: 0 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
}

.cart-total-text {
  font-size: 16px;
  font-weight: 800;
}

.btn-place-order {
  background: #FFFFFF;
  color: #1A56DB;
  border: none;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 10px;
}

/* Blink: the label fades in and out and the button glows, to draw attention to placing the order */
.blink-anim:not(:disabled) {
  animation: blinkGlow 1.2s ease-in-out infinite;
}

.btn-place-order.blink-anim:not(:disabled) {
  animation: blinkText 1.2s ease-in-out infinite;
}

.floating-bar-inner:has(.blink-anim:not(:disabled)) {
  animation: blinkGlow 1.2s ease-in-out infinite;
}

@keyframes blinkText {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

@keyframes blinkGlow {
  0%, 100% { box-shadow: 0 8px 20px rgba(26, 86, 219, 0.3), 0 0 0 0 rgba(59, 130, 246, 0.55); }
  50% { box-shadow: 0 8px 20px rgba(26, 86, 219, 0.3), 0 0 0 8px rgba(59, 130, 246, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .blink-anim:not(:disabled),
  .btn-place-order.blink-anim:not(:disabled),
  .floating-bar-inner:has(.blink-anim) {
    animation: none;
  }
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.success-modal-card {
  background: white;
  border-radius: 24px;
  padding: 36px 28px;
  max-width: 440px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.success-icon-circle {
  width: 64px;
  height: 64px;
  background: #DCFCE7;
  color: #16A34A;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  margin: 0 auto 16px;
}

.success-modal-card h2 {
  font-size: 22px;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 8px;
}

.success-modal-card p {
  font-size: 14px;
  color: #64748B;
  line-height: 1.5;
  margin-bottom: 20px;
}

.modal-order-details {
  background: #F8FAFC;
  padding: 14px;
  border-radius: 12px;
  margin-bottom: 24px;
  text-align: left;
}

.btn-modal-close {
  background: #1A56DB;
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
}

/* Tablets and phones: one column, summary under the form, floating bar for the order button */
@media (max-width: 960px) {
  .checkout-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }

  .checkout-right-col {
    position: static;
  }

  .btn-summary-order {
    display: none;
  }

  .floating-cart-bar {
    display: block;
  }
}

@media (max-width: 600px) {
  .cart-page-container {
    padding-bottom: 150px;
  }

  .cart-top-bar {
    gap: 12px;
    margin-bottom: 16px;
    padding-right: 52px; /* keeps the subtitle clear of the floating WhatsApp button */
  }

  .cart-page-title {
    font-size: 21px;
  }

  .cart-page-subtitle {
    font-size: 13px;
  }

  .checkout-section-box,
  .billing-card {
    padding: 16px 14px;
    border-radius: 14px;
    margin-bottom: 14px;
  }

  .checkout-section-title {
    font-size: 16px;
  }

  .days-slider {
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .days-slider::-webkit-scrollbar {
    display: none;
  }

  .day-pill {
    min-width: 52px;
  }

  .time-slots-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .checkout-item-row {
    gap: 10px;
  }

  .checkout-item-img {
    width: 48px;
    height: 48px;
    border-radius: 10px;
  }

  .checkout-item-details h4 {
    font-size: 14px;
  }

  .btn-step {
    width: 28px;
    height: 28px;
  }

  .step-count {
    min-width: 26px;
  }

  .problem-details {
    flex-direction: column;
  }

  .upload-box {
    width: 100%;
    min-height: 72px;
  }

  .upload-placeholder {
    flex-direction: row;
    gap: 8px;
  }

  .problem-textarea {
    font-size: 16px; /* 16px keeps iOS from zooming in on focus */
  }

  .billing-row {
    font-size: 13px;
  }

  .floating-cart-bar {
    left: 12px;
    right: 12px;
  }
}

/* Sit above the fixed bottom menu bar (64px tall, shown at 768px and below) */
@media (max-width: 768px) {
  .floating-cart-bar {
    bottom: calc(76px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
