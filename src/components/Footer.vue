<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { fetchApi, useFetch } from '@/composables/useFetch'
import { showSuccessToast, showErrorToast } from '@/utils/alert'

interface Category {
    id: number | string
    name: string
}

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const authStore = useAuthStore()

const email = ref('')
const isSubmitting = ref(false)

const defaultCities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Multan', 'Sheikhupura']

const defaultCategories = [
    { id: 1, name: 'AC Services' },
    { id: 2, name: 'Carpenter Services' },
    { id: 3, name: 'Electrician Services' },
    { id: 4, name: 'Geyser Services' },
    { id: 5, name: 'Home Appliances Repair' },
    { id: 6, name: 'Handyman Services' },
    { id: 7, name: 'Painter Services' },
    { id: 8, name: 'Pest Control Services' },
    { id: 9, name: 'Plumber Services' }
]

const categories = ref<Category[]>([])
const cities = ref<string[]>([])

const { execute: fetchCategories } = useFetch('/api/service-categories', {
    immediate: false,
    fallbackData: defaultCategories
})

const { execute: fetchCities } = useFetch('/api/active-cities', {
    immediate: false,
    fallbackData: defaultCities
})

onMounted(async () => {
    try {
        const resCats = await fetchCategories()
        const rawCats = resCats?.data || resCats || []
        if (Array.isArray(rawCats) && rawCats.length > 0) {
            categories.value = rawCats.map((c: any) => ({
                id: c.id,
                name: String(c.name || '').endsWith('Services') || String(c.name || '').endsWith('Service') 
                    ? c.name 
                    : `${c.name} Services`
            }))
        } else {
            categories.value = defaultCategories
        }
    } catch (e) {
        categories.value = defaultCategories
    }

    try {
        const resCities = await fetchCities()
        const rawCities = resCities?.data || resCities || []
        if (Array.isArray(rawCities) && rawCities.length > 0) {
            cities.value = rawCities.map((c: any) => typeof c === 'string' ? c : (c.name || c.city_name || String(c)))
        } else {
            cities.value = defaultCities
        }
    } catch (e) {
        cities.value = defaultCities
    }
})

