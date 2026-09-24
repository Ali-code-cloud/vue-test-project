<template>
    <header class="header">
        <div class="header-container">
            <!-- Logo -->
            <div class="logo">
                <router-link to="/" class="logo-link">
                    <img :src="logo" alt="Mr Home Service" class="logo-img" />
                </router-link>
            </div>

            <!-- Navigation Links -->
            <nav class="nav-desktop">
                <ul class="nav-list">
                    <li>
                        <router-link to="/" class="nav-link" active-class="active">Home</router-link>
                    </li>
                    <li>
                        <router-link to="/about" class="nav-link" active-class="active">About Us</router-link>
                    </li>

                    <!-- Services Dropdown -->
                    <li class="nav-item-dropdown" @mouseenter="isServicesOpen = true"
                        @mouseleave="isServicesOpen = false">
                        <router-link to="/services" class="nav-link services-link" active-class="active">
                            <span>Services</span>
                            <svg class="chevron-icon" :class="{ rotate: isServicesOpen }" width="12" height="12"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                                stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </router-link>
                        <transition name="dropdown">
                            <div v-if="isServicesOpen" class="services-menu">
                                <router-link to="/services" class="menu-item" @click="isServicesOpen = false">
                                    All Services
                                </router-link>
                                <router-link v-for="category in categories" :key="category.id"
                                    :to="`/services/category/${category.id}`" class="menu-item"
                                    @click="isServicesOpen = false">
                                    {{ category.name }}
                                </router-link>
                            </div>
                        </transition>
                    </li>

                    <li>
                        <router-link to="/blog" class="nav-link" active-class="active">Blog</router-link>
                    </li>
                </ul>
            </nav>

            <!-- Actions Right -->
            <div class="header-actions">
                <!-- Location Selector Custom Dropdown -->
                <div class="location-selector-wrap" ref="locationDropdownRef">
                    <button type="button" class="location-trigger-btn" @click.stop="toggleLocationDropdown"
                        :class="{ open: isLocationOpen }" aria-label="Select City">
                        <span class="city-name">{{ selectedCity }}</span>
                        <svg class="location-chevron" :class="{ rotate: isLocationOpen }" width="14" height="14"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                            stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>

                    <!-- Dropdown Popup Card -->
                    <transition name="dropdown">
                        <div v-if="isLocationOpen" class="location-menu">
                            <div v-for="city in cities" :key="city" class="location-option"
                                :class="{ selected: selectedCity === city }" @click="selectCity(city)">
                                {{ city }}
                            </div>
                        </div>
                    </transition>
                </div>

                <template v-if="!authStore.isAuthenticated">
                    <button @click="cartStore.openAuthModal()" class="btn-auth">signin/signUp</button>
                </template>
                <template v-else>
                    <div class="user-dropdown-wrap" ref="userDropdownRef">
                        <button type="button" class="user-profile-btn" @click.stop="isUserMenuOpen = !isUserMenuOpen">
                            <img :src="authStore.user?.avatar || defaultAvatar" class="mini-avatar" />
                            <span class="user-short-name">{{ authStore.user?.name || 'My Account' }}</span>
                            <svg class="chevron-icon" :class="{ rotate: isUserMenuOpen }" width="12" height="12"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        <transition name="dropdown">
                            <div v-if="isUserMenuOpen" class="user-menu-dropdown">
                                <div class="user-menu-header">
                                    <strong class="menu-user-name">{{ authStore.user?.name }}</strong>
                                    <span class="menu-user-sub">{{ authStore.user?.email || authStore.user?.phone
                                        }}</span>
                                </div>
                                <div class="menu-divider"></div>
                                <router-link to="/dashboard?tab=overview" class="user-menu-item"
                                    @click="isUserMenuOpen = false">
                                    📊 Dashboard Overview
                                </router-link>
                                <router-link to="/dashboard?tab=bookings" class="user-menu-item"
                                    @click="isUserMenuOpen = false">
                                    📦 My Orders & Bookings
                                </router-link>
                                <router-link to="/dashboard?tab=profile" class="user-menu-item"
                                    @click="isUserMenuOpen = false">
                                    ⚙️ Change / Update Profile
                                </router-link>
                                <div class="menu-divider"></div>
                                <button @click="handleLogout" class="user-menu-item logout-item">
                                    🚪 Sign Out
                                </button>
                            </div>
                        </transition>
                    </div>
                </template>
            </div>

            <!-- Mobile Right Controls (Menu Toggle) -->
            <div class="mobile-right-actions">
                <button class="menu-toggle" @click="toggleMenu" aria-label="Toggle menu">
                    <span class="hamburger" :class="{ active: isMenuOpen }">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </button>
            </div>
        </div>

        <!-- Floating Quick Contact Action Buttons -->
        <div class="floating-contact">
            <button @click="openCallModal" class="float-btn phone-btn" title="Call Us" type="button">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path
                        d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
            </button>
            <a href="https://wa.me/923000000000" target="_blank" class="float-btn whatsapp-btn" title="WhatsApp Chat">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path
                        d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.84 9.84 0 0012.04 2zm5.82 14.16c-.25.7-1.46 1.34-2.02 1.4-.52.06-1.19.14-3.86-.92-2.88-1.14-4.73-4.08-4.88-4.27-.14-.19-1.18-1.57-1.18-2.99 0-1.42.74-2.12 1.01-2.41.27-.29.6-.36.8-.36.2 0 .4 0 .58.01.19.01.44-.07.69.53.25.6.86 2.09.93 2.24.07.15.12.33.02.53-.1.2-.15.33-.3.51-.15.18-.32.4-.46.54-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.03 1.12.99 2.07 1.3 2.36 1.44.29.14.46.12.63-.07.17-.19.74-.86.94-1.15.2-.29.4-.24.67-.14.27.1 1.72.81 2.02.96.3.15.5.22.57.34.07.12.07.72-.18 1.42z" />
                </svg>
            </a>
        </div>

        <!-- Mobile Drawer -->
        <transition name="slide">
            <div v-if="isMenuOpen" class="mobile-overlay" @click="closeMenu">
                <div class="mobile-drawer" @click.stop>
                    <div class="mobile-header">
                        <span class="logo-text">Mr Home Services</span>
                        <button class="close-btn" @click="closeMenu">✕</button>
                    </div>
                    <ul class="mobile-nav-list">
                        <li><router-link to="/" @click="closeMenu">Home</router-link></li>
                        <li><router-link to="/about" @click="closeMenu">About Us</router-link></li>
                        <li>
                            <router-link to="/services" @click="closeMenu">Services</router-link>
                            <div v-if="categories.length > 0" class="mobile-subcategories">
                                <router-link v-for="category in categories" :key="category.id"
                                    :to="`/services/category/${category.id}`" @click="closeMenu" class="mobile-subcat-link">
                                    ↳ {{ category.name }}
                                </router-link>
                            </div>
                        </li>
                        <li><router-link to="/blog" @click="closeMenu">Blog</router-link></li>
                    </ul>
                    <div class="mobile-actions">
                        <div class="mobile-city-selector">
                            <label class="mobile-label">Select City:</label>
                            <div class="mobile-city-pills">
                                <button v-for="city in cities" :key="city" class="city-pill"
                                    :class="{ active: selectedCity === city }" @click="selectCity(city)">
                                    {{ city }}
                                </button>
                            </div>
                        </div>
                        <template v-if="!authStore.isAuthenticated">
                            <button class="btn-auth full-width text-center" @click="openMobileAuth">
                                signin/signUp
                            </button>
                        </template>
                        <template v-else>
                            <router-link to="/dashboard" class="btn-auth full-width text-center bg-green"
                                @click="closeMenu">
                                Go to Dashboard
                            </router-link>
                            <button @click="handleLogoutMobile" class="btn-mobile-logout">
                                Sign Out
                            </button>
                        </template>
                    </div>
                </div>
            </div>
        </transition>
        <!-- Call Button Complaint Modal (Matching Screenshot) -->
        <transition name="modal-fade">
            <div v-if="showCallModal" class="call-modal-overlay" @click.self="closeCallModal">
                <div class="call-modal-card">
                    <!-- Close button on top-right -->
                    <button class="call-modal-close" @click="closeCallModal" aria-label="Close modal">✕</button>

                    <h3 class="call-modal-title">Please fill in the information below</h3>

                    <form @submit.prevent="handleCallSubmit" class="call-modal-form">
                        <div v-if="callErrorMsg" class="call-modal-error">{{ callErrorMsg }}</div>
                        <div v-if="callSuccessMsg" class="call-modal-success">{{ callSuccessMsg }}</div>

                        <div class="form-group-field">
                            <input v-model="callName" type="text" placeholder="Your Name" class="call-input-pill"
                                required />
                        </div>

                        <div class="form-group-field">
                            <input v-model="callPhone" type="tel" placeholder="Mobile Number" class="call-input-pill"
                                required />
                        </div>

                        <div class="call-modal-footer">
                            <button type="submit" class="btn-call-send" :disabled="isSubmittingCall">
                                {{ isSubmittingCall ? 'Sending...' : 'Send' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </transition>
    </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import logo from '@/assets/new-logo.png'
import { useAuthStore, getApiError } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import api from '@/composables/useApi'

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

const cities = ref<string[]>(['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Multan'])
const selectedCity = ref('Lahore')
const isLocationOpen = ref(false)
const isServicesOpen = ref(false)
const isUserMenuOpen = ref(false)
const isMenuOpen = ref(false)
const locationDropdownRef = ref<HTMLElement | null>(null)
const userDropdownRef = ref<HTMLElement | null>(null)

// Call Modal state
const showCallModal = ref(false)
const callName = ref('')
const callPhone = ref('')
const isSubmittingCall = ref(false)
const callSuccessMsg = ref('')
const callErrorMsg = ref('')

const openCallModal = () => {
    if (!authStore.isAuthenticated) {
        cartStore.openAuthModal()
        return
    }
    callName.value = authStore.user?.name || ''
    callPhone.value = authStore.user?.phone || ''
    callSuccessMsg.value = ''
    callErrorMsg.value = ''
    showCallModal.value = true
}

const closeCallModal = () => {
    showCallModal.value = false
    callSuccessMsg.value = ''
    callErrorMsg.value = ''
}

const handleCallSubmit = async () => {
    if (!authStore.isAuthenticated) {
        closeCallModal()
        cartStore.openAuthModal()
        return
    }

    if (!callName.value.trim() || !callPhone.value.trim()) {
        callErrorMsg.value = 'Please provide both your name and mobile number.'
        return
    }

    isSubmittingCall.value = true
    callErrorMsg.value = ''
    callSuccessMsg.value = ''

    const payload = {
        name: callName.value.trim(),
        phone: callPhone.value.trim(),
        email: authStore.user?.email || 'john@example.com',
        message: 'I am facing an issue with my account. Please look into it.'
    }

    try {
        const { data } = await api.post('/api/complaint', payload)
        if (data?.status || data?.message) {
            callSuccessMsg.value = data.message || 'Your complaint has been submitted successfully. We will get back to you soon!'
            setTimeout(() => {
                closeCallModal()
            }, 2000)
            return
        }
    } catch (e: any) {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('http://mrhomeservices.test:8001/api/complaint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(payload)
            })
            const resData = await res.json()
            if (resData?.status || resData?.message) {
                callSuccessMsg.value = resData.message || 'Your complaint has been submitted successfully. We will get back to you soon!'
                setTimeout(() => {
                    closeCallModal()
                }, 2000)
                return
            }
        } catch (err) {
            // Fallback
        }
        callErrorMsg.value = getApiError(e)
    } finally {
        isSubmittingCall.value = false
    }
}

