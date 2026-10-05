<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, getApiError } from '@/stores/auth'
import PhoneInput from '@/components/PhoneInput.vue'
import { useCartStore } from '@/stores/cart'
import { useCities } from '@/composables/useCities'
import { useService } from '@/composables/useService'
import api from '@/composables/useApi'

import HeroSlider from '@/components/HeroSlider.vue'

import technicianImg from '@/assets/technician_hero.png'
import electricianImg from '@/assets/hero-slider/1.jpg'
import plumberImg from '@/assets/hero-slider/2.jpg'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const { cities } = useCities()
const service = useService()

const searchQuery = ref('')

// Add more images here; the slider auto-plays when there are 2 or more
const heroSlides = [
    { id: 1, image: technicianImg },
    { id: 2, image: electricianImg },
    { id: 3, image: plumberImg }
]

// City picked in the hero search; also prefills the city at checkout
const selectedCity = computed({
    get: () => cartStore.selectedCity,
    set: (city: string) => { cartStore.selectedCity = city }
})

watch(cities, (list) => {
    const first = list[0]
    if (first && !list.includes(cartStore.selectedCity)) cartStore.selectedCity = first
}, { immediate: true })

// City dropdown (same list and look as the header's): closes on pick, outside click or Escape
const isCityOpen = ref(false)
const cityDropdownRef = ref<HTMLElement | null>(null)

const chooseCity = (city: string) => {
    selectedCity.value = city
    isCityOpen.value = false
}

const onDocumentClick = (e: MouseEvent) => {
    if (isCityOpen.value && !cityDropdownRef.value?.contains(e.target as Node)) isCityOpen.value = false
}

const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') isCityOpen.value = false
}

onMounted(() => {
    document.addEventListener('click', onDocumentClick)
    document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
    document.removeEventListener('click', onDocumentClick)
    document.removeEventListener('keydown', onKeydown)
})

interface PopularCategory {
    id: number | string
    name: string
    is_featured?: boolean
}

// "Popular" chips: featured categories from GET /api/service-categories
const popularCategories = ref<PopularCategory[]>([])

onMounted(async () => {
    try {
        const list: any = await service.getCategories()
        const all: PopularCategory[] = Array.isArray(list) ? list : (list?.data || [])
        const featured = all.filter(c => c.is_featured)
        popularCategories.value = (featured.length ? featured : all).slice(0, 4)
    } catch {
        popularCategories.value = []
    }
})

const openCategory = (cat: PopularCategory) => {
    router.push(`/services/category/${cat.id}`)
}

const heroFeatures = [
    { key: 'vetted', title: '100% Vetted Techs', text: 'Fully trained in-house team' },
    { key: 'rated', title: 'Top-Tier Rated', text: '10k+ satisfied customers' },
    { key: 'pricing', title: 'Clear Pricing', text: 'No hidden surprises' }
]

const showCallModal = ref(false)
const callName = ref('')
const callPhone = ref('')
const isSubmittingCall = ref(false)
const callSuccessMsg = ref('')
const callErrorMsg = ref('')

const fieldErrors = ref({
    name: '',
    phone: ''
})

const clearFieldErrors = () => {
    fieldErrors.value.name = ''
    fieldErrors.value.phone = ''
    callErrorMsg.value = ''
}

// Same support line as the header call icon
const SUPPORT_PHONE = '042111111242'

// Browsing services is public; login is only asked for at checkout
const handleBookNow = () => {
    router.push('/services')
}

const openCallModal = () => {
    // On phones, dial straight away instead of showing the callback form
    if (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) {
        window.location.href = `tel:${SUPPORT_PHONE}`
        return
    }

    callName.value = authStore.user?.name || ''
    callPhone.value = authStore.user?.phone || ''

    callSuccessMsg.value = ''

    clearFieldErrors()

    showCallModal.value = true
}

const closeCallModal = () => {
    showCallModal.value = false
    callSuccessMsg.value = ''

    clearFieldErrors()
}

const handleSearch = () => {
    if (searchQuery.value.trim()) {
        router.push(
            `/services?search=${encodeURIComponent(searchQuery.value.trim())}`
        )
    }
}