const handleSubscribe = async () => {
    if (!email.value || !email.value.trim()) {
        showErrorToast('Please enter your email address.')
        return
    }

    isSubmitting.value = true
    try {
        const res = await fetchApi('/api/newsletter/subscribe', {
            method: 'POST',
            data: { email: email.value.trim() }
        })
        showSuccessToast(res?.message || 'Thank you for subscribing to our newsletter!')
        email.value = ''
    } catch (e: any) {
        showErrorToast(e.response?.data?.message || 'Failed to subscribe. Please try again.')
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <footer class="footer">
        <!-- Top Brand & Call Banner (Standardized Vector SVG Icon) -->
        <div class="footer-top-banner">
            <div class="footer-container top-banner-content">
                <div class="brand-info">
                    <div class="footer-logo-title">Mr Home Services</div>
                    <p class="brand-tagline">Pakistan's Most Trusted Home Services & Maintenance Platform</p>
                </div>
                <div class="top-call-wrapper">
                    <a href="tel:042111111242" class="top-call-btn">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" class="call-svg">
                            <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                        </svg>
                        <span class="call-text">Call 042 111 111 242</span>
                    </a>
                </div>
            </div>
        </div>

        <div class="footer-container">
            <div class="footer-grid">
                <!-- Column 1: Services (Dynamic API) -->
                <div class="footer-col">
                    <h3 class="col-title">Services</h3>
                    <ul class="footer-links">
                        <li v-for="cat in categories" :key="cat.id">
                            <router-link :to="`/services/category/${cat.id}`">
                                {{ cat.name }}
                            </router-link>
                        </li>
                    </ul>
                </div>

                <!-- Column 2: Available in (Dynamic API) -->
                <div class="footer-col">
                    <h3 class="col-title">Available in</h3>
                    <ul class="footer-links city-links">
                        <li v-for="city in cities" :key="city">
                            <a href="#" @click.prevent>
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pin-svg">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                {{ city }}
                            </a>
                        </li>
                    </ul>
                </div>

                <!-- Column 3: Main Menu -->
                <div class="footer-col">
                    <h3 class="col-title">Main Menu</h3>
                    <ul class="footer-links">
                        <li><router-link to="/">Home</router-link></li>
                        <li><router-link to="/about">About Us</router-link></li>
                        <li><router-link to="/contact">Contact Us</router-link></li>
                        <li><router-link to="/privacy">Privacy Policy</router-link></li>
                        <li><router-link to="/terms">Terms & Conditions</router-link></li>
                        <li><router-link to="/blog">Blogs</router-link></li>
                    </ul>
                </div>

                <!-- Column 4: Connect with us (Professional SVG Social Icons) -->
                <div class="footer-col">
                    <h3 class="col-title">Connect with us</h3>
                    <p class="connect-desc">Follow us on social channels for latest updates & offers.</p>
                    <div class="social-grid">
                        <a href="https://facebook.com" target="_blank" rel="noopener" class="social-circle-btn" title="Facebook">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener" class="social-circle-btn" title="Twitter">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener" class="social-circle-btn" title="Instagram">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener" class="social-circle-btn" title="LinkedIn">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noopener" class="social-circle-btn" title="YouTube">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                        </a>
                        <a href="https://wa.me/923000000000" target="_blank" rel="noopener" class="social-circle-btn whatsapp" title="WhatsApp">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.84 9.84 0 0012.04 2zm5.82 14.16c-.25.7-1.46 1.34-2.02 1.4-.52.06-1.19.14-3.86-.92-2.88-1.14-4.73-4.08-4.88-4.27-.14-.19-1.18-1.57-1.18-2.99 0-1.42.74-2.12 1.01-2.41.27-.29.6-.36.8-.36.2 0 .4 0 .58.01.19.01.44-.07.69.53.25.6.86 2.09.93 2.24.07.15.12.33.02.53-.1.2-.15.33-.3.51-.15.18-.32.4-.46.54-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.03 1.12.99 2.07 1.3 2.36 1.44.29.14.46.12.63-.07.17-.19.74-.86.94-1.15.2-.29.4-.24.67-.14.27.1 1.72.81 2.02.96.3.15.5.22.57.34.07.12.07.72-.18 1.42z"/>
                            </svg>
                        </a>
                    </div>
                </div>

                <!-- Column 5: Newsletter -->
                <div class="footer-col">
                    <h3 class="col-title">Newsletter</h3>
                    <p class="newsletter-sub">Get exclusive deals and service updates directly in your inbox.</p>

                    <form @submit.prevent="handleSubscribe" class="newsletter-card" novalidate>
                        <div class="input-wrap">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mail-icon-svg">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            <input v-model="email" type="email" placeholder="Enter your email" class="newsletter-input" />
                        </div>
                        <button type="submit" class="newsletter-btn" aria-label="Subscribe" :disabled="isSubmitting">
                            {{ isSubmitting ? '...' : 'Subscribe' }}
                        </button>
                    </form>
                </div>
            </div>

            <!-- Bottom Copyright Bar -->
            <div class="footer-bottom">
                <p class="copyright">Copyright © 2026 <strong>Mr Home Services</strong>. All Rights Reserved.</p>
                <div class="bottom-legal-links">
                    <router-link to="/privacy">Privacy Policy</router-link>
                    <span class="sep">•</span>
                    <router-link to="/terms">Terms of Service</router-link>
                </div>
            </div>
        </div>

        <!-- Sticky / Fixed Mobile Bottom Navigation Bar (Professional SVG Icons) -->
        <nav class="sticky-mobile-nav">
            <router-link to="/" class="mobile-nav-item" :class="{ active: route.path === '/' }">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-svg">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span class="nav-label">Home</span>
            </router-link>

            <router-link to="/services" class="mobile-nav-item" :class="{ active: route.path.startsWith('/services') }">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-svg">
                    <rect x="2" y="3" width="8" height="8" rx="2"></rect>
                    <rect x="14" y="3" width="8" height="8" rx="2"></rect>
                    <rect x="2" y="15" width="8" height="8" rx="2"></rect>
                    <rect x="14" y="15" width="8" height="8" rx="2"></rect>
                </svg>
                <span class="nav-label">Services</span>
            </router-link>

            <router-link to="/cart" class="mobile-nav-item cart-nav-item" :class="{ active: route.path === '/cart' }">
                <div class="icon-wrap">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-svg">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path>
                    </svg>
                    <span v-if="cartStore.totalCartCount > 0" class="cart-badge">{{ cartStore.totalCartCount }}</span>
                </div>
                <span class="nav-label">Cart</span>
            </router-link>

            <!-- Show Orders when Authenticated, Profile/Login when NOT Authenticated -->
            <router-link 
                v-if="authStore.isAuthenticated" 
                to="/dashboard" 
                class="mobile-nav-item"
                :class="{ active: route.path.startsWith('/dashboard') }"
            >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-svg">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                <span class="nav-label">Orders</span>
            </router-link>

            <router-link 
                v-else 
                to="/login" 
                class="mobile-nav-item"
                :class="{ active: route.path === '/login' }"
            >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-svg">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span class="nav-label">Profile</span>
            </router-link>
        </nav>
    </footer>
</template>

<style scoped>
.footer {
    background: #1D4ED8;
    color: #FFFFFF;
    padding: 0 0 20px;
    font-size: 14px;
    position: relative;
}

.footer-top-banner {
    background: #1543B7;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    padding: 22px 0;
    margin-bottom: 44px;
}

.top-banner-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
}

.footer-logo-title {
    font-size: 24px;
    font-weight: 900;
    color: #FFFFFF;
    letter-spacing: -0.5px;
}

.brand-tagline {
    font-size: 13px;
    color: #DBEAFE;
    margin-top: 2px;
}

/* Blue and White Call Button in Top Bar with Standardized Vector SVG Icon */
.top-call-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #FFFFFF;
    color: #1D4ED8;
    border: 2px solid #FFFFFF;
    border-radius: 30px;
    padding: 10px 24px;
    font-size: 15px;
    font-weight: 800;
    text-decoration: none;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
}

