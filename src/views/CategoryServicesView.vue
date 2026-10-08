<template>
  <div class="category-services-page">
    <!-- View Mode 1: Services List (Screenshot 3 & 5) -->
    <div v-if="currentViewMode === 'services_list'">
      <!-- Blue Header Banner -->
      <div class="blue-banner">
        <div class="banner-container">
          <h1 class="banner-title">{{ categoryName }} Services</h1>
          <p class="banner-subtitle">
            {{ categoryDescription || 'We Service, Repair, and Install All ' + categoryName + ' Brands!' }}
          </p>

          <!-- 3 Stat Pills -->
          <div class="banner-stats">
            <div class="stat-pill">
              <div class="stat-icon star-icon">★</div>
              <div class="stat-text">
                <span class="stat-val">4.4/5</span>
                <span class="stat-lbl">Average rating</span>
              </div>
            </div>

            <div class="stat-pill">
              <div class="stat-icon bag-icon">🛍️</div>
              <div class="stat-text">
                <span class="stat-val">800</span>
                <span class="stat-lbl">Start from</span>
              </div>
            </div>

            <div class="stat-pill">
              <div class="stat-icon check-icon">✓</div>
              <div class="stat-text">
                <span class="stat-val">55754</span>
                <span class="stat-lbl">Done order</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Body -->
      <div class="main-body-container">
        <!-- 1. Category Tabs Container Box (matching screenshot) -->
        <div v-if="allCategories.length > 0" class="category-tabs-container-box">
          <div class="category-tabs-scroll-track">
            <button 
              v-for="cat in allCategories" 
              :key="cat.id" 
              class="category-text-tab"
              :class="{ active: Number(cat.id) === Number(selectedCategoryId) }"
              @click="selectCategory(cat.id)"
            >
              <span class="tab-label">{{ cat.name }}</span>
              <span v-if="Number(cat.id) === Number(selectedCategoryId)" class="active-blue-bar"></span>
            </button>
          </div>
        </div>

        <!-- 2. Search Container Box (matching screenshot) -->
        <div class="services-search-container-box">
          <div class="search-pill-wrapper">
            <svg class="search-icon-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" v-model="searchQuery" placeholder="Search" class="search-input-pill" />
          </div>
        </div>

        <!-- 3. Category Services Grey Window Box -->
        <div class="services-window-box">
          <div class="window-header">
            <h2 class="window-title">{{ categoryName }} Services</h2>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading services from API...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredServices.length === 0" class="empty-state">
            <p>No services found for "{{ searchQuery }}".</p>
          </div>

          <!-- Services Cards Grid -->
          <div v-else class="services-cards-grid">
            <div 
              v-for="service in filteredServices" 
              :key="service.id" 
              class="service-item-card"
              :class="{ 'in-cart-active': cartStore.getServiceQuantity(service.id) > 0 }"
            >
              <div class="card-thumb">
                <img :src="getImageUrl(service.image)" :alt="service.name" class="thumb-img" />
              </div>

              <div class="card-info">
                <h3 class="service-title">{{ service.name }}</h3>
                <p class="service-unit">{{ service.short_description || service.unit || '- Per Unit' }}</p>

                <div class="price-row">
                  <span v-if="service.original_price" class="original-price">
                    Rs:{{ Math.round(Number(service.original_price)) }}
                  </span>
                  <span class="discounted-price">
                    Rs:{{ Math.round(Number(service.discounted_price)) }}
                  </span>
                </div>

                <div class="card-bottom">
                  <span class="rating-tag">★ {{ service.rating || '4.4' }}</span>

                  <!-- Add Button vs Quantity Stepper -->
                  <div class="cart-action-wrap">
                    <button 
                      v-if="cartStore.getServiceQuantity(service.id) === 0" 
                      class="btn-add-cart" 
                      @click="cartStore.addToCart(service)"
                    >
                      Add <span class="plus-icon">+</span>
                    </button>

                    <div v-else class="stepper-box animated-stepper">
                      <button class="btn-step" @click="cartStore.decrementFromCart(service.id)">-</button>
                      <span class="step-count">{{ cartStore.getServiceQuantity(service.id) }}</span>
                      <button class="btn-step" @click="cartStore.addToCart(service)">+</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Informational / SEO Text Section -->
        <div class="seo-text-section">
          <h2 class="seo-main-heading">Best {{ categoryName }} Services in Pakistan</h2>

          <p class="seo-paragraph">
            Regardless of whether it's home or office, <strong>{{ categoryName }} units</strong> are an indispensable
            piece of our day-to-day life. Having an {{ categoryName }} requires regular maintenance to function
            effectively and efficiently throughout its years of service.
          </p>

          <p class="seo-paragraph">
            Particularly even before the late spring season begins, {{ categoryName }} units should be overhauled to
            ensure they are working properly. If not, the efficiency of your unit decreases, and your AC quits performing
            appropriately, hence delivering less cooling and paying greater power.
          </p>

          <p class="seo-paragraph">
            Therefore, it's significant that you choose the right <strong>{{ categoryName }} maintenance service</strong>.
          </p>

          <p class="seo-paragraph">
            Searching for these experts is a difficult task itself. That's where Mr Home Services jumps in,
            offering the best {{ categoryName }} services in Lahore and Karachi, helping you get the best {{ categoryName }} services done.
          </p>

          <h3 class="seo-subheading">Our Honesty Goes a Long Way</h3>
          <h3 class="seo-subheading-blue">We value your trust. We offer:</h3>

          <ul class="seo-checklist">
            <li>✓ exceptional customer service</li>
            <li>✓ 24/7 repair services – No extra charge</li>
            <li>✓ fast & reliable</li>
            <li>✓ professionally trained service experts</li>
            <li>✓ No hidden or unexpected charges</li>
            <li>✓ Full Line of Major Air Conditioning brands</li>
            <li>✓ 100% Guaranteed Financing</li>
            <li>✓ No Risk Satisfaction Guarantee</li>
          </ul>

          <h3 class="seo-subheading">Why We Are Different</h3>
          <ul class="seo-bullet-list">
            <li>Best price guarantee</li>
            <li>Quick, Expert & Custom solution</li>
            <li>Fast & Reliable Service</li>
            <li>All Makes & Models</li>
            <li>Respect & Honesty</li>
          </ul>

          <h3 class="seo-subheading">Our Services</h3>
          <p class="seo-paragraph">
            Our {{ categoryName }} service team has years of practical, in-field experience. They possess just the right
            knowledge and skills needed to diagnose and rule out any {{ categoryName }} complication and give you a
            solution regarding all problems you may have.
          </p>
        </div>
      </div>
    </div>

    <!-- View Mode 2: Checkout / Booking Details View (Screenshot 4) -->
    <div v-else-if="currentViewMode === 'checkout'" class="checkout-page-container">
      <div class="checkout-card-wrapper">
        <!-- Top Back Navigation -->
        <button class="btn-back-to-services" @click="currentViewMode = 'services_list'">
          ← Back to {{ categoryName }} Services
        </button>

        <div class="checkout-grid">
          <!-- Left Column -->
          <div class="checkout-left-col">
            <!-- Select Date and Time -->
            <div class="checkout-section-box">
              <h3 class="checkout-section-title">
                Select Date and Time <span class="month-label">🗓️ August, 2026</span>
              </h3>

              <!-- Days Selector Slider -->
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

              <!-- Time Slots Selector -->
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

            <!-- Address Section -->
            <div class="checkout-section-box address-box">
              <div class="address-header">
                <div>
                  <h4 class="address-title">Address</h4>
                  <p class="address-subtitle">{{ cartStore.selectedAddress || 'Please add your address' }}</p>
                </div>
                <button class="btn-add-address" @click="openAddAddressModal">Add New ▾</button>
              </div>
            </div>

            <!-- Items Section -->
            <div class="checkout-section-box">
              <h3 class="checkout-section-title">Items</h3>
              <div class="checkout-items-list">
                <div v-for="item in cartStore.cartItemsList" :key="item.service.id" class="checkout-item-row">
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
            <!-- Billing Card -->
            <div class="billing-card">
              <h3 class="billing-title">Billing</h3>
              <div v-for="item in cartStore.cartItemsList" :key="item.service.id" class="billing-row">
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

            <!-- Problem Image -->
            <div class="upload-section-card">
              <h4 class="upload-title">Problem Image</h4>
              <p class="upload-desc">Add Screenshots</p>
              <div class="upload-box" @click="triggerImageUpload">
                <input type="file" ref="fileInput" class="hidden-file-input" @change="onFileSelected" accept="image/*" />
                <div v-if="cartStore.uploadedPreview" class="preview-wrap">
                  <img :src="cartStore.uploadedPreview" class="preview-img" alt="Screenshot preview" />
                </div>
                <div v-else class="upload-placeholder">
                  <span class="plus-large">+</span>
                </div>
              </div>
            </div>

            <!-- Additional Information -->
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
    </div>

    <!-- Animated Floating Bottom Right Cart Action Button (Matching Screenshot 5 & 4) -->
    <transition name="floating-slide">
      <div 
        v-if="cartStore.totalCartCount > 0" 
        class="floating-cart-bar"
        :class="{ 'bounce-pop': cartStore.buttonJustAnimated }"
      >
        <div class="floating-bar-inner">
          <div class="cart-summary-group">
            <span class="cart-count-badge">{{ cartStore.totalCartCount }}</span>
            <span class="cart-total-text">Rs {{ cartStore.totalCartPrice }}</span>
          </div>

          <button 
            v-if="currentViewMode === 'services_list'" 
            class="btn-floating-action pulse-anim" 
            @click="goToCheckout"
          >
            Continue →
          </button>

          <button 
            v-else 
            class="btn-floating-action pulse-anim" 
            @click="placeOrder"
          >
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
        <p>Your Mr Home Services request has been received. Our team will visit you on August {{ cartStore.selectedDateNum }}, at {{ cartStore.selectedTimeSlot }}.</p>
        <div class="modal-order-details">
          <p><strong>Total Amount:</strong> Rs {{ cartStore.totalCartPrice }}</p>
          <p><strong>Payment:</strong> Cash on Delivery</p>
        </div>
        <button class="btn-modal-close" @click="finishOrder">View Dashboard</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useService } from '@/composables/useService'
