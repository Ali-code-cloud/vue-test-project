<template>
  <div class="dashboard-container">
    <!-- Header Banner -->
    <div class="dashboard-header">
      <div class="user-welcome">
        <div class="avatar-box">
          <img :src="authStore.user?.avatar || defaultAvatar" alt="User Avatar" class="user-avatar" />
          <span class="online-indicator"></span>
        </div>
        <div class="user-info">
          <h2>Welcome back, {{ authStore.user?.name || 'Valued Customer' }}!</h2>
          <p class="user-email">
            <span>📧 {{ authStore.user?.email }}</span> •
            <span>📱 {{ authStore.user?.phone || '+92 300 1234567' }}</span> •
            <span class="member-tag">Member since {{ authStore.user?.joinedDate || '2026' }}</span>
          </p>
        </div>
      </div>
      <div class="header-actions">
        <router-link to="/services" class="btn-primary-action">+ Book New Service</router-link>
        <button @click="handleLogout" class="btn-logout">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Logout
        </button>
      </div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-blue">🛠️</div>
        <div class="stat-data">
          <span class="stat-value">{{ bookings.length }}</span>
          <span class="stat-label">Total Services</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-green">⏳</div>
        <div class="stat-data">
          <span class="stat-value">{{ activeBookingsCount }} Active</span>
          <span class="stat-label">Bookings in Progress</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-orange">⭐</div>
        <div class="stat-data">
          <span class="stat-value">450 pts</span>
          <span class="stat-label">Loyalty Rewards</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-purple">📑</div>
        <div class="stat-data">
          <span class="stat-value">{{ complaints.length }} Open</span>
          <span class="stat-label">Pending Complaints</span>
        </div>
      </div>
    </div>

    <!-- Dashboard Content Area with Sidebar Nav -->
    <div class="dashboard-body">
      <!-- Sidebar / Mobile Horizontal Tabs -->
      <aside class="dashboard-nav">
        <button class="nav-tab" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">
          <span class="tab-icon">📊</span> Overview
        </button>
        <button class="nav-tab" :class="{ active: activeTab === 'bookings' }" @click="activeTab = 'bookings'">
          <span class="tab-icon">📅</span> My Bookings
        </button>
        <button class="nav-tab" :class="{ active: activeTab === 'complaints' }" @click="activeTab = 'complaints'">
          <span class="tab-icon">⚠️</span> Complaints
        </button>
        <button class="nav-tab" :class="{ active: activeTab === 'profile' }" @click="activeTab = 'profile'">
          <span class="tab-icon">⚙️</span> Profile Settings
        </button>
      </aside>

      <!-- Main Section Content -->
      <main class="dashboard-content">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="tab-pane">
          <h3 class="pane-title">Active Service Tracking</h3>
          <div class="active-tracker-card">
            <div class="tracker-header">
              <div>
                <span class="service-type">Master AC Deep Cleaning & Service</span>
                <span class="booking-id">#ORD-98421</span>
              </div>
              <span class="status-badge status-active">Service Dispatched</span>
            </div>
            <div class="progress-bar-wrap">
              <div class="progress-step completed">
                <span class="step-dot">✓</span>
                <span class="step-name">Booked</span>
              </div>
              <div class="progress-step completed">
                <span class="step-dot">✓</span>
                <span class="step-name">Assigned</span>
              </div>
              <div class="progress-step active">
                <span class="step-dot">🚚</span>
                <span class="step-name">On the Way</span>
              </div>
              <div class="progress-step">
                <span class="step-dot">⚙️</span>
                <span class="step-name">In Progress</span>
              </div>
              <div class="progress-step">
                <span class="step-dot">🏁</span>
                <span class="step-name">Completed</span>
              </div>
            </div>
            <!-- Technician info - Next Sprint -->
            <!--
            <div class="technician-info">
              <div class="tech-profile">
                <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80" alt="Tech" class="tech-img" />
                <div>
                  <strong>Master Technician: Muhammad Ali</strong>
                  <p>Rating: ★ 4.9 (120+ Jobs completed in Lahore)</p>
                </div>
              </div>
              <a href="tel:03001234567" class="btn-call-tech">📞 Call Technician</a>
            </div>
            -->
          </div>

          <div class="recent-section">
            <h3 class="pane-title">Recent Activity</h3>
            <ul class="activity-list">
              <li class="activity-item">
                <span class="act-icon">✅</span>
                <div class="act-details">
                  <p><strong>Automatic Washing Machine Repair</strong> finished successfully.</p>
                  <span class="act-time">Yesterday at 4:30 PM</span>
                </div>
                <span class="act-amount">Rs 1,200</span>
              </li>
              <li class="activity-item">
                <span class="act-icon">🚿</span>
                <div class="act-details">
                  <p><strong>Muslim Shower Replacement</strong> - Invoice paid</p>
                  <span class="act-time">Aug 05, 2026</span>
                </div>
                <span class="act-amount">Rs 450</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bookings Tab (Revamped Modern Layout) -->
        <div v-else-if="activeTab === 'bookings'" class="tab-pane">
          <div class="pane-header-flex bookings-header-flex">
            <div>
              <h3 class="pane-title">All Service Bookings</h3>
              <p class="pane-sub-desc">Track real-time service status, view past invoices, or rebook services.</p>
            </div>

            <!-- Search + Filter Controls -->
            <div class="booking-controls-wrap">

              <div class="filter-pills">
                <button v-for="filter in ['All', 'In Progress', 'Completed', 'Cancelled']" :key="filter"
                  class="pill-btn" :class="{ active: selectedFilter === filter }" @click="selectedFilter = filter">
                  {{ filter }}
                  <span class="pill-badge-count">{{ getFilterCount(filter) }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredBookings.length === 0" class="empty-bookings-box">
            <div class="empty-icon-circle">📦</div>
            <h4>No Bookings Found</h4>
            <p>We couldn't find any bookings matching your search query or selected filter.</p>
            <router-link to="/services" class="btn-primary-action">+ Book New Service</router-link>
          </div>

          <!-- Revamped Booking Cards Grid -->
          <div v-else class="bookings-cards-grid">
            <div v-for="booking in filteredBookings" :key="booking.id" class="revamped-booking-card">
              <div class="booking-card-top">
                <div class="order-id-pill">
                  <span class="order-icon">🧾</span>
                  <span class="order-id-code">{{ booking.id }}</span>
                </div>
                <span class="status-badge-pill" :class="booking.statusClass">
                  <span class="live-dot"></span> {{ booking.status }}
                </span>
              </div>

              <div class="booking-card-content">
                <h4 class="booking-service-title">{{ booking.service }}</h4>

                <div class="booking-meta-list">
                  <div class="meta-cell">
                    <span class="meta-ic">🗓️</span>
                    <div>
                      <span class="meta-lbl">Scheduled Date</span>
                      <span class="meta-val">{{ booking.date }}</span>
                    </div>
                  </div>

                  <div class="meta-cell">
                    <span class="meta-ic">📍</span>
                    <div>
                      <span class="meta-lbl">Location</span>
                      <span class="meta-val">{{ booking.city }}</span>
                    </div>
                  </div>

                  <div class="meta-cell">
                    <span class="meta-ic">💵</span>
                    <div>
                      <span class="meta-lbl">Payment Mode</span>
                      <span class="meta-val">Cash on Delivery</span>
                    </div>
                  </div>

                  <div class="meta-cell">
                    <span class="meta-ic">💰</span>
                    <div>
                      <span class="meta-lbl">Total Amount</span>
                      <span class="meta-val price-bold">{{ booking.price }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="booking-card-actions">
                <button class="btn-track-details" @click="viewBooking(booking)">
                  View Details & Tracking →
                </button>
                <router-link to="/services" class="btn-rebook-outline">
                  Rebook
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Complaints Tab -->
        <div v-else-if="activeTab === 'complaints'" class="tab-pane">
          <div class="pane-header-flex">
            <h3 class="pane-title">Customer Complaints & Feedback</h3>
            <button class="btn-secondary-action" @click="showNewComplaintModal = true">+ File New Complaint</button>
          </div>

          <div v-if="complaints.length === 0" class="empty-state">
            <p>No active complaints found. We aim for 100% customer satisfaction!</p>
          </div>
          <div v-else class="complaints-list">
            <div v-for="item in complaints" :key="item.id" class="complaint-card">
              <div class="complaint-header">
                <div>
                  <span class="complaint-id">{{ item.id }}</span>
                  <h4>{{ item.title }}</h4>
                </div>
                <span class="status-badge" :class="item.statusClass">{{ item.status }}</span>
              </div>
              <p class="complaint-desc">{{ item.description }}</p>
              <div class="complaint-meta">
                <span>Submitted on: {{ item.date }}</span>
                <span>Service Ref: {{ item.bookingId }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Settings Tab -->
        <div v-else-if="activeTab === 'profile'" class="tab-pane">
          <h3 class="pane-title">Personal Profile & Address</h3>
          <form @submit.prevent="saveProfile" class="profile-form" novalidate>
            <div class="form-row">
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" v-model="profileForm.name" class="input-field" />
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" v-model="profileForm.email" class="input-field" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" v-model="profileForm.phone" class="input-field" />
              </div>
              <div class="form-group">
                <label>Default City</label>
                <select v-model="profileForm.city" class="input-field">
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Complete Home / Office Address</label>
              <textarea v-model="profileForm.address" rows="3" class="input-field"
                placeholder="House #, Street #, Sector/Area..."></textarea>
            </div>

            <div v-if="saveSuccessMsg" class="success-alert">
              {{ saveSuccessMsg }}
            </div>

            <button type="submit" class="btn-save-profile">Save Changes</button>
          </form>
        </div>
      </main>
    </div>

    <!-- Booking Details & Tracking Modal -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showBookingModal && selectedBooking" class="modal-overlay" @click.self="showBookingModal = false">
          <div class="booking-modal-card">
            <button class="btn-close-modal" @click="showBookingModal = false" aria-label="Close modal">✕</button>

            <div class="modal-booking-header">
              <div>
                <span class="modal-order-tag">{{ selectedBooking.id }}</span>
                <h3 class="modal-service-name">{{ selectedBooking.service }}</h3>
              </div>
              <span class="status-badge-pill" :class="selectedBooking.statusClass">
                <span class="live-dot"></span> {{ selectedBooking.status }}
              </span>
            </div>

            <div class="modal-booking-body">
              <!-- Progress Steps Tracker -->
              <div v-if="selectedBooking.status.toLowerCase() !== 'cancelled'" class="modal-tracker-box">
                <h4 class="tracker-title">Service Progress</h4>
                <div class="tracker-timeline">
                  <div class="timeline-step completed">
                    <div class="step-icon">✓</div>
                    <span>Booked</span>
                  </div>
                  <div class="timeline-step"
                    :class="{ completed: ['confirmed', 'in progress', 'completed'].includes(selectedBooking.status.toLowerCase()), active: selectedBooking.status.toLowerCase() === 'confirmed' }">
                    <div class="step-icon">✓</div>
                    <span>Confirmed</span>
                  </div>
                  <div class="timeline-step"
                    :class="{ completed: selectedBooking.status.toLowerCase() === 'completed', active: ['in progress', 'on the way'].includes(selectedBooking.status.toLowerCase()) }">
                    <div class="step-icon">🚚</div>
                    <span>On the Way</span>
                  </div>
                  <div class="timeline-step" :class="{ completed: selectedBooking.status.toLowerCase() === 'completed' }">
                    <div class="step-icon">🏁</div>
                    <span>Completed</span>
                  </div>
                </div>
              </div>
              <div v-else class="cancelled-banner">
                ⚠️ Order Cancelled
                <p v-if="selectedBooking.fullOrder?.cancellation_reason" class="cancellation-reason">
                  Reason: {{ selectedBooking.fullOrder.cancellation_reason }}
                </p>
              </div>

              <!-- Customer & Delivery Summary Grid -->
              <div class="modal-info-summary">
                <div class="info-row">
                  <span class="info-lbl">Customer Name:</span>
                  <span class="info-val">{{ selectedBooking.fullOrder?.customer_name || authStore.user?.name || 'Customer'
                  }}</span>
                </div>
                <div class="info-row">
                  <span class="info-lbl">Customer Phone:</span>
                  <span class="info-val">{{ selectedBooking.fullOrder?.customer_phone || authStore.user?.phone || 'N/A'
                  }}</span>
                </div>
                <div class="info-row">
                  <span class="info-lbl">Delivery Address:</span>
                  <span class="info-val">
                    {{ selectedBooking.fullOrder?.address || authStore.user?.address || 'Default Address' }}
                    <template v-if="selectedBooking.fullOrder?.town || selectedBooking.fullOrder?.city">, {{
                      selectedBooking.fullOrder?.town
                      }}, {{ selectedBooking.fullOrder?.city }}
                    </template>
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-lbl">Scheduled Slot:</span>
                  <span class="info-val">{{ selectedBooking.date }}</span>
                </div>
                <div v-if="selectedBooking.fullOrder?.notes" class="info-row">
                  <span class="info-lbl">Notes:</span>
                  <span class="info-val">{{ selectedBooking.fullOrder.notes }}</span>
                </div>
                <div class="info-row">
                  <span class="info-lbl">Payment Method:</span>
                  <span class="info-val">Cash on Delivery</span>
                </div>
              </div>

              <!-- Line Items Box -->
              <div class="modal-items-box">
                <h4 class="items-title">Ordered Items</h4>
                <div class="modal-items-list">
                  <div
                    v-for="(item, idx) in (selectedBooking.fullOrder?.items && selectedBooking.fullOrder.items.length > 0 ? selectedBooking.fullOrder.items : [{ service_name: selectedBooking.service, quantity: 1, total_price: selectedBooking.price }])"
                    :key="idx" class="modal-item-row">
                    <div class="item-name-group">
                      <span class="item-bullet">•</span>
                      <strong>{{ item.service_name || item.service?.name || selectedBooking.service }}</strong>
                      <span class="item-qty">x{{ item.quantity || 1 }}</span>
                    </div>
                    <span class="item-price">Rs {{ Math.round(Number(item.total_price || item.unit_price || 0)) }}</span>
                  </div>
                </div>
                <div class="modal-total-bar">
                  <span>Grand Total:</span>
                  <strong class="total-val">{{ selectedBooking.price }}</strong>
                </div>
              </div>
            </div>

            <div class="modal-booking-footer">
              <button v-if="['pending', 'confirmed'].includes(selectedBooking.status.toLowerCase())"
                class="btn-cancel-modal" @click="cancelBookingOrder(selectedBooking); showBookingModal = false">
                Cancel Order
              </button>
              <button class="btn-delete-modal" @click="deleteBookingOrder(selectedBooking); showBookingModal = false">
                Delete Order
              </button>
              <button class="btn-modal-done" @click="showBookingModal = false">Close Details</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- File New Complaint Modal (Exact Match to Screenshot) -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showNewComplaintModal" class="modal-overlay" @click.self="showNewComplaintModal = false">
          <div class="complaint-modal-card-screenshot">
            <button class="btn-close-modal" @click="showNewComplaintModal = false" aria-label="Close modal">✕</button>

            <form @submit.prevent="submitNewComplaint" class="complaint-screenshot-form" novalidate>
              <div class="form-inputs-row">
                <div class="form-group-half">
                  <input 
                    v-model="complaintForm.name" 
                    type="text" 
                    placeholder="Name *" 
                    class="form-input-pill" 
                    :class="{ 'has-error': complaintFormErrors.name }"
                    @input="complaintFormErrors.name = ''"
                  />
                  <span v-if="complaintFormErrors.name" class="text-danger-error">{{ complaintFormErrors.name }}</span>
                </div>
                <div class="form-group-half">
                  <input 
                    v-model="complaintForm.phone" 
                    type="tel" 
                    placeholder="Phone number *" 
                    class="form-input-pill" 
                    :class="{ 'has-error': complaintFormErrors.phone }"
                    @input="complaintFormErrors.phone = ''"
                  />
                  <span v-if="complaintFormErrors.phone" class="text-danger-error">{{ complaintFormErrors.phone }}</span>
                </div>
              </div>

              <div class="form-group-full">
                <textarea 
                  v-model="complaintForm.message" 
                  placeholder="Message *" 
                  rows="3" 
                  class="form-textarea-box" 
                  :class="{ 'has-error': complaintFormErrors.message }"
                  @input="complaintFormErrors.message = ''"
                ></textarea>
                <span v-if="complaintFormErrors.message" class="text-danger-error">{{ complaintFormErrors.message }}</span>
              </div>

              <div class="form-action-right">
                <button type="submit" class="btn-submit-blue" :disabled="isSubmittingComplaint">
                  {{ isSubmittingComplaint ? 'Submitting...' : 'Submit' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore, getApiError } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import api from '@/composables/useApi'
import { showSuccessAlert, showErrorAlert, showConfirmAlert, showPromptAlert, showSuccessToast, showErrorToast } from '@/utils/alert'

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()
const route = useRoute()

const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
const activeTab = ref<'overview' | 'bookings' | 'complaints' | 'profile'>('overview')
const selectedFilter = ref('All')
const bookingSearch = ref('')
const selectedBooking = ref<any>(null)
const showBookingModal = ref(false)
const showNewComplaintModal = ref(false)
const saveSuccessMsg = ref('')

const profileForm = ref({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
  phone: authStore.user?.phone || '',
  city: 'Lahore',
  address: authStore.user?.address || 'Suite 402, Block H-3, Johar Town, Lahore'
})

watch(() => authStore.user, (newUser) => {
  if (newUser) {
    profileForm.value.name = newUser.name || profileForm.value.name
    profileForm.value.email = newUser.email || profileForm.value.email
    profileForm.value.phone = newUser.phone || profileForm.value.phone
    profileForm.value.address = newUser.address || profileForm.value.address
  }
}, { immediate: true })

const loadUserOrders = async () => {
  if (authStore.isAuthenticated) {
    const rawOrders = await cartStore.fetchUserOrders()
    if (Array.isArray(rawOrders) && rawOrders.length > 0) {
      bookings.value = rawOrders.map((ord: any) => {
        const firstItem = ord.items?.[0] || {}
        const sName = firstItem.service_name || firstItem.service?.name || 'Home Service'
        const statusStr = ord.status ? (ord.status.charAt(0).toUpperCase() + ord.status.slice(1)) : 'Pending'
        let sClass = 'status-active'
        if (statusStr.toLowerCase() === 'completed') sClass = 'status-completed'
        if (statusStr.toLowerCase() === 'cancelled') sClass = 'status-cancelled'

        return {
          rawId: ord.id,
          id: ord.order_number || `#ORD-${ord.id}`,
          service: sName,
          date: ord.booking_date ? new Date(ord.booking_date).toLocaleDateString() + ' - ' + (ord.booking_time_slot || '') : (ord.created_at || 'Recent'),
          city: ord.city || 'Lahore',
          price: `Rs ${ord.total_amount || ord.subtotal || '0'}`,
          status: statusStr,
          statusClass: sClass,
          fullOrder: ord
        }
      })
    }
  }
}

onMounted(() => {
  loadUserOrders()
  if (route.query.tab && typeof route.query.tab === 'string') {
    const tabParam = route.query.tab as any
    if (['overview', 'bookings', 'complaints', 'profile'].includes(tabParam)) {
      activeTab.value = tabParam
    }
  }
})

watch(() => route.query.tab, (newTab) => {
  if (newTab && typeof newTab === 'string') {
    if (['overview', 'bookings', 'complaints', 'profile'].includes(newTab as any)) {
      activeTab.value = newTab as any
    }
  }
})

const cancelBookingOrder = async (booking: any) => {
  const result = await showPromptAlert('Cancel Booking', 'Please enter your cancellation reason...', 'I want to change my booking schedule.')
  if (!result.isConfirmed || !result.value) return

  const reason = result.value
  try {
    const targetId = booking.rawId || booking.id.replace('#', '')
    const res = await cartStore.cancelOrder(targetId, reason)
    if (res?.status || res?.message) {
      await showSuccessAlert('Order Cancelled', 'Your order has been cancelled successfully.')
      await loadUserOrders()
    } else {
      await showErrorAlert('Cancellation Failed', res?.message || 'Failed to cancel order.')
    }
  } catch (err: any) {
    await showErrorAlert('Error', err.message || 'Failed to cancel order.')
  }
}

const deleteBookingOrder = async (booking: any) => {
  const result = await showConfirmAlert('Delete Order', 'Are you sure you want to delete this order? This action cannot be undone.', 'Yes, Delete')
  if (!result.isConfirmed) return

  try {
    const targetId = booking.rawId || booking.id.replace('#', '')
    const res = await cartStore.deleteOrder(targetId)
    if (res?.status || res?.message) {
      await showSuccessAlert('Order Deleted', 'Your order has been deleted successfully.')
      await loadUserOrders()
    } else {
      await showErrorAlert('Delete Failed', res?.message || 'Failed to delete order.')
    }
  } catch (err: any) {
    await showErrorAlert('Error', err.message || 'Failed to delete order.')
  }
}

const bookings = ref([
  { id: '#ORD-98421', service: 'Master AC Deep Cleaning & Service', date: 'Aug 09, 2026 - 02:00 PM', city: 'Lahore', price: 'Rs 1,500', status: 'In Progress', statusClass: 'status-active' },
  { id: '#ORD-98310', service: 'Automatic Washing Machine Repairing', date: 'Aug 08, 2026 - 11:30 AM', city: 'Lahore', price: 'Rs 1,200', status: 'Completed', statusClass: 'status-completed' },
  { id: '#ORD-97554', service: 'Muslim shower Replacement', date: 'Aug 05, 2026 - 04:00 PM', city: 'Karachi', price: 'Rs 450', status: 'Completed', statusClass: 'status-completed' },
  { id: '#ORD-96112', service: 'Pest Control & Fumigation', date: 'Jul 28, 2026 - 10:00 AM', city: 'Islamabad', price: 'Rs 3,500', status: 'Completed', statusClass: 'status-completed' },
])

const complaints = ref([
  { id: '#CMP-1042', title: 'Delay in Technician Arrival', bookingId: '#ORD-97554', date: 'Aug 05, 2026', description: 'Technician reached 30 minutes later than promised slot.', status: 'Resolved', statusClass: 'status-completed' }
])

const activeBookingsCount = computed(() => {
  return bookings.value.filter(b => {
    const st = b.status.toLowerCase()
    return st.includes('in progress') || st.includes('pending') || st.includes('confirmed') || st.includes('dispatched') || st.includes('on the way') || st.includes('active')
  }).length
})

const getFilterCount = (filterName: string) => {
  if (filterName === 'All') return bookings.value.length
  if (filterName === 'In Progress') return activeBookingsCount.value
  return bookings.value.filter(b => b.status.toLowerCase().includes(filterName.toLowerCase())).length
}

const filteredBookings = computed(() => {
  let list = bookings.value
  if (selectedFilter.value !== 'All') {
    if (selectedFilter.value === 'In Progress') {
      list = list.filter(b => {
        const st = b.status.toLowerCase()
        return st.includes('in progress') || st.includes('pending') || st.includes('confirmed') || st.includes('dispatched') || st.includes('on the way') || st.includes('active')
      })
    } else {
      list = list.filter(b => b.status.toLowerCase().includes(selectedFilter.value.toLowerCase()))
    }
  }
  if (bookingSearch.value.trim()) {
    const q = bookingSearch.value.toLowerCase().trim()
    list = list.filter(b =>
      b.service.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q)
    )
  }
  return list
})

const handleLogout = async () => {
  const result = await showConfirmAlert('Logout Confirmation', 'Are you sure you want to log out from your account?', 'Yes, Logout')
  if (result.isConfirmed) {
    authStore.logout()
    router.push('/login')
  }
}

const saveProfile = async () => {
  authStore.updateProfile({
    name: profileForm.value.name,
    email: profileForm.value.email,
    phone: profileForm.value.phone,
    address: profileForm.value.address
  })
  await showSuccessAlert('Profile Updated', 'Your profile details have been saved successfully!')
}

const isSubmittingComplaint = ref(false)
const complaintForm = ref({
  name: authStore.user?.name || '',
  phone: authStore.user?.phone || '',
  message: ''
})
const complaintFormErrors = ref({
  name: '',
  phone: '',
  message: ''
})

const clearComplaintFormErrors = () => {
  complaintFormErrors.value = {
    name: '',
    phone: '',
    message: ''
  }
}

watch(() => authStore.user, (newUser) => {
  if (newUser) {
    if (!complaintForm.value.name) complaintForm.value.name = newUser.name || ''
    if (!complaintForm.value.phone) complaintForm.value.phone = newUser.phone || ''
  }
})

const submitNewComplaint = async () => {
  clearComplaintFormErrors()

  let hasError = false
  if (!complaintForm.value.name.trim()) {
    complaintFormErrors.value.name = 'The name field is required.'
    hasError = true
  }
  if (!complaintForm.value.phone.trim()) {
    complaintFormErrors.value.phone = 'The phone number field is required.'
    hasError = true
  }
  if (!complaintForm.value.message.trim()) {
    complaintFormErrors.value.message = 'The message field is required.'
    hasError = true
  }

  if (hasError) {
    showErrorToast('Please fix the errors in the form.')
    return
  }

  isSubmittingComplaint.value = true

  try {
    const { data } = await api.post('/api/complaint', {
      name: (complaintForm.value.name || '').trim(),
      phone: (complaintForm.value.phone || '').trim(),
      email: authStore.user?.email || '',
      message: (complaintForm.value.message || '').trim()
    })

    if (data?.status === false) {
      if (data?.errors) {
        if (data.errors.name) complaintFormErrors.value.name = Array.isArray(data.errors.name) ? data.errors.name[0] : data.errors.name
        if (data.errors.phone) complaintFormErrors.value.phone = Array.isArray(data.errors.phone) ? data.errors.phone[0] : data.errors.phone
        if (data.errors.message) complaintFormErrors.value.message = Array.isArray(data.errors.message) ? data.errors.message[0] : data.errors.message
      }
      showErrorToast(data.message || 'Failed to submit complaint.')
      return
    }

    // Prepend to complaints list on user dashboard
    complaints.value.unshift({
      id: `#CMP-${Math.floor(1000 + Math.random() * 9000)}`,
      title: complaintForm.value.message.length > 35 ? complaintForm.value.message.substring(0, 35) + '...' : complaintForm.value.message,
      bookingId: '#CMP-REF',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      description: complaintForm.value.message,
      status: 'Pending',
      statusClass: 'status-active'
    })

    complaintForm.value = {
      name: authStore.user?.name || '',
      phone: authStore.user?.phone || '',
      message: ''
    }
    clearComplaintFormErrors()
    showNewComplaintModal.value = false

    showSuccessToast('Complaint submitted successfully!')
  } catch (err: any) {
    if (err.response?.data?.errors) {
      const errs = err.response.data.errors
      if (errs.name) complaintFormErrors.value.name = Array.isArray(errs.name) ? errs.name[0] : errs.name
      if (errs.phone) complaintFormErrors.value.phone = Array.isArray(errs.phone) ? errs.phone[0] : errs.phone
      if (errs.message) complaintFormErrors.value.message = Array.isArray(errs.message) ? errs.message[0] : errs.message
    }
    const backendMsg = getApiError(err)
    showErrorToast(backendMsg)
  } finally {
    isSubmittingComplaint.value = false
  }
}

const viewBooking = (booking: any) => {
  selectedBooking.value = booking
  showBookingModal.value = true
}
</script>

<style scoped>
.dashboard-container {
  max-width: 1240px;
  margin: 30px auto;
  padding: 0 20px;
  font-family: inherit;
}

/* Header Banner */
.dashboard-header {
  background: linear-gradient(135deg, #1A56DB 0%, #1E40AF 100%);
  color: white;
  border-radius: 20px;
  padding: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  box-shadow: 0 10px 30px rgba(26, 86, 219, 0.25);
}

.user-welcome {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-box {
  position: relative;
}

.user-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.8);
}

.online-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 14px;
  height: 14px;
  background: #22C55E;
  border: 2px solid white;
  border-radius: 50%;
}

.user-info h2 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 6px;
}

.user-email {
  font-size: 14px;
  color: #DBEAFE;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.member-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-primary-action {
  background: #22C55E;
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s, transform 0.1s;
}

.btn-primary-action:hover {
  background: #16A34A;
  transform: translateY(-2px);
}

.btn-logout {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 11px 18px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.8);
  border-color: transparent;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin: 28px 0;
}