const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'

const toggleLocationDropdown = () => {
    isLocationOpen.value = !isLocationOpen.value
}

const selectCity = (city: string) => {
    selectedCity.value = city
    isLocationOpen.value = false
}

const fetchActiveCities = async () => {
    try {
        const { data } = await api.get('/api/active-cities')
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
            const mapped = data.data.map((c: any) => c.name).filter((name: any): name is string => typeof name === 'string' && name.length > 0)
            if (mapped.length > 0) {
                cities.value = mapped
                const firstCity = mapped[0]
                if (firstCity && !cities.value.includes(selectedCity.value)) {
                    selectedCity.value = firstCity
                }
            }
        }
    } catch (e) {
        try {
            const res = await fetch('http://mrhomeservices.test:8001/api/active-cities')
            const resData = await res.json()
            if (resData?.data && Array.isArray(resData.data) && resData.data.length > 0) {
                const mapped = resData.data.map((c: any) => c.name).filter((name: any): name is string => typeof name === 'string' && name.length > 0)
                if (mapped.length > 0) {
                    cities.value = mapped
                    const firstCity = mapped[0]
                    if (firstCity && !cities.value.includes(selectedCity.value)) {
                        selectedCity.value = firstCity
                    }
                }
            }
        } catch (err) {
            // Keep default fallback cities
        }
    }
}