const handleCallSubmit = async () => {
    clearFieldErrors()

    let hasError = false

    if (!callName.value || !callName.value.trim()) {
        fieldErrors.value.name = 'The name field is required.'
        hasError = true
    }

    if (!callPhone.value || !callPhone.value.trim()) {
        fieldErrors.value.phone = 'The mobile number field is required.'
        hasError = true
    }

    if (hasError) return

    isSubmittingCall.value = true
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
            callSuccessMsg.value =
                data.message ||
                'Your complaint has been submitted successfully. We will get back to you soon!'

            setTimeout(() => {
                closeCallModal()
            }, 2000)

            return
        }
    } catch (e: any) {
        if (e.response?.data?.errors) {
            const errs = e.response.data.errors

            if (errs.name) {
                fieldErrors.value.name = Array.isArray(errs.name)
                    ? errs.name[0]
                    : errs.name
            }

            if (errs.phone) {
                fieldErrors.value.phone = Array.isArray(errs.phone)
                    ? errs.phone[0]
                    : errs.phone
            }

            if (
                errs.phone_number &&
                !fieldErrors.value.phone
            ) {
                fieldErrors.value.phone = Array.isArray(errs.phone_number)
                    ? errs.phone_number[0]
                    : errs.phone_number
            }
        }

        try {
            const token = localStorage.getItem('token')

            const res = await fetch(
                'http://mrhomeservices.test:8001/api/complaint',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': token
                            ? `Bearer ${token}`
                            : ''
                    },
                    body: JSON.stringify(payload)
                }
            )

            const resData = await res.json()

            if (resData?.status || resData?.message) {
                callSuccessMsg.value =
                    resData.message ||
                    'Your complaint has been submitted successfully. We will get back to you soon!'

                setTimeout(() => {
                    closeCallModal()
                }, 2000)

                return
            } else if (resData?.errors) {
                if (resData.errors.name) {
                    fieldErrors.value.name =
                        Array.isArray(resData.errors.name)
                            ? resData.errors.name[0]
                            : resData.errors.name
                }

                if (resData.errors.phone) {
                    fieldErrors.value.phone =
                        Array.isArray(resData.errors.phone)
                            ? resData.errors.phone[0]
                            : resData.errors.phone
                }
            }
        } catch (err) {
        }

        if (
            !fieldErrors.value.name &&
            !fieldErrors.value.phone
        ) {
            callErrorMsg.value = getApiError(e)
        }
    } finally {
        isSubmittingCall.value = false
    }
}
</script>