.stat-card {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.bg-blue {
  background: #EFF6FF;
}

.bg-green {
  background: #F0FDF4;
}

.bg-orange {
  background: #FFFBEB;
}

.bg-purple {
  background: #F3E8FF;
}

.stat-data {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: 800;
  color: #0F172A;
}

.stat-label {
  font-size: 13px;
  color: #64748B;
}

/* Dashboard Body */
.dashboard-body {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 28px;
}

.dashboard-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: #475569;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.nav-tab:hover {
  background: #F1F5F9;
  color: #1A56DB;
}

.nav-tab.active {
  background: #1A56DB;
  color: white;
  box-shadow: 0 4px 12px rgba(26, 86, 219, 0.2);
}

.tab-icon {
  font-size: 18px;
}

.dashboard-content {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  padding: 28px;
  min-height: 450px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.pane-title {
  font-size: 20px;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 20px;
}

/* Active Tracker */
.active-tracker-card {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 30px;
}

.tracker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.service-type {
  font-weight: 700;
  font-size: 16px;
  color: #1E293B;
  display: block;
}

.booking-id {
  font-size: 13px;
  color: #64748B;
  font-family: monospace;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
}

.status-active {
  background: #FEF3C7;
  color: #D97706;
}

.status-completed {
  background: #DCFCE7;
  color: #15803D;
}

/* Progress Tracker Bar */
.progress-bar-wrap {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin: 30px 0;
}

.progress-bar-wrap::before {
  content: '';
  position: absolute;
  top: 15px;
  left: 10%;
  right: 10%;
  height: 4px;
  background: #E2E8F0;
  z-index: 1;
}

.progress-step {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #E2E8F0;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

.progress-step.completed .step-dot {
  background: #22C55E;
  color: white;
}

.progress-step.active .step-dot {
  background: #1A56DB;
  color: white;
  box-shadow: 0 0 0 4px rgba(26, 86, 219, 0.2);
}

.step-name {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.technician-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #E2E8F0;
  flex-wrap: wrap;
  gap: 12px;
}

.tech-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tech-img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.btn-call-tech {
  background: #1A56DB;
  color: white;
  padding: 8px 16px;
  border-radius: 10px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
}

/* Activity List */
.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px;
  background: #F8FAFC;
  border-radius: 12px;
}

.act-icon {
  font-size: 20px;
}

.act-details {
  flex: 1;
}

.act-details p {
  margin: 0;
  color: #334155;
  font-size: 14px;
}

.act-time {
  font-size: 12px;
  color: #94A3B8;
}

.act-amount {
  font-weight: 800;
  color: #1A56DB;
}

/* Table & Filters */
.pane-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-pills {
  display: flex;
  gap: 8px;
}

.pill-btn {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid #CBD5E1;
  background: white;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.pill-btn.active {
  background: #1A56DB;
  color: white;
  border-color: #1A56DB;
}

.bookings-table-wrapper {
  overflow-x: auto;
}

.bookings-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}

.bookings-table th {
  background: #F8FAFC;
  color: #475569;
  font-weight: 700;
  padding: 12px 16px;
  border-bottom: 2px solid #E2E8F0;
}

.bookings-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #E2E8F0;
  color: #334155;
}