const categories = ref<any[]>([])

const fetchCategories = async () => {
    try {
        const { data } = await api.get('/api/service-categories')
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
            categories.value = data.data
            return
        }
        if (Array.isArray(data) && data.length > 0) {
            categories.value = data
            return
        }
    } catch (e) {
        // Fallback
    }

    try {
        const res = await fetch('http://mrhomeservices.test:8001/api/service-categories')
        const resData = await res.json()
        if (resData?.data && Array.isArray(resData.data) && resData.data.length > 0) {
            categories.value = resData.data
            return
        }
        if (Array.isArray(resData) && resData.length > 0) {
            categories.value = resData
            return
        }
    } catch (err) {
        // Keep empty
    }
}

const handleClickOutside = (event: MouseEvent) => {
    if (locationDropdownRef.value && !locationDropdownRef.value.contains(event.target as Node)) {
        isLocationOpen.value = false
    }
    if (userDropdownRef.value && !userDropdownRef.value.contains(event.target as Node)) {
        isUserMenuOpen.value = false
    }
}

onMounted(() => {
    window.addEventListener('click', handleClickOutside)
    fetchActiveCities()
    fetchCategories()
})

onUnmounted(() => {
    window.removeEventListener('click', handleClickOutside)
})

const openMobileAuth = () => {
    closeMenu()
    cartStore.openAuthModal()
}

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
    isMenuOpen.value = false
}

