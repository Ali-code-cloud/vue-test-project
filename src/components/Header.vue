<template>
    <header class="header">
        <div class="header-container">
            <!-- Logo -->
            <div class="logo">
                <router-link to="/" class="logo-link">
                    <span class="logo-text">Home Service</span>
                </router-link>
            </div>

            <!-- Desktop Navigation -->
            <nav class="nav-desktop">
                <ul class="nav-list">
                    <li><router-link to="/" class="nav-link" active-class="active">Home</router-link></li>
                    <li><router-link to="/services" class="nav-link" active-class="active">Services</router-link></li>
                    <li><router-link to="/about" class="nav-link" active-class="active">About</router-link></li>
                    <li><router-link to="/contact" class="nav-link" active-class="active">Contact</router-link></li>
                </ul>
            </nav>

            <!-- Desktop CTA Buttons -->
            <div class="header-actions">
                <button class="btn-login">Login</button>
                <button class="btn-book">Book Now</button>
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

        <!-- Mobile Navigation (Slide-in) -->
        <transition name="slide">
            <div v-if="isMenuOpen" class="mobile-menu-overlay" @click="closeMenu">
                <nav class="mobile-nav" @click.stop>
                    <div class="mobile-nav-header">
                        <span class="logo-text">Handyman</span>
                        <button class="close-menu" @click="closeMenu">✕</button>
                    </div>
                    <ul class="mobile-nav-list">
                        <li><router-link to="/" @click="closeMenu" class="mobile-nav-link">Home</router-link></li>
                        <li><router-link to="/services" @click="closeMenu"
                                class="mobile-nav-link">Services</router-link></li>
                        <li><router-link to="/about" @click="closeMenu" class="mobile-nav-link">About</router-link></li>
                        <li><router-link to="/contact" @click="closeMenu" class="mobile-nav-link">Contact</router-link>
                        </li>
                    </ul>
                    <div class="mobile-nav-actions">
                        <button class="btn-login-mobile">Login</button>
                        <button class="btn-book-mobile">Book Now</button>
                    </div>
                </nav>
            </div>
        </transition>
    </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isMenuOpen = ref(false)

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
    // Prevent body scroll when menu is open
    document.body.style.overflow = isMenuOpen.value ? 'hidden' : ''
}

const closeMenu = () => {
    isMenuOpen.value = false
    document.body.style.overflow = ''
}
</script>

<style scoped>
/* ===== Base Styles ===== */
.header {
    background: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    position: sticky;
    top: 0;
    z-index: 1000;
    padding: 0 20px;
}

.header-container {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 70px;
    position: relative;
}

/* ===== Logo ===== */
.logo-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    gap: 10px;
}

.logo-icon {
    font-size: 28px;
    display: inline-block;
}

.logo-text {
    font-size: 24px;
    font-weight: 700;
    color: #2c3e50;
    letter-spacing: -0.5px;
}

/* ===== Desktop Navigation ===== */
.nav-desktop {
    display: none;
}

@media (min-width: 768px) {
    .nav-desktop {
        display: block;
    }
}

.nav-list {
    display: flex;
    list-style: none;
    gap: 32px;
    margin: 0;
    padding: 0;
}

.nav-link {
    text-decoration: none;
    color: #4a5568;
    font-size: 16px;
    font-weight: 500;
    transition: color 0.2s ease;
    position: relative;
    padding: 4px 0;
}

.nav-link:hover {
    color: #42b883;
}

.nav-link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: #42b883;
    transition: width 0.3s ease;
}

.nav-link:hover::after,
.nav-link.active::after {
    width: 100%;
}

.nav-link.active {
    color: #42b883;
}

/* ===== Header Actions (Desktop) ===== */
.header-actions {
    display: none;
    gap: 12px;
    align-items: center;
}

@media (min-width: 768px) {
    .header-actions {
        display: flex;
    }
}

.btn-login,
.btn-book {
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
}

.btn-login {
    background: transparent;
    color: #4a5568;
    border: 2px solid #e2e8f0;
}

.btn-login:hover {
    background: #f7fafc;
    border-color: #cbd5e0;
}

.btn-book {
    background: linear-gradient(135deg, #42b883 0%, #3aa876 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

.btn-book:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(66, 184, 131, 0.4);
}

/* ===== Mobile Menu Toggle ===== */
.menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
}

@media (min-width: 768px) {
    .menu-toggle {
        display: none;
    }
}

.hamburger {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 28px;
}

.hamburger span {
    display: block;
    height: 3px;
    background: #2c3e50;
    border-radius: 2px;
    transition: all 0.3s ease;
    transform-origin: center;
}

.hamburger.active span:nth-child(1) {
    transform: rotate(45deg) translate(6px, 6px);
}

.hamburger.active span:nth-child(2) {
    opacity: 0;
}

.hamburger.active span:nth-child(3) {
    transform: rotate(-45deg) translate(6px, -6px);
}

/* ===== Mobile Menu Overlay ===== */
.mobile-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
}

.mobile-nav {
    position: fixed;
    top: 0;
    right: 0;
    width: 85%;
    max-width: 320px;
    height: 100%;
    background: white;
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
}

.mobile-nav-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20px;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 20px;
}

.mobile-nav-header .logo-text {
    font-size: 22px;
}

.close-menu {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #4a5568;
    padding: 4px 8px;
}

.mobile-nav-list {
    list-style: none;
    padding: 0;
    margin: 0 0 30px 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.mobile-nav-link {
    display: block;
    padding: 12px 16px;
    text-decoration: none;
    color: #2c3e50;
    font-size: 17px;
    font-weight: 500;
    border-radius: 8px;
    transition: background 0.2s ease;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
    background: #f0fdf4;
    color: #42b883;
}

.mobile-nav-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: auto;
    padding-top: 20px;
    border-top: 1px solid #e2e8f0;
}

.btn-login-mobile,
.btn-book-mobile {
    padding: 14px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    width: 100%;
}

.btn-login-mobile {
    background: transparent;
    color: #4a5568;
    border: 2px solid #e2e8f0;
}

.btn-login-mobile:hover {
    background: #f7fafc;
}

.btn-book-mobile {
    background: linear-gradient(135deg, #42b883 0%, #3aa876 100%);
    color: white;
}

/* ===== Slide Animation ===== */
.slide-enter-active,
.slide-leave-active {
    transition: opacity 0.3s ease;
}

.slide-enter-active .mobile-nav,
.slide-leave-active .mobile-nav {
    transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
    opacity: 0;
}

.slide-enter-from .mobile-nav,
.slide-leave-to .mobile-nav {
    transform: translateX(100%);
}

.slide-enter-to,
.slide-leave-from {
    opacity: 1;
}

.slide-enter-to .mobile-nav,
.slide-leave-from .mobile-nav {
    transform: translateX(0);
}

/* ===== Responsive Adjustments ===== */
@media (max-width: 480px) {
    .header-container {
        height: 60px;
    }

    .logo-icon {
        font-size: 24px;
    }

    .logo-text {
        font-size: 20px;
    }

    .mobile-nav {
        width: 90%;
        max-width: 280px;
    }
}

/* Scrollbar styling for mobile menu */
.mobile-nav::-webkit-scrollbar {
    width: 4px;
}

.mobile-nav::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 2px;
}
</style>