import { useCartStore, type ServiceItem } from '@/stores/cart'
import { showPromptAlert } from '@/utils/alert'

const route = useRoute()
const router = useRouter()
const service = useService()
const cartStore = useCartStore()

interface ServiceCategory {
  id: number
  name: string
  slug: string
  description?: string | null
  image?: string | null
}

function getImageUrl(imagePath?: string | null): string {
  if (!imagePath) return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80'
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath
  return `http://127.0.0.1:8001/storage/${imagePath.replace(/^\//, '')}`
}

const selectedCategoryId = ref<number>(4)
const categoryName = ref('Services')
const categoryDescription = ref('Browse our top categories and services')

const allCategories = ref<ServiceCategory[]>([])
const services = ref<ServiceItem[]>([])
const searchQuery = ref('')
const isLoading = ref(true)

const loadCategoryData = async (id?: number) => {
  isLoading.value = true
  try {
    const fetchedCategories: ServiceCategory[] = await service.getCategories()
    if (Array.isArray(fetchedCategories) && fetchedCategories.length > 0) {
      allCategories.value = fetchedCategories
    }

    let activeId = id || Number(route.params.id)
    if (!activeId && allCategories.value.length > 0) {
      const firstCat = allCategories.value[0]
      if (firstCat) {
        activeId = Number(firstCat.id)
      }
    }
    if (!activeId) activeId = 4

    selectedCategoryId.value = activeId

    const found = allCategories.value.find((c: ServiceCategory) => Number(c.id) === Number(activeId))
    if (found) {
      categoryName.value = found.name
      categoryDescription.value = found.description || `We Service, Repair, and Install All ${found.name} Brands!`
    }

    const fetchedServices: ServiceItem[] = await service.getCategoryServices(activeId)
    services.value = Array.isArray(fetchedServices) ? fetchedServices : []
  } catch (error) {
    console.error('Error loading category services:', error)
    services.value = []
  } finally {
    isLoading.value = false
  }
}