const handleLogout = () => {
    authStore.logout()
    router.push('/login')
}

const handleLogoutMobile = () => {
    closeMenu()
    handleLogout()
}
</script>

<style scoped>
.header {
    background: #ffffff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.header-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

/* Logo */
.logo {
    display: flex;
    align-items: center;
}

.logo-img {
    height: 56px;
    width: auto;
    object-fit: contain;
}

.logo-link {
    text-decoration: none;
    display: flex;
    align-items: center;
}

.logo-text {
    font-size: 26px;
    font-weight: 800;
    color: #1A56DB;
    letter-spacing: -0.5px;
}

/* Desktop Nav */
.nav-desktop {
    display: flex;
    align-items: center;
}

.nav-list {
    display: flex;
    list-style: none;
    gap: 32px;
    margin: 0;
    padding: 0;
    align-items: center;
}

.nav-link {
    color: #475569;
    font-size: 15px;
    font-weight: 500;
    transition: color 0.2s;
    padding: 4px 0;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 4px;
}

.nav-link:hover,
.nav-link.active {
    color: #1A56DB;
    font-weight: 600;
}

.nav-item-dropdown {
    position: relative;
}

.services-link {
    cursor: pointer;
}

.chevron-icon {
    transition: transform 0.2s ease;
}

.chevron-icon.rotate {
    transform: rotate(180deg);
}

.services-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: -12px;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #E2E8F0;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
    min-width: 200px;
    max-height: 320px;
    overflow-y: auto;
    padding: 8px 0;
    z-index: 1100;
}