.top-call-btn:hover {
    background: #EFF6FF;
    color: #1A56DB;
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.call-svg {
    flex-shrink: 0;
    fill: #1D4ED8;
}

.footer-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
}

.footer-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr 1.1fr 1.3fr;
    gap: 36px;
    padding-bottom: 44px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.col-title {
    font-size: 15px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 20px;
    color: #FFFFFF;
}

.footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 11px;
}

.footer-links a {
    color: #DBEAFE;
    text-decoration: none;
    transition: all 0.2s ease;
    font-size: 14px;
    display: inline-block;
}

.footer-links a:hover {
    color: #FFFFFF;
    transform: translateX(4px);
    text-decoration: underline;
}

.city-links a {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.pin-svg {
    opacity: 0.85;
    flex-shrink: 0;
}

.connect-desc {
    color: #DBEAFE;
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 16px;
}

.social-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.social-circle-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: #FFFFFF;
    transition: all 0.2s ease;
}

.social-circle-btn:hover {
    background: #FFFFFF;
    color: #1D4ED8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.newsletter-sub {
    color: #DBEAFE;
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 16px;
}

.newsletter-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.input-wrap {
    display: flex;
    align-items: center;
    background: #FFFFFF;
    border-radius: 12px;
    padding: 4px 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.mail-icon-svg {
    margin-right: 10px;
    color: #64748B;
    flex-shrink: 0;
}

.newsletter-input {
    border: none;
    outline: none;
    padding: 10px 0;
    font-size: 14px;
    flex: 1;
    color: #1E293B;
    background: transparent;
}

.newsletter-input::placeholder {
    color: #94A3B8;
}

.newsletter-btn {
    background: #FFFFFF;
    color: #1D4ED8;
    border: none;
    padding: 12px 20px;
    border-radius: 12px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 800;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.newsletter-btn:hover {
    background: #EFF6FF;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.newsletter-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

/* Footer Bottom */
.footer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 24px;
    flex-wrap: wrap;
    gap: 16px;
}

.copyright {
    color: #DBEAFE;
    font-size: 13px;
}

.copyright strong {
    color: #FFFFFF;
}

.bottom-legal-links {
    display: flex;
    align-items: center;
    gap: 12px;
}

.bottom-legal-links a {
    color: #DBEAFE;
    text-decoration: none;
    font-size: 13px;
    transition: color 0.2s;
}

.bottom-legal-links a:hover {
    color: #FFFFFF;
    text-decoration: underline;
}

.sep {
    color: #93C5FD;
}

/* Sticky Mobile Navigation Bar */
.sticky-mobile-nav {
    display: none;
}

@media (max-width: 1024px) {
    .footer-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 768px) {
    .footer {
        padding-bottom: 84px;
    }

    .footer-top-banner {
        margin-bottom: 32px;
    }

    .top-banner-content {
        flex-direction: column;
        align-items: flex-start;
    }

    .footer-grid {
        grid-template-columns: repeat(1, 1fr);
        gap: 32px;
    }

    .footer-bottom {
        flex-direction: column;
        gap: 12px;
        text-align: center;
    }

    .sticky-mobile-nav {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 64px;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-top: 1px solid #E2E8F0;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
        z-index: 2000;
        align-items: center;
        justify-content: space-around;
        padding: 4px 8px;
    }

    .mobile-nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #64748B;
        text-decoration: none;
        font-size: 11px;
        font-weight: 600;
        gap: 3px;
        flex: 1;
        padding: 6px 0;
        border-radius: 12px;
        transition: all 0.15s ease;
    }

    .mobile-nav-item.active {
        color: #1D4ED8;
        background: #EFF6FF;
    }

    .nav-svg {
        stroke: currentColor;
    }

    .mobile-nav-item.active .nav-svg {
        stroke: #1D4ED8;
    }

    .icon-wrap {
        position: relative;
        display: inline-flex;
    }

    .cart-badge {
        position: absolute;
        top: -4px;
        right: -9px;
        background: #DC2626;
        color: white;
        font-size: 10px;
        font-weight: 800;
        border-radius: 10px;
        padding: 1px 5px;
        line-height: 1;
    }
}
</style>