const selectCategory = (catId: number | string) => {
  const numId = Number(catId)
  selectedCategoryId.value = numId
  router.push(`/services/category/${numId}`)
}

const currentViewMode = ref<'services_list' | 'checkout'>('services_list')
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

const filteredServices = computed(() => {
  if (!searchQuery.value.trim()) return services.value
  const q = searchQuery.value.toLowerCase()
  return services.value.filter(s =>
    s.name.toLowerCase().includes(q) ||
    (s.short_description && s.short_description.toLowerCase().includes(q))
  )
})

onMounted(() => {
  loadCategoryData(route.params.id ? Number(route.params.id) : undefined)
})

watch(() => route.params.id, (newId) => {
  loadCategoryData(newId ? Number(newId) : undefined)
})

const goToCheckout = () => {
  router.push('/cart')
}

const openAddAddressModal = async () => {
  const result = await showPromptAlert('Delivery Address', 'Enter your complete delivery address:', cartStore.selectedAddress)
  if (result.isConfirmed && result.value && result.value.trim()) {
    cartStore.selectedAddress = result.value.trim()
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

const placeOrder = () => {
  cartStore.showSuccessModal = true
}

const finishOrder = () => {
  cartStore.showSuccessModal = false
  cartStore.clearCart()
  router.push('/dashboard')
}
</script>

<style scoped>
.category-services-page {
  width: 100%;
  font-family: inherit;
  background: #FFFFFF;
  position: relative;
  min-height: 100vh;
}

/* Blue Header Banner */
.blue-banner {
  background: #1A56DB;
  color: white;
  padding: 40px 24px 50px;
  text-align: left;
}

.banner-container {
  max-width: 1180px;
  margin: 0 auto;
}

.banner-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.banner-subtitle {
  font-size: 1rem;
  color: #DBEAFE;
  margin-bottom: 24px;
}

/* 3 Stat Pills */
.banner-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-pill {
  background: white;
  color: #1E293B;
  border-radius: 8px;
  padding: 10px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
}

.star-icon { background: #EFF6FF; color: #1A56DB; }
.bag-icon { background: #EFF6FF; color: #1A56DB; }
.check-icon { background: #DCFCE7; color: #16A34A; }

.stat-text { display: flex; flex-direction: column; }
.stat-val { font-size: 15px; font-weight: 800; color: #0F172A; }
.stat-lbl { font-size: 11px; color: #64748B; }

/* Main Body Container */
.main-body-container {
  max-width: 1180px;
  margin: -20px auto 80px;
  padding: 0 20px;
}

/* Grey Window Box */
.services-window-box {
  background: #F8FAFC;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  margin-bottom: 50px;
}

/* 1. Category Tabs Container Box (Matching Screenshot) */
.category-tabs-container-box {
  background: #F4F6F8;
  border-radius: 16px;
  padding: 14px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.category-tabs-scroll-track {
  display: flex;
  align-items: center;
  gap: 28px;
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 2px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.category-tabs-scroll-track::-webkit-scrollbar {
  display: none;
}

.category-text-tab {
  background: transparent;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: #475569;
  padding: 8px 4px 10px;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

.category-text-tab:hover {
  color: #1A56DB;
}

.category-text-tab.active {
  color: #1A56DB;
  font-weight: 700;
}

.tab-label {
  font-size: 16px;
}

.active-blue-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #1A56DB;
  border-radius: 2px;
}

/* 2. Search Container Box (Matching Screenshot) */
.services-search-container-box {
  background: #F4F6F8;
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.search-pill-wrapper {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border: 1.5px solid #CBD5E1;
  border-radius: 40px;
  padding: 10px 20px;
  max-width: 380px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-pill-wrapper:focus-within {
  border-color: #1A56DB;
  box-shadow: 0 4px 12px rgba(26, 86, 219, 0.12);
}

.search-icon-svg {
  color: #94A3B8;
  margin-right: 12px;
  flex-shrink: 0;
}

.search-input-pill {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  font-size: 15px;
  color: #1E293B;
}

.search-input-pill::placeholder {
  color: #94A3B8;
  font-size: 15px;
}

.window-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.window-title { font-size: 20px; font-weight: 800; color: #0F172A; }

.search-box {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #CBD5E1;
  border-radius: 20px;
  padding: 6px 16px;
  width: 260px;
}

.search-icon { width: 16px; height: 16px; margin-right: 8px; }
.search-input { border: none; outline: none; width: 100%; font-size: 14px; }

/* Services Cards Grid */
.services-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.service-item-card {
  background: white;
  border-radius: 12px;
  border: 2px solid #E2E8F0;
  padding: 16px;
  display: flex;
  gap: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.service-item-card.in-cart-active {
  border-color: #1A56DB !important;
  box-shadow: 0 4px 16px rgba(26, 86, 219, 0.15);
}

.btn-back-to-services {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #EFF6FF;
  color: #1D4ED8;
  border: 1.5px solid #BFDBFE;
  border-radius: 30px;
  padding: 9px 22px;
  font-weight: 700;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 20px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(29, 78, 216, 0.08);
}

.btn-back-to-services:hover {
  background: #1D4ED8;
  color: #ffffff;
  border-color: #1D4ED8;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(29, 78, 216, 0.25);
}

.card-thumb {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #F8FAFC;
}

.thumb-img { width: 100%; height: 100%; object-fit: cover; }

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.service-title {
  font-size: 15px;
  font-weight: 700;
  color: #1A56DB;
  line-height: 1.3;
  margin-bottom: 4px;
}

.service-unit { font-size: 12px; color: #64748B; margin-bottom: 8px; }

.price-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.original-price { font-size: 13px; color: #94A3B8; text-decoration: line-through; }
.discounted-price { font-size: 15px; font-weight: 800; color: #0F172A; }

.card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rating-tag {
  font-size: 12px;
  font-weight: 700;
  color: #D97706;
  background: #FEF3C7;
  padding: 2px 8px;
  border-radius: 10px;
}

/* Cart Action Buttons */
.cart-action-wrap {
  display: flex;
  align-items: center;
}

.btn-add-cart {
  background: #0F172A;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.2s, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-add-cart:hover {
  background: #1E293B;
  transform: scale(1.08);
}

.plus-icon {
  background: white;
  color: #0F172A;
  border-radius: 2px;
  padding: 0 4px;
  font-size: 12px;
  font-weight: bold;
}

/* Stepper Box [-] [ count ] [+] */
.stepper-box {
  display: flex;
  align-items: center;
  background: #1A56DB;
  border-radius: 6px;
  overflow: hidden;
  color: white;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.animated-stepper {
  animation: popIn 0.3s ease;
}

@keyframes popIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
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
  transition: background 0.1s;
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

/* Animated Floating Bottom Right Bar (Screenshot 5) */
.floating-cart-bar {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1050;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bounce-pop {
  animation: buttonPop 0.4s ease;
}

@keyframes buttonPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.12); }
  100% { transform: scale(1); }
}

.floating-bar-inner {
  background: linear-gradient(135deg, #1A56DB 0%, #1E40AF 100%);
  color: white;
  border-radius: 30px;
  padding: 8px 12px 8px 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 10px 30px rgba(26, 86, 219, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cart-summary-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-count-badge {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  border: 1px solid white;
  width: 26px;
  height: 26px;
  border-radius: 50%;
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

.btn-floating-action {
  background: transparent;
  color: white;
  border: none;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  transition: transform 0.2s ease;
}

.btn-floating-action:hover {
  transform: translateX(4px);
}

/* Animations */
.pulse-anim {
  animation: subtlePulse 2s infinite;
}

@keyframes subtlePulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.floating-slide-enter-active,
.floating-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.floating-slide-enter-from,
.floating-slide-leave-to {
  transform: translateY(100px);
  opacity: 0;
}

/* SEO Section */
.seo-text-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #E2E8F0;
}

.seo-main-heading { font-size: 24px; font-weight: 800; color: #0F172A; margin-bottom: 16px; }
.seo-paragraph { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 16px; }
.seo-subheading { font-size: 18px; font-weight: 800; color: #0F172A; margin: 24px 0 12px; }
.seo-subheading-blue { font-size: 16px; font-weight: 700; color: #1A56DB; margin-bottom: 12px; }

.seo-checklist,
.seo-bullet-list {
  list-style: none;
  padding-left: 0;
  margin-bottom: 24px;
}

.seo-checklist li,
.seo-bullet-list li {
  font-size: 14px;
  color: #334155;
  margin-bottom: 8px;
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
  .services-cards-grid { grid-template-columns: repeat(2, 1fr); }
  .checkout-grid { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .blue-banner {
    padding: 24px 16px 36px;
  }

  .banner-title {
    font-size: 1.8rem;
  }

  .banner-subtitle {
    font-size: 0.9rem;
    margin-bottom: 16px;
  }

  .banner-stats {
    flex-direction: column;
    gap: 10px;
  }

  .stat-pill {
    width: 100%;
  }

  .main-body-container {
    margin: -15px auto 40px;
    padding: 0 12px;
  }

  .services-window-box {
    padding: 16px 12px;
    border-radius: 12px;
  }

  .search-box {
    width: 100%;
  }

  .services-cards-grid { grid-template-columns: 1fr; }

  .service-item-card {
    padding: 12px;
  }

  .floating-cart-bar {
    left: 12px;
    right: 12px;
    bottom: 16px;
    width: calc(100% - 24px);
  }

  .floating-bar-inner {
    justify-content: space-between;
    width: 100%;
    padding: 8px 12px 8px 16px;
  }

  .seo-text-section {
    padding: 20px 16px;
  }

  .seo-main-heading {
    font-size: 18px;
  }
}
</style>