.menu-item {
    display: block;
    padding: 10px 18px;
    color: #475569;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
}

.menu-item:hover {
    background: #F8FAFC;
    color: #1A56DB;
}

.mobile-subcategories {
    padding-left: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 6px;
    margin-bottom: 8px;
}

.mobile-subcat-link {
    font-size: 13px;
    color: #64748B;
    text-decoration: none;
    transition: color 0.15s;
}

.mobile-subcat-link:hover {
    color: #1A56DB;
}

.dashboard-nav-badge {
    color: #1A56DB;
    font-weight: 700;
    background: #EFF6FF;
    padding: 6px 14px !important;
    border-radius: 20px;
}

/* Header Right Actions */
.header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
}

/* Location Custom Dropdown Selector */
.location-selector-wrap {
    position: relative;
}

.location-trigger-btn {
    background: #F4F6F9;
    border: 1px solid transparent;
    border-radius: 24px;
    padding: 7px 18px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    outline: none;
}

.location-trigger-btn:hover,
.location-trigger-btn.open {
    background: #EAEFF7;
}

.city-name {
    color: #0D52CD;
    font-size: 15px;
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 1.5px;
}

.location-chevron {
    color: #0D52CD;
    transition: transform 0.2s ease;
}

.location-chevron.rotate {
    transform: rotate(180deg);
}

.location-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #E2E8F0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    min-width: 150px;
    padding: 8px 0;
    z-index: 1100;
}

.location-option {
    padding: 10px 20px;
    color: #475569;
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
}

.location-option:hover {
    background: #F8FAFC;
    color: #0D52CD;
}

.location-option.selected {
    color: #0D52CD;
    font-weight: 700;
}

/* Auth Sign in / Sign up Button */
.btn-auth {
    background: #0D52CD;
    color: #ffffff;
    border: none;
    border-radius: 24px;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
    letter-spacing: 0.2px;
}

.btn-auth:hover {
    background: #0B46B3;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(13, 82, 205, 0.25);
}

/* User Logged In State */
.user-dropdown-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
}

.user-profile-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #F1F5F9;
    padding: 4px 12px 4px 4px;
    border-radius: 24px;
    text-decoration: none;
    color: #1E293B;
    font-weight: 600;
    font-size: 14px;
    transition: background 0.2s;
}

.user-profile-btn:hover {
    background: #E2E8F0;
}

.mini-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}

.btn-logout-header {
    background: transparent;
    border: 1px solid #E2E8F0;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.2s;
}

.btn-logout-header:hover {
    background: #FEE2E2;
}

/* Floating Contact Actions */
.floating-contact {
    position: fixed;
    right: 16px;
    top: 140px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 1050;
}

.float-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    text-decoration: none;
}

.float-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.22);
}

.phone-btn {
    background: #0D52CD;
}

.whatsapp-btn {
    background: #25D366;
}

.mobile-right-actions {
    display: none;
    align-items: center;
    gap: 8px;
}

.hamburger {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 24px;
}

.hamburger span {
    display: block;
    height: 2px;
    background: #1E293B;
    border-radius: 2px;
}

@media (max-width: 880px) {
    .nav-desktop,
    .header-actions {
        display: none;
    }

    .mobile-right-actions {
        display: flex;
    }

    .menu-toggle {
        display: block;
    }
}

/* Mobile Drawer */
.mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2000;
}

.mobile-drawer {
    position: absolute;
    top: 0;
    right: 0;
    width: 290px;
    max-width: 85vw;
    height: 100%;
    background: white;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.mobile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.close-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #64748B;
}

.mobile-nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.mobile-nav-list a {
    color: #334155;
    font-size: 16px;
    font-weight: 500;
    text-decoration: none;
}