.font-mono {
  font-family: monospace;
}

.font-bold {
  font-weight: 700;
}

.btn-small-outline {
  padding: 4px 10px;
  border: 1px solid #1A56DB;
  color: #1A56DB;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.btn-small-outline:hover {
  background: #1A56DB;
  color: white;
}

/* Complaints & Form */
.btn-secondary-action {
  background: #1A56DB;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.complaints-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.complaint-card {
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 20px;
  background: #F8FAFC;
}

.complaint-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.complaint-id {
  font-size: 12px;
  color: #64748B;
  font-family: monospace;
}

.complaint-card h4 {
  font-size: 16px;
  color: #0F172A;
  margin-top: 2px;
}

.complaint-desc {
  color: #475569;
  font-size: 14px;
  margin-bottom: 12px;
}

.complaint-meta {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #94A3B8;
}

/* Profile Form */
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 650px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.input-field {
  padding: 12px;
  border: 1px solid #CBD5E1;
  border-radius: 10px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #1A56DB;
  box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.1);
}

.btn-save-profile {
  background: #1A56DB;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  align-self: flex-start;
}

.success-alert {
  background: #DCFCE7;
  color: #15803D;
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
}

/* Responsive Media Queries */
/* Revamped Bookings Tab Styling */
.bookings-header-flex {
  align-items: flex-start;
}

