<template>
  <div class="cart-page-container">
    <div class="cart-wrapper">
      <!-- Back Navigation Header -->
      <div class="cart-top-bar">
        <button class="btn-back" @click="goBack">
          ← Back to Services
        </button>
        <h1 class="cart-page-title">Shopping Cart & Checkout</h1>
      </div>

      <!-- If Cart is Empty -->
      <div v-if="cartStore.totalCartCount === 0" class="empty-cart-box">
        <div class="empty-icon">🛒</div>
        <h2>Your Cart is Empty</h2>
        <p>You haven't added any home services to your cart yet.</p>
        <button class="btn-browse-services" @click="router.push('/services/category/4')">
          Browse AC & Home Services
        </button>
      </div>

      <!-- Cart Content Grid (Screenshot 4) -->
      <div v-else class="checkout-grid">
        <!-- Left Column -->
        <div class="checkout-left-col">
          <!-- 1. Select Date and Time -->
          <div class="checkout-section-box">
            <h3 class="checkout-section-title">
              Select Date and Time <span class="month-label">🗓️ August, 2026</span>
            </h3>

            <!-- Days Selector Strip -->
            <div class="days-slider">
              <button 
                v-for="day in calendarDays" 
                :key="day.dateNum" 
                class="day-pill" 
                :class="{ active: cartStore.selectedDateNum === day.dateNum }"
                @click="cartStore.selectedDateNum = day.dateNum"
              >
                <span class="day-num">{{ day.dateNum }}</span>
                <span class="day-name">{{ day.dayName }}</span>
              </button>
            </div>

            <!-- Time Slots Grid -->
            <div class="time-slots-grid">
              <button 
                v-for="time in timeSlots" 
                :key="time" 
                class="time-pill" 
                :class="{ active: cartStore.selectedTimeSlot === time }"
                @click="cartStore.selectedTimeSlot = time"
              >
                {{ time }}
              </button>
            </div>
          </div>

          <!-- 2. Address Card -->
          <div class="checkout-section-box address-box">
            <div class="address-header">
              <div>
                <h4 class="address-title">Address</h4>
                <p class="address-subtitle">{{ cartStore.selectedAddress || 'Please add your address' }}</p>
              </div>
              <button class="btn-add-address" @click="openAddAddressModal">
                Add New ▾
              </button>
            </div>
          </div>

          <!-- 3. Items Section -->
          <div class="checkout-section-box">
            <h3 class="checkout-section-title">Items</h3>
            <div class="checkout-items-list">
              <div 
                v-for="item in cartStore.cartItemsList" 
                :key="item.service.id" 
                class="checkout-item-row"
              >
                <img :src="getImageUrl(item.service.image)" class="checkout-item-img" alt="Service" />
                
                <div class="checkout-item-details">
                  <h4>{{ item.service.name }}</h4>
                  <div class="checkout-item-price">
                    <span v-if="item.service.original_price" class="old-price">
                      Rs:{{ Math.round(Number(item.service.original_price)) }}
                    </span>
                    <span class="new-price">
                      Rs:{{ Math.round(Number(item.service.discounted_price)) }}
                    </span>
                  </div>
                </div>

                <!-- Stepper [- 1 +] -->
                <div class="stepper-box">
                  <button class="btn-step" @click="cartStore.decrementFromCart(item.service.id)">-</button>
                  <span class="step-count">{{ item.quantity }}</span>
                  <button class="btn-step" @click="cartStore.addToCart(item.service)">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="checkout-right-col">
          <!-- 1. Billing Card -->
          <div class="billing-card">
            <h3 class="billing-title">Billing</h3>
            
            <div 
              v-for="item in cartStore.cartItemsList" 
              :key="item.service.id" 
              class="billing-row"
            >
              <span>{{ item.service.name }} (i)</span>
              <span>Rs: {{ Math.round(Number(item.service.discounted_price)) }} X {{ item.quantity }}</span>
            </div>

            <div class="billing-divider"></div>

            <div class="billing-row">
              <span>Amount</span>
              <span class="bold-text">Rs: {{ cartStore.totalCartPrice }}</span>
            </div>

            <div class="billing-divider"></div>

            <div class="billing-row">
              <span>Payment Method</span>
              <span class="cash-badge">💵 Cash</span>
            </div>

            <div class="billing-row total-row">
              <span>Total Price</span>
              <span class="total-price-text">Rs: {{ cartStore.totalCartPrice }}</span>
            </div>
          </div>

          <!-- 2. Problem Image -->
          <div class="upload-section-card">
            <h4 class="upload-title">Problem Image</h4>
            <p class="upload-desc">Add Screenshots</p>
            
            <div class="upload-box" @click="triggerImageUpload">
              <input 
                type="file" 
                ref="fileInput" 
                class="hidden-file-input" 
                @change="onFileSelected" 
                accept="image/*" 
              />
              <div v-if="cartStore.uploadedPreview" class="preview-wrap">
                <img :src="cartStore.uploadedPreview" class="preview-img" alt="Problem Screenshot" />
              </div>
              <div v-else class="upload-placeholder">
                <span class="plus-large">+</span>
              </div>
            </div>
          </div>

          <!-- 3. Additional Information -->
          <div class="additional-info-card">
            <h4 class="info-card-title">Additional Information</h4>
            <textarea 
              v-model="cartStore.problemMessage" 
              rows="4" 
              class="problem-textarea" 
              placeholder="Problem message..."
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Bottom Right Place Order Action Bar (Exact Screenshot 4) -->
    <transition name="floating-slide">
      <div v-if="cartStore.totalCartCount > 0" class="floating-cart-bar">
        <div class="floating-bar-inner">
          <div class="cart-summary-group">
            <span class="cart-count-badge">{{ cartStore.totalCartCount }}</span>
            <span class="cart-total-text">Rs {{ cartStore.totalCartPrice }}</span>
          </div>

          <button class="btn-place-order pulse-anim" @click="handlePlaceOrder">
            Place Order →
          </button>
        </div>
      </div>
    </transition>

    <!-- Success Modal -->
    <div v-if="cartStore.showSuccessModal" class="modal-overlay">
      <div class="success-modal-card">
        <div class="success-icon-circle">✓</div>
        <h2>Booking Order Confirmed!</h2>
        <p>Your Mr Home Services request has been received. Our expert technician will visit on August {{ cartStore.selectedDateNum }}, at {{ cartStore.selectedTimeSlot }}.</p>
        
        <div class="modal-order-details">
          <p><strong>Address:</strong> {{ cartStore.selectedAddress }}</p>
          <p><strong>Total Amount:</strong> Rs {{ cartStore.totalCartPrice }}</p>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const fileInput = ref<any>(null)