<template>
    <section class="hero-wrapper">

        <div class="hero-card">

            <div class="hero-content">

                <span class="hero-eyebrow">Trusted home services</span>

                <h1 class="hero-title">
                    Home Maintenance<br />
                    <span class="hero-title-accent">Made Easy!!</span>
                </h1>

                <p class="hero-description">
                    Connecting customers for quick, safe, and
                    affordable home service bookings.
                </p>

                <!-- Search: city + query + button -->
                <div ref="cityDropdownRef" class="hero-search-wrap">
                <form class="hero-search" role="search" @submit.prevent="handleSearch">
                    <button type="button" class="hero-search-city" :class="{ open: isCityOpen }"
                        aria-label="Select City" :aria-expanded="isCityOpen" @click="isCityOpen = !isCityOpen">
                        <svg class="city-pin" viewBox="0 0 24 24" width="18" height="18" fill="none"
                            stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span class="city-name">{{ selectedCity || 'Select City' }}</span>
                        <svg class="city-chevron" :class="{ rotate: isCityOpen }" width="14" height="14"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                            stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>

                    <input v-model="searchQuery" type="search" placeholder="Search services..."
                        class="hero-search-input" aria-label="Search services" />

                    <button type="submit" class="hero-search-btn" aria-label="Search">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
                            stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                </form>

                <transition name="dropdown">
                    <div v-if="isCityOpen" class="city-menu">
                        <div v-for="city in cities" :key="city" class="city-option"
                            :class="{ selected: selectedCity === city }" @click="chooseCity(city)">
                            {{ city }}
                        </div>
                    </div>
                </transition>
                </div>

                <div v-if="popularCategories.length" class="hero-popular">
                    <span class="popular-label">Popular:</span>
                    <button v-for="cat in popularCategories" :key="cat.id" type="button" class="popular-chip"
                        @click="openCategory(cat)">
                        {{ cat.name }}
                    </button>
                </div>

                <div class="hero-actions">

                    <button @click="handleBookNow" class="btn-book-now" type="button">
                        Book Now
                    </button>

                    <button @click="openCallModal" class="btn-call-icon" aria-label="Call Us" type="button"
                        title="Request Callback">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path
                                d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                        </svg>
                    </button>

                </div>

                <div class="hero-divider"></div>

                <div class="hero-features">
                    <div v-for="f in heroFeatures" :key="f.key" class="feature-card">
                        <span class="feature-icon" :class="f.key">
                            <svg v-if="f.key === 'vetted'" viewBox="0 0 24 24" width="20" height="20" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <polyline points="9 12 11 14 15 10" />
                            </svg>
                            <svg v-else-if="f.key === 'rated'" viewBox="0 0 24 24" width="20" height="20" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon
                                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="2" y="6" width="20" height="12" rx="2" />
                                <circle cx="12" cy="12" r="2.5" />
                                <path d="M6 12h.01M18 12h.01" />
                            </svg>
                        </span>
                        <h3 class="feature-title">{{ f.title }}</h3>
                        <p class="feature-text">{{ f.text }}</p>
                    </div>
                </div>

            </div>

            <div class="hero-visual">

                <div class="slider-frame">

                    <HeroSlider :slides="heroSlides" :auto-play="true" :interval="4500" />

                </div>

            </div>

        </div>

        <transition name="modal-fade">

            <div v-if="showCallModal" class="call-modal-overlay" @click.self="closeCallModal">

                <div class="call-modal-card">

                    <button class="call-modal-close" @click="closeCallModal" aria-label="Close modal" type="button">
                        ✕
                    </button>

                    <h3 class="call-modal-title">
                        Please fill in the information below
                    </h3>

                    <form @submit.prevent="handleCallSubmit" class="call-modal-form" novalidate>

                        <div v-if="callErrorMsg" class="call-modal-error">
                            {{ callErrorMsg }}
                        </div>

                        <div v-if="callSuccessMsg" class="call-modal-success">
                            {{ callSuccessMsg }}
                        </div>

                        <div class="form-group-field">

                            <input v-model="callName" type="text" placeholder="Your Name" class="call-input-pill"
                                :class="{
                                    'has-error': fieldErrors.name
                                }" @input="fieldErrors.name = ''" />

                            <span v-if="fieldErrors.name" class="field-error-text">
                                {{ fieldErrors.name }}
                            </span>

                        </div>

                        <div class="form-group-field">

                            <PhoneInput v-model="callPhone" placeholder="Mobile Number" class="call-input-pill"
                                :class="{
                                    'has-error': fieldErrors.phone
                                }" @input="fieldErrors.phone = ''" />

                            <span v-if="fieldErrors.phone" class="field-error-text">
                                {{ fieldErrors.phone }}
                            </span>

                        </div>

                        <div class="call-modal-footer">

                            <button type="submit" class="btn-call-send" :disabled="isSubmittingCall">
                                {{
                                    isSubmittingCall
                                        ? 'Sending...'
                                        : 'Send'
                                }}
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </transition>

    </section>
</template>

<style scoped>
.hero-wrapper {
    max-width: 1280px;
    margin: 20px auto 40px;
    padding: 0 20px;
}

.hero-card {
    background:
        radial-gradient(circle at 0% 0%, rgba(26, 86, 219, 0.08), transparent 45%),
        #F4F6F8;
    border-radius: 24px;
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
    gap: 40px;
    align-items: stretch;
    padding: 40px;
    position: relative;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.hero-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
}

.hero-eyebrow {
    align-self: flex-start;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: #1A56DB;
    background: #E0EAFF;
    padding: 6px 12px;
    border-radius: 999px;
    margin-bottom: 16px;
}