.pane-sub-desc {
  font-size: 13px;
  color: #64748B;
  margin-top: 4px;
}

.booking-controls-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.booking-search-box {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #CBD5E1;
  border-radius: 20px;
  padding: 6px 14px;
  width: 280px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.booking-search-input {
  border: none;
  outline: none;
  font-size: 13px;
  width: 100%;
  color: #1E293B;
  background: transparent;
}

.pill-badge-count {
  background: rgba(0, 0, 0, 0.08);
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 11px;
  margin-left: 4px;
}

.pill-btn.active .pill-badge-count {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

.empty-bookings-box {
  text-align: center;
  padding: 60px 20px;
  background: #F8FAFC;
  border-radius: 16px;
  border: 1px dashed #CBD5E1;
}

.empty-icon-circle {
  font-size: 40px;
  margin-bottom: 12px;
}

.empty-bookings-box h4 {
  font-size: 18px;
  color: #0F172A;
  margin-bottom: 6px;
}

.empty-bookings-box p {
  color: #64748B;
  font-size: 14px;
  margin-bottom: 20px;
}

.bookings-cards-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.revamped-booking-card {
  background: #ffffff;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.revamped-booking-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  border-color: #CBD5E1;
}

.booking-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 14px;
  border-bottom: 1px solid #F1F5F9;
  margin-bottom: 16px;
}

.order-id-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #F8FAFC;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid #E2E8F0;
}