const calendarDays = [
  { dateNum: 17, dayName: 'Mon' },
  { dateNum: 18, dayName: 'Tue' },
  { dateNum: 19, dayName: 'Wed' },
  { dateNum: 20, dayName: 'Thu' },
  { dateNum: 21, dayName: 'Fri' },
  { dateNum: 22, dayName: 'Sat' },
  { dateNum: 23, dayName: 'Sun' },
  { dateNum: 24, dayName: 'Mon' },
  { dateNum: 25, dayName: 'Tue' },
  { dateNum: 26, dayName: 'Wed' },
  { dateNum: 27, dayName: 'Thu' },
  { dateNum: 28, dayName: 'Fri' },
  { dateNum: 29, dayName: 'Sat' },
  { dateNum: 30, dayName: 'Sun' },
  { dateNum: 31, dayName: 'Mon' },
]

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', 
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM'
]

function getImageUrl(imagePath?: string | null): string {
  if (!imagePath) return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80'
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath
  return `http://127.0.0.1:8001/storage/${imagePath.replace(/^\//, '')}`
}

const goBack = () => {
  router.push('/services/category/4')
}

const openAddAddressModal = () => {
  const newAddr = prompt('Enter your complete delivery address:', cartStore.selectedAddress)
  if (newAddr && newAddr.trim()) {
    cartStore.selectedAddress = newAddr.trim()
  }
}

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

const handlePlaceOrder = () => {
  cartStore.showSuccessModal = true
}

const finishOrder = () => {
  cartStore.showSuccessModal = false
  cartStore.clearCart()
  router.push('/dashboard')
}
</script>

<style scoped>
.cart-page-container {
  min-height: 100vh;
  background: #FFFFFF;
  padding: 40px 20px 120px;
}

.cart-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.cart-top-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.btn-back {
  background: #F1F5F9;
  color: #1A56DB;
  border: none;
  padding: 8px 18px;
  border-radius: 20px;
  font-weight: 700;
  cursor: pointer;
  font-size: 14px;
}

.cart-page-title {
  font-size: 24px;
  font-weight: 800;
  color: #0F172A;
}

.empty-cart-box {
  text-align: center;
  padding: 80px 20px;
  background: #F8FAFC;
  border-radius: 20px;
  margin-top: 20px;
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

/* Grid Layout matching Screenshot 4 */
.checkout-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 28px;
}

.checkout-section-box {
  background: #F8FAFC;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.checkout-section-title {
  font-size: 18px;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.month-label {
  font-size: 13px;
  color: #64748B;
  font-weight: 600;
}

/* Days Slider Strip */
.days-slider {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 10px;
  margin-bottom: 16px;
}

.day-pill {
  min-width: 52px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #CBD5E1;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.day-pill.active {
  background: #1A56DB;
  color: white;
  border-color: #1A56DB;
}

.day-num { font-size: 14px; font-weight: 800; }
.day-name { font-size: 11px; }

/* Time Slots */
.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}