.hero-title {
    font-size: 46px;
    font-weight: 900;
    color: #0F172A;
    line-height: 1.12;
    margin: 0 0 14px;
    letter-spacing: -0.8px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.hero-title-accent {
    color: #0F52BA;
    font-weight: 900;
}

.hero-description {
    font-size: 15px;
    color: #4B5563;
    line-height: 1.55;
    margin: 0 0 24px;
    font-weight: 500;
}

/* Search bar: city | input | button */
.hero-search {
    display: flex;
    align-items: stretch;
    background: #FFFFFF;
    border: 1.5px solid #D6E0F5;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 6px 18px rgba(26, 86, 219, 0.08);
    transition: border-color 0.2s, box-shadow 0.2s;
}

.hero-search:focus-within {
    border-color: #1A56DB;
    box-shadow: 0 6px 20px rgba(26, 86, 219, 0.16);
}

.hero-search-wrap {
    position: relative;
}

.hero-search-city {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 14px 0 16px;
    background: #F1F5FF;
    border: none;
    border-right: 1px solid #D6E0F5;
    flex-shrink: 0;
    cursor: pointer;
    font-family: inherit;
    outline: none;
    transition: background 0.2s ease;
}

.hero-search-city:hover,
.hero-search-city.open {
    background: #E0EAFF;
}

.city-pin {
    color: #1A56DB;
    flex-shrink: 0;
}

.city-name {
    color: #0F172A;
    font-size: 15px;
    font-weight: 700;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.city-chevron {
    color: #0D52CD;
    flex-shrink: 0;
    transition: transform 0.2s ease;
}

.city-chevron.rotate {
    transform: rotate(180deg);
}

/* Same look as the header city menu */
.city-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #E2E8F0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    min-width: 150px;
    max-height: 280px;
    overflow-y: auto;
    padding: 8px 0;
    z-index: 50;
}

.city-option {
    padding: 10px 20px;
    color: #475569;
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
}

.city-option:hover {
    background: #F8FAFC;
    color: #0D52CD;
}

.city-option.selected {
    color: #0D52CD;
    font-weight: 700;
}

.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

.hero-search-input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    padding: 16px;
    font-size: 15px;
    color: #1F2937;
    background: transparent;
    font-family: inherit;
}

.hero-search-input::placeholder {
    color: #94A3B8;
}

.hero-search-input:focus::placeholder {
    color: transparent;
}

.hero-search-btn {
    flex-shrink: 0;
    width: 60px;
    border: none;
    background: #1A56DB;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
}

.hero-search-btn:hover {
    background: #1D4ED8;
}

/* Popular chips */
.hero-popular {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
}

.popular-label {
    font-size: 13px;
    font-weight: 700;
    color: #64748B;
    margin-right: 2px;
}

.popular-chip {
    padding: 7px 14px;
    border-radius: 10px;
    border: 1px solid #D6E0F5;
    background: #FFFFFF;
    color: #1E293B;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.popular-chip:hover {
    border-color: #1A56DB;
    color: #1A56DB;
    background: #F1F5FF;
}

.hero-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 22px;
}

.btn-book-now {
    background: #1A56DB;
    color: #ffffff;
    border: none;
    padding: 12px 32px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(26, 86, 219, 0.25);
}

.btn-book-now:hover {
    background: #1D4ED8;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(26, 86, 219, 0.35);
}

.btn-call-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: #FFFFFF;
    color: #1A56DB;
    border: 1.5px solid #1A56DB;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

/* Tapping triggers :hover on phones; keep the icon white on the blue background */
.btn-call-icon:hover,
.btn-call-icon:active,
.btn-call-icon:focus-visible {
    background: #1A56DB;
    color: #FFFFFF;
}

.hero-divider {
    height: 1px;
    background: #E2E8F0;
    margin: 26px 0 22px;
}

/* Feature cards */
.hero-features {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
}

.feature-card {
    background: #FFFFFF;
    border: 1px solid #E5EAF3;
    border-radius: 16px;
    padding: 16px;
    min-width: 0;
}

.feature-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    color: #1A56DB;
    background: #E0EAFF;
}

.feature-icon.rated {
    color: #D97706;
    background: #FEF3C7;
}