.mobile-dash-link {
    color: #0D52CD !important;
    font-weight: 700 !important;
}

.mobile-actions {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: auto;
}

.mobile-label {
    font-size: 13px;
    font-weight: 600;
    color: #64748B;
    margin-bottom: 8px;
    display: block;
}

.mobile-city-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.city-pill {
    background: #F1F5F9;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 6px 12px;
    font-size: 13px;
    color: #475569;
    cursor: pointer;
}

.city-pill.active {
    background: #0D52CD;
    color: white;
    border-color: #0D52CD;
}

.full-width {
    width: 100%;
}

.text-center {
    text-align: center;
}

.bg-green {
    background: #22C55E !important;
}

.btn-mobile-logout {
    background: #FEE2E2;
    color: #DC2626;
    border: none;
    border-radius: 24px;
    padding: 10px;
    font-weight: 600;
    cursor: pointer;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

/* Quick Cart Icon Button */
.cart-icon-btn {
    position: relative;
    color: #334155;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 50%;
    transition: background 0.2s, color 0.2s;
    text-decoration: none;
}

.cart-icon-btn:hover {
    background: #F1F5F9;
    color: #0D52CD;
}

.cart-count-badge {
    position: absolute;
    top: 2px;
    right: 2px;
    background: #0D52CD;
    color: #ffffff;
    font-size: 11px;
    font-weight: 700;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #ffffff;
}

/* User Menu Dropdown Popup */
.user-menu-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: #ffffff;
    border-radius: 14px;
    border: 1px solid #E2E8F0;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    min-width: 240px;
    padding: 10px 0;
    z-index: 1100;
}

.user-menu-header {
    padding: 10px 18px;
    display: flex;
    flex-direction: column;
}

.menu-user-name {
    font-size: 15px;
    color: #0F172A;
}

.menu-user-sub {
    font-size: 12px;
    color: #64748B;
}

.menu-divider {
    height: 1px;
    background: #E2E8F0;
    margin: 6px 0;
}

.user-menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 18px;
    color: #334155;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
}

.user-menu-item:hover {
    background: #F8FAFC;
    color: #0D52CD;
}

.logout-item {
    color: #DC2626;
}

.logout-item:hover {
    background: #FEE2E2;
    color: #DC2626;
}

.cart-badge-pill {
    background: #0D52CD;
    color: white;
    font-size: 12px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 12px;
}

/* Call Complaint Modal Styling */
.call-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.call-modal-card {
    background: #ffffff;
    border-radius: 16px;
    padding: 36px 36px 28px;
    width: 100%;
    max-width: 440px;
    position: relative;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
    text-align: left;
}

.call-modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    background: #ffffff;
    border: 2px solid #1E293B;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    font-size: 14px;
    font-weight: 700;
    color: #1E293B;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    line-height: 1;
    transition: transform 0.15s, background 0.15s;
}

.call-modal-close:hover {
    transform: scale(1.1);
    background: #F1F5F9;
}

.call-modal-title {
    font-size: 17px;
    font-weight: 600;
    color: #1E293B;
    margin-bottom: 24px;
}

.call-modal-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.call-input-pill {
    width: 100%;
    padding: 13px 20px;
    border-radius: 10px;
    border: 1px solid #CBD5E1;
    font-size: 14px;
    color: #1E293B;
    outline: none;
    background: #ffffff;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.call-input-pill::placeholder {
    color: #94A3B8;
    font-size: 14px;
}

.call-input-pill:focus {
    border-color: #0D52CD;
    box-shadow: 0 0 0 3px rgba(13, 82, 205, 0.12);
}

.call-modal-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
}

.btn-call-send {
    background: #0D52CD;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 10px 28px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
}

.btn-call-send:hover {
    background: #0B46B3;
    transform: translateY(-1px);
}

.call-modal-error {
    color: #DC2626;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 8px;
}

.call-modal-success {
    color: #16A34A;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}
</style>