.time-pill {
  padding: 8px 4px;
  border-radius: 6px;
  border: 1px solid #CBD5E1;
  background: white;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s ease;
}

.time-pill.active {
  background: #1A56DB;
  color: white;
  border-color: #1A56DB;
}

/* Address Box */
.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-title { font-size: 16px; font-weight: 800; color: #0F172A; margin-bottom: 4px; }
.address-subtitle { font-size: 14px; color: #64748B; }

.btn-add-address {
  color: #1A56DB;
  background: transparent;
  border: none;
  font-weight: 700;
  cursor: pointer;
  font-size: 14px;
}

/* Checkout Items */
.checkout-items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkout-item-row {
  display: flex;
  align-items: center;
  gap: 14px;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 12px 16px;
}

.checkout-item-img {
  width: 54px;
  height: 54px;
  border-radius: 8px;
  object-fit: cover;
}

.checkout-item-details { flex: 1; }
.checkout-item-details h4 { font-size: 14px; font-weight: 700; color: #0F172A; }
.old-price { font-size: 12px; color: #94A3B8; text-decoration: line-through; margin-right: 6px; }
.new-price { font-size: 14px; font-weight: 800; color: #0F172A; }

/* Stepper [- 1 +] */
.stepper-box {
  display: flex;
  align-items: center;
  background: #1A56DB;
  border-radius: 6px;
  overflow: hidden;
  color: white;
}

.btn-step {
  background: transparent;
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-step:hover {
  background: rgba(255, 255, 255, 0.2);
}

.step-count {
  font-size: 14px;
  font-weight: 800;
  padding: 0 8px;
  background: white;
  color: #1A56DB;
  height: 28px;
  display: flex;
  align-items: center;
}

/* Right Column Cards */
.billing-card {
  background: #F8FAFC;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.billing-title { font-size: 18px; font-weight: 800; color: #0F172A; margin-bottom: 16px; }
.billing-row { display: flex; justify-content: space-between; font-size: 14px; color: #475569; margin-bottom: 8px; }
.billing-divider { height: 1px; background: #E2E8F0; margin: 12px 0; }
.bold-text { font-weight: 800; color: #0F172A; }
.cash-badge { font-weight: 700; color: #15803D; }
.total-row { font-size: 16px; font-weight: 800; color: #0F172A; margin-top: 8px; }
.total-price-text { color: #0F172A; font-size: 18px; font-weight: 800; }

/* Upload Section */
.upload-section-card {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.upload-title { font-size: 16px; font-weight: 800; color: #0F172A; margin-bottom: 2px; }
.upload-desc { font-size: 13px; color: #64748B; margin-bottom: 12px; }

.upload-box {
  width: 70px;
  height: 70px;
  background: #F8FAFC;
  border: 2px dashed #CBD5E1;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

.hidden-file-input { display: none; }
.plus-large { font-size: 24px; color: #64748B; }
.preview-img { width: 100%; height: 100%; object-fit: cover; }

/* Additional Info */
.additional-info-card {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
}

.info-card-title { font-size: 16px; font-weight: 800; color: #0F172A; margin-bottom: 10px; }
.problem-textarea {
  width: 100%;
  border: 1px solid #CBD5E1;
  border-radius: 10px;
  padding: 12px;
  font-size: 14px;
  outline: none;
  resize: vertical;
}

/* Floating Bottom Right Place Order Bar (Exact Screenshot 4) */
.floating-cart-bar {
  position: fixed;
  right: 32px;
  bottom: 32px;
  z-index: 1050;
}

.floating-bar-inner {
  background: #1A56DB;
  color: white;
  border-radius: 14px;
  padding: 8px 12px 8px 16px;
  display: flex;
  align-items: center;
  gap: 20px;
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
  border: 1px solid white;
  width: 24px;
  height: 24px;
  border-radius: 4px;
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
  background: transparent;
  color: white;
  border: none;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
}

.pulse-anim {
  animation: subtlePulse 2s infinite;
}

@keyframes subtlePulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.04); }
  100% { transform: scale(1); }
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
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
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
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

.success-modal-card h2 { font-size: 22px; font-weight: 800; color: #0F172A; margin-bottom: 8px; }
.success-modal-card p { font-size: 14px; color: #64748B; line-height: 1.5; margin-bottom: 20px; }
.modal-order-details { background: #F8FAFC; padding: 14px; border-radius: 12px; margin-bottom: 24px; text-align: left; }
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

@media (max-width: 900px) {
  .checkout-grid { grid-template-columns: 1fr; }
}
</style>