.feature-icon.pricing {
    color: #059669;
    background: #D1FAE5;
}

.feature-title {
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.3px;
    text-transform: uppercase;
    color: #0F172A;
    margin: 0 0 4px;
}

.feature-text {
    font-size: 12.5px;
    color: #64748B;
    margin: 0;
    line-height: 1.4;
}

/* Slider */
.hero-visual {
    position: relative;
    min-width: 0;
    display: flex;
}

.slider-frame {
    width: 100%;
    min-height: 460px;
    border-radius: 22px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 14px 34px rgba(15, 23, 42, 0.14);
}

/* The frame sets the height; slides fill it and the images cover it */
.slider-frame :deep(.hero-slider) {
    position: absolute;
    inset: 0;
}

.slider-frame :deep(.slider-container),
.slider-frame :deep(.slides-track),
.slider-frame :deep(.slide) {
    height: 100%;
    min-height: 0;
}

.slider-frame :deep(.slide-image) {
    position: absolute;
    inset: 0;
    height: 100%;
    min-height: 0;
    object-position: center;
}

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

    box-shadow:
        0 20px 50px rgba(0, 0, 0, 0.25);

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

    transition:
        transform 0.15s,
        background 0.15s;
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

    transition:
        border-color 0.2s,
        box-shadow 0.2s;
}

.call-input-pill::placeholder {
    color: #94A3B8;

    font-size: 14px;
}

.call-input-pill:focus {
    border-color: #0D52CD;

    box-shadow:
        0 0 0 3px rgba(13, 82, 205, 0.12);
}

.call-input-pill.has-error {
    border-color: #DC2626 !important;

    background: #FEF2F2 !important;
}

.field-error-text {
    display: block;

    color: #DC2626;

    font-size: 12px;

    font-weight: 500;

    margin-top: 4px;

    text-align: left;
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

    transition:
        background 0.2s,
        transform 0.1s;
}

.btn-call-send:hover {
    background: #0B46B3;

    transform: translateY(-1px);
}

.btn-call-send:disabled {
    opacity: 0.6;

    cursor: not-allowed;

    transform: none;
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

@media (max-width: 1024px) {
    .hero-card {
        padding: 28px;
        gap: 28px;
    }

    .hero-title {
        font-size: 38px;
    }
}

@media (max-width: 860px) {
    .hero-card {
        grid-template-columns: minmax(0, 1fr);
    }

    /* Slider first on tablets and phones */
    .hero-visual {
        order: -1;
    }

    .slider-frame {
        min-height: 0;
        height: 360px;
    }
}

@media (max-width: 768px) {
    .hero-wrapper {
        margin: 10px auto 20px;
        padding: 0 12px;
    }

    .hero-card {
        padding: 0;
        gap: 18px;
        background: transparent;
        box-shadow: none;
        border-radius: 0;
    }

    .slider-frame {
        border-radius: 20px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .slider-frame {
        height: 240px;
    }

    .hero-eyebrow,
    .hero-title,
    .hero-description {
        display: none;
    }

    .hero-search {
        border-radius: 14px;
    }

    .hero-search-city {
        padding: 0 8px 0 12px;
    }

    .city-name {
        max-width: 80px;
        font-size: 14px;
    }

    /* 16px stops iOS from zooming into the field */
    .hero-search-input {
        padding: 14px 12px;
        font-size: 16px;
    }

    .hero-search-btn {
        width: 52px;
    }

    .hero-popular {
        margin-top: 12px;
    }

    .hero-actions {
        justify-content: center;
        margin-top: 18px;
    }

    .hero-divider {
        margin: 20px 0 16px;
    }

    .hero-features {
        gap: 8px;
    }

    .feature-card {
        padding: 12px 10px;
        border-radius: 14px;
        text-align: center;
    }

    .feature-icon {
        width: 34px;
        height: 34px;
        margin: 0 auto 8px;
    }

    .feature-title {
        font-size: 11px;
        letter-spacing: 0.1px;
    }

    .feature-text {
        font-size: 11px;
    }
}

@media (max-width: 420px) {
    .feature-text {
        display: none;
    }
}
</style>