.order-id-code {
  font-size: 13px;
  font-weight: 700;
  color: #1E293B;
  font-family: monospace;
}

.status-badge-pill {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-active {
  background: #EFF6FF;
  color: #1A56DB;
}

.status-completed {
  background: #DCFCE7;
  color: #16A34A;
}

.booking-service-title {
  font-size: 18px;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 16px;
}

.booking-meta-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  background: #F8FAFC;
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 18px;
}

.meta-cell {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.meta-ic {
  font-size: 18px;
}

.meta-lbl {
  display: block;
  font-size: 11px;
  color: #64748B;
  text-transform: uppercase;
  font-weight: 600;
}

.meta-val {
  font-size: 13px;
  font-weight: 700;
  color: #1E293B;
}

.price-bold {
  color: #1A56DB;
  font-size: 15px;
}

.booking-card-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.btn-track-details {
  background: #1A56DB;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.btn-track-details:hover {
  background: #1D4ED8;
  transform: translateY(-1px);
}

.btn-rebook-outline {
  background: transparent;
  color: #475569;
  border: 1px solid #CBD5E1;
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-rebook-outline:hover {
  background: #F1F5F9;
  color: #0F172A;
}

/* Booking Details Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 999999;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
}

.booking-modal-card {
  background: white;
  border-radius: 24px;
  padding: 28px 32px;
  max-width: 640px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
  margin: auto;
  overflow: hidden;
  box-sizing: border-box;
}

/* File New Complaint Modal (Exact Match to Screenshot) */
.complaint-modal-card-screenshot {
  background: #ffffff;
  border-radius: 20px;
  padding: 44px 28px 24px;
  max-width: 600px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  margin: auto;
  box-sizing: border-box;
}

.complaint-screenshot-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-inputs-row {
  display: flex;
  gap: 16px;
}

.form-group-half {
  flex: 1;
}

.form-group-full {
  width: 100%;
}

.form-input-pill {
  width: 100%;
  padding: 12px 20px;
  border: 1px solid #CBD5E1;
  border-radius: 20px;
  font-size: 14px;
  color: #1E293B;
  outline: none;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-input-pill::placeholder {
  color: #64748B;
}

.form-input-pill:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea-box {
  width: 100%;
  padding: 14px 18px;
  border: 1px solid #CBD5E1;
  border-radius: 12px;
  font-size: 14px;
  color: #1E293B;
  outline: none;
  background: white;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-textarea-box::placeholder {
  color: #64748B;
}

.form-textarea-box:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-action-right {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

.btn-submit-blue {
  background: #5096F6;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 38px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  box-shadow: 0 4px 12px rgba(80, 150, 246, 0.25);
}

.btn-submit-blue:hover {
  background: #3B82F6;
  transform: translateY(-1px);
}

.btn-submit-blue:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-close-modal {
  position: absolute;
  top: 12px;
  right: 14px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #F1F5F9;
  border: 1px solid #E2E8F0;
  color: #64748B;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}

.btn-close-modal:hover {
  background: #EF4444;
  color: white;
  border-color: #EF4444;
}

.modal-booking-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding-right: 40px;
  padding-bottom: 14px;
  border-bottom: 1px solid #F1F5F9;
}

.modal-order-tag {
  font-size: 12px;
  font-weight: 700;
  color: #1A56DB;
  background: #EFF6FF;
  padding: 3px 10px;
  border-radius: 12px;
  display: inline-block;
  margin-bottom: 8px;
}

.modal-service-name {
  font-size: 22px;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 4px;
  line-height: 1.3;
}

.modal-booking-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 4px 16px 0;
  margin-top: 4px;
}

.modal-tracker-box {
  background: #F8FAFC;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.tracker-title {
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 16px;
}

.tracker-timeline {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.tracker-timeline::before {
  content: '';
  position: absolute;
  top: 14px;
  left: 10%;
  right: 10%;
  height: 3px;
  background: #E2E8F0;
  z-index: 1;
}

.timeline-step {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #64748B;
}

.step-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #E2E8F0;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: bold;
}

.timeline-step.completed .step-icon {
  background: #22C55E;
  color: white;
}

.timeline-step.active .step-icon {
  background: #1A56DB;
  color: white;
  box-shadow: 0 0 0 4px rgba(26, 86, 219, 0.2);
}

.cancelled-banner {
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  color: #991B1B;
  border-radius: 12px;
  padding: 14px 16px;
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 20px;
}

.cancellation-reason {
  font-weight: 400;
  font-size: 13px;
  margin-top: 4px;
  color: #7F1D1D;
}

.modal-info-summary {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  padding: 0 4px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
}

.info-lbl {
  color: #64748B;
  flex-shrink: 0;
}

.info-val {
  font-weight: 700;
  color: #0F172A;
  text-align: right;
}

.modal-items-box {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 16px 20px;
}

.items-title {
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 12px;
}

.modal-items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.item-name-group {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1E293B;
}

.item-bullet {
  color: #1A56DB;
  font-weight: bold;
}

.item-qty {
  background: #E2E8F0;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}

.item-price {
  font-weight: 700;
  color: #0F172A;
}

.modal-total-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed #CBD5E1;
  font-size: 15px;
  font-weight: 600;
  color: #475569;
}

.total-val {
  font-size: 18px;
  font-weight: 800;
  color: #1A56DB;
}

.modal-booking-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #F1F5F9;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-cancel-modal {
  background: #FEF2F2;
  color: #DC2626;
  border: 1px solid #FECACA;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel-modal:hover {
  background: #DC2626;
  color: white;
}

.btn-delete-modal {
  background: #F3F4F6;
  color: #4B5563;
  border: 1px solid #E5E7EB;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete-modal:hover {
  background: #E5E7EB;
  color: #111827;
}

.btn-modal-done {
  background: #1A56DB;
  color: white;
  border: none;
  padding: 10px 22px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-modal-done:hover {
  background: #1D4ED8;
}

/* Responsive Media Queries */
@media (max-width: 960px) {
  .dashboard-body {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .dashboard-nav {
    flex-direction: row;
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 6px;
    gap: 10px;
    -webkit-overflow-scrolling: touch;
  }

  .nav-tab {
    flex-shrink: 0;
    padding: 10px 16px;
    font-size: 14px;
  }
}

@media (max-width: 900px) {
  .dashboard-container {
    padding: 16px 12px 40px;
  }

  .booking-meta-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .dashboard-content {
    padding: 18px 14px;
    border-radius: 16px;
  }

  .booking-controls-wrap {
    width: 100%;
    align-items: stretch;
  }

  .booking-search-box {
    width: 100%;
  }

  .booking-meta-list {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .booking-card-actions {
    flex-direction: column;
  }

  .btn-track-details,
  .btn-rebook-outline {
    width: 100%;
    text-align: center;
  }

  .booking-modal-card {
    padding: 20px 16px;
    max-height: 94vh;
    border-radius: 20px;
  }

  .modal-booking-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .modal-booking-footer {
    flex-direction: column;
    gap: 8px;
  }

  .btn-cancel-modal,
  .btn-delete-modal,
  .btn-modal-done {
    width: 100%;
    text-align: center;
  }

  .tracker-timeline::before {
    display: none;
  }

  .tracker-timeline {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .timeline-step {
    flex-direction: row;
    gap: 10px;
  }
}

@media (max-width: 640px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px 16px;
    gap: 16px;
  }

  .user-welcome {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }

  .btn-primary-action,
  .btn-logout {
    flex: 1;
    text-align: center;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .progress-bar-wrap::before {
    display: none;
  }

  .progress-bar-wrap {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .progress-step {
    flex-direction: row;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
