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
                    <li><router-link to="/" class="nav-link" active-class="active">Home</router-link></li>
                    <li><router-link to="/about" class="nav-link" active-class="active">About Us</router-link></li>
                    <li><router-link to="/services" class="nav-link" active-class="active">Services</router-link></li>
                    <li><router-link to="/contact" class="nav-link" active-class="active">Contact</router-link></li>
                    <li v-if="authStore.isAuthenticated">
                        <router-link to="/dashboard" class="nav-link dashboard-nav-badge" active-class="active">
                            📊 Dashboard
                        </router-link>
                    </li>
                </ul>
            </nav>

            <!-- Actions Right -->
            <div class="header-actions">
                <div class="location-selector">
                    <select v-model="selectedCity" class="city-select">
                        <option value="Lahore">Lahore</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Rawalpindi">Rawalpindi</option>
                    </select>
                </div>

                <template v-if="!authStore.isAuthenticated">
                    <button @click="cartStore.openAuthModal()" class="btn-auth">Sign in / Sign up</button>
                </template>
                <template v-else>
                    <div class="user-dropdown-wrap">
                        <router-link to="/dashboard" class="user-profile-btn">
                            <img :src="authStore.user?.avatar || defaultAvatar" class="mini-avatar" />
                            <span class="user-short-name">{{ authStore.user?.name || 'My Account' }}</span>
                        </router-link>
                        <button @click="handleLogout" class="btn-logout-header" title="Sign Out">
                            🚪
                        </button>
                    </div>
                </template>
            </div>

            <!-- Mobile Menu Toggle -->
            <button class="menu-toggle" @click="toggleMenu" aria-label="Toggle menu">
                <span class="hamburger" :class="{ active: isMenuOpen }">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </button>
        </div>

        <!-- Floating Quick Contact Action Buttons -->
        <div class="floating-contact">
            <a href="tel:042111111242" class="float-btn phone-btn" title="Call Us">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path
                        d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
            </a>
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
                        <li><router-link to="/services" @click="closeMenu">Services</router-link></li>
                        <li><router-link to="/contact" @click="closeMenu">Contact</router-link></li>
                        <li v-if="authStore.isAuthenticated">
                            <router-link to="/dashboard" @click="closeMenu" class="mobile-dash-link">
                                📊 Dashboard
                            </router-link>
                        </li>
                    </ul>
                    <div class="mobile-actions">
                        <select v-model="selectedCity" class="city-select mobile-select">
                            <option value="Lahore">Lahore</option>
                            <option value="Karachi">Karachi</option>
                            <option value="Islamabad">Islamabad</option>
                            <option value="Rawalpindi">Rawalpindi</option>
                        </select>
                        <template v-if="!authStore.isAuthenticated">
                            <button class="btn-auth full-width text-center" @click="openMobileAuth">
                                Sign in / Sign up
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
    </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import logo from '@/assets/new-logo.png'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

const openMobileAuth = () => {
    closeMenu()
    cartStore.openAuthModal()
}

const selectedCity = ref('Lahore')
const isMenuOpen = ref(false)
const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'

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
    height: 60px;
    width: auto;
    object-fit: contain;
}

.logo-link {
    text-decoration: none;
}

.logo-text {
    font-size: 30px;
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
}

.nav-link:hover,
.nav-link.active {
    color: #1A56DB;
    font-weight: 600;
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

.city-select {
    background: transparent;
    border: 1px solid #CBD5E1;
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 14px;
    color: #334155;
    cursor: pointer;
    outline: none;
    font-weight: 500;
}

.city-select:focus {
    border-color: #1A56DB;
}

.btn-auth {
    background: #1A56DB;
    color: #ffffff;
    border: none;
    border-radius: 24px;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    transition: background 0.2s, transform 0.1s;
}

.btn-auth:hover {
    background: #1D4ED8;
    transform: translateY(-1px);
}

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
    background: #1A56DB;
}

.whatsapp-btn {
    background: #25D366;
}

/* Mobile Toggle */
.menu-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
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
    width: 280px;
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
    color: #1A56DB !important;
    font-weight: 700 !important;
}

.mobile-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: auto;
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
</style>