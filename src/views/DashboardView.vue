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
          <span class="stat-value">12</span>
          <span class="stat-label">Total Services</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-green">⏳</div>
        <div class="stat-data">
          <span class="stat-value">2 Active</span>
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
          <span class="stat-value">0 Open</span>
          <span class="stat-label">Pending Complaints</span>
        </div>
      </div>
    </div>

    <!-- Dashboard Content Area with Sidebar Nav -->
    <div class="dashboard-body">
      <!-- Sidebar / Mobile Horizontal Tabs -->
      <aside class="dashboard-nav">
        <button 
          class="nav-tab" 
          :class="{ active: activeTab === 'overview' }"
          @click="activeTab = 'overview'"
        >
          <span class="tab-icon">📊</span> Overview
        </button>
        <button 
          class="nav-tab" 
          :class="{ active: activeTab === 'bookings' }"
          @click="activeTab = 'bookings'"
        >
          <span class="tab-icon">📅</span> My Bookings
        </button>
        <button 
          class="nav-tab" 
          :class="{ active: activeTab === 'complaints' }"
          @click="activeTab = 'complaints'"
        >
          <span class="tab-icon">⚠️</span> Complaints
        </button>
        <button 
          class="nav-tab" 
          :class="{ active: activeTab === 'profile' }"
          @click="activeTab = 'profile'"
        >
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
              <span class="status-badge status-active">Technician Dispatched</span>
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

        <!-- Bookings Tab -->
        <div v-else-if="activeTab === 'bookings'" class="tab-pane">
          <div class="pane-header-flex">
            <h3 class="pane-title">All Service Bookings</h3>
            <div class="filter-pills">
              <button 
                v-for="filter in ['All', 'Active', 'Completed', 'Cancelled']" 
                :key="filter"
                class="pill-btn"
                :class="{ active: selectedFilter === filter }"
                @click="selectedFilter = filter"
              >
                {{ filter }}
              </button>
            </div>
          </div>

          <div class="bookings-table-wrapper">
            <table class="bookings-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Service Title</th>
                  <th>Date & Time</th>
                  <th>City</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="booking in filteredBookings" :key="booking.id">
                  <td class="font-mono">{{ booking.id }}</td>
                  <td><strong>{{ booking.service }}</strong></td>
                  <td>{{ booking.date }}</td>
                  <td>{{ booking.city }}</td>
                  <td class="font-bold">{{ booking.price }}</td>
                  <td>
                    <span class="status-badge" :class="booking.statusClass">{{ booking.status }}</span>
                  </td>
                  <td>
                    <button class="btn-small-outline" @click="viewBooking(booking)">Details</button>
                  </td>
                </tr>
              </tbody>
            </table>
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
          <form @submit.prevent="saveProfile" class="profile-form">
            <div class="form-row">
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" v-model="profileForm.name" required class="input-field" />
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" v-model="profileForm.email" required class="input-field" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" v-model="profileForm.phone" required class="input-field" />
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
              <textarea v-model="profileForm.address" rows="3" class="input-field" placeholder="House #, Street #, Sector/Area..."></textarea>
            </div>

            <div v-if="saveSuccessMsg" class="success-alert">
              {{ saveSuccessMsg }}
            </div>

            <button type="submit" class="btn-save-profile">Save Changes</button>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
const activeTab = ref<'overview' | 'bookings' | 'complaints' | 'profile'>('overview')
const selectedFilter = ref('All')
const showNewComplaintModal = ref(false)
const saveSuccessMsg = ref('')

const profileForm = ref({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
  phone: authStore.user?.phone || '+92 300 1234567',
  city: 'Lahore',
  address: 'Suite 402, Block H-3, Johar Town, Lahore'
})

const bookings = ref([
  { id: '#ORD-98421', service: 'Master AC Deep Cleaning & Service', date: 'Aug 09, 2026 - 02:00 PM', city: 'Lahore', price: 'Rs 1,500', status: 'In Progress', statusClass: 'status-active' },
  { id: '#ORD-98310', service: 'Automatic Washing Machine Repairing', date: 'Aug 08, 2026 - 11:30 AM', city: 'Lahore', price: 'Rs 1,200', status: 'Completed', statusClass: 'status-completed' },
  { id: '#ORD-97554', service: 'Muslim shower Replacement', date: 'Aug 05, 2026 - 04:00 PM', city: 'Karachi', price: 'Rs 450', status: 'Completed', statusClass: 'status-completed' },
  { id: '#ORD-96112', service: 'Pest Control & Fumigation', date: 'Jul 28, 2026 - 10:00 AM', city: 'Islamabad', price: 'Rs 3,500', status: 'Completed', statusClass: 'status-completed' },
])

const complaints = ref([
  { id: '#CMP-1042', title: 'Delay in Technician Arrival', bookingId: '#ORD-97554', date: 'Aug 05, 2026', description: 'Technician reached 30 minutes later than promised slot.', status: 'Resolved', statusClass: 'status-completed' }
])

const filteredBookings = computed(() => {
  if (selectedFilter.value === 'All') return bookings.value
  return bookings.value.filter(b => b.status.toLowerCase().includes(selectedFilter.value.toLowerCase()))
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const saveProfile = () => {
  if (authStore.user) {
    authStore.user.name = profileForm.value.name
    authStore.user.email = profileForm.value.email
    authStore.user.phone = profileForm.value.phone
    localStorage.setItem('mahir_user', JSON.stringify(authStore.user))
  }
  saveSuccessMsg.value = 'Profile details updated successfully!'
  setTimeout(() => {
    saveSuccessMsg.value = ''
  }, 3000)
}

const viewBooking = (booking: any) => {
  alert(`Booking Details:\nID: ${booking.id}\nService: ${booking.service}\nDate: ${booking.date}\nAmount: ${booking.price}\nStatus: ${booking.status}`)
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

.bg-blue { background: #EFF6FF; }
.bg-green { background: #F0FDF4; }
.bg-orange { background: #FFFBEB; }
.bg-purple { background: #F3E8FF; }

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

.font-mono { font-family: monospace; }
.font-bold { font-weight: 700; }

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
@media (max-width: 900px) {
  .dashboard-body {
    grid-template-columns: 1fr;
  }

  .dashboard-nav {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 6px;
  }

  .nav-tab {
    white-space: nowrap;
  }
}

@media (max-width: 640px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
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
</style>
