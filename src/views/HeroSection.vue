<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore, getApiError } from '@/stores/auth'
import api from '@/composables/useApi'

import HeroSlider from '@/components/HeroSlider.vue'

import technicianImg from '@/assets/technician_hero.png'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const searchQuery = ref('')

const heroSlides = [
    {
        id: 1,
        image: technicianImg
    }
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

const handleBookNow = () => {
    if (authStore.isAuthenticated) {
        router.push('/services')
    } else {
        cartStore.openAuthModal()
    }
}

const openCallModal = () => {
    if (!authStore.isAuthenticated) {
        cartStore.openAuthModal()
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
    if (!authStore.isAuthenticated) {
        closeCallModal()
        cartStore.openAuthModal()
        return
    }

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

                <h1 class="hero-title">
                    Home<br />
                    Maintenance<br />
                    Made Easy!!
                </h1>

                <p class="hero-description">
                    <!-- Connecting customers and technicians for quick, safe, and -->
                    Connecting customers for quick, safe, and<br class="desktop-br" />
                    affordable home service bookings.
                </p>

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

                <div class="search-box">

                    <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none"
                        stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>

                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>

                    <input v-model="searchQuery" type="text" placeholder="search" class="search-input"
                        @keyup.enter="handleSearch" />

                </div>

            </div>

            <div class="hero-visual">

                <div class="clipped-image-container">

                    <HeroSlider :slides="heroSlides" :auto-play="true" :interval="4000" />

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

                            <input v-model="callPhone" type="tel" placeholder="Mobile Number" class="call-input-pill"
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
    background: #F4F6F8;
    border-radius: 24px;

    display: flex;
    align-items: stretch;
    justify-content: space-between;

    min-height: 480px;

    overflow: hidden;
    position: relative;

    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.hero-content {
    flex: 1;

    padding: 56px 48px;

    display: flex;
    flex-direction: column;
    justify-content: center;

    max-width: 560px;

    z-index: 2;
}

.hero-title {
    font-size: 52px;
    font-weight: 900;

    color: #0F52BA;

    line-height: 1.12;

    margin-bottom: 20px;

    letter-spacing: -0.8px;

    font-family:
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        Roboto,
        sans-serif;
}

.hero-description {
    font-size: 15px;

    color: #4B5563;

    line-height: 1.55;

    margin-bottom: 28px;

    font-weight: 500;
}

.hero-actions {
    display: flex;
    align-items: center;

    gap: 16px;

    margin-bottom: 32px;
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

    box-shadow:
        0 4px 12px rgba(26, 86, 219, 0.25);
}

.btn-book-now:hover {
    background: #1D4ED8;

    transform: translateY(-1px);

    box-shadow:
        0 6px 16px rgba(26, 86, 219, 0.35);
}

.btn-call-icon {
    width: 44px;
    height: 44px;

    border-radius: 10px;

    background: #1A56DB;

    color: #ffffff;

    display: flex;
    align-items: center;
    justify-content: center;

    border: none;

    cursor: pointer;

    transition: all 0.2s ease;

    box-shadow:
        0 4px 12px rgba(26, 86, 219, 0.25);
}

.btn-call-icon:hover {
    background: #1D4ED8;

    transform: translateY(-1px);
}

.search-box {
    display: flex;
    align-items: center;

    background: #ffffff;

    border: 1.5px solid #1A56DB;

    border-radius: 30px;

    padding: 12px 20px;

    max-width: 460px;

    box-shadow:
        0 2px 8px rgba(26, 86, 219, 0.06);

    transition:
        border-color 0.2s,
        box-shadow 0.2s;
}

.search-box:focus-within {
    box-shadow:
        0 4px 14px rgba(26, 86, 219, 0.15);
}

.search-icon {
    color: #6B7280;

    margin-right: 12px;

    flex-shrink: 0;
}

.search-input {
    border: none;

    outline: none;

    width: 100%;

    font-size: 15px;

    color: #1F2937;

    background: transparent;
}

.search-input::placeholder {
    color: #6B7280;

    font-size: 15px;
}

.hero-visual {
    flex: 1.1;

    position: relative;

    display: flex;

    align-items: stretch;

    justify-content: flex-end;

    min-width: 0;
}

.clipped-image-container {
    width: 100%;
    height: 100%;

    min-height: 480px;

    position: relative;

    overflow: hidden;

    /*
     * Main curved shape
     */
    clip-path: ellipse(105% 72% at 100% 50%);

    -webkit-clip-path: ellipse(105% 72% at 100% 50%);
}

.clipped-image-container :deep(.hero-slider) {
    width: 100%;
    height: 100%;
}

.clipped-image-container :deep(.slider-container) {
    width: 100%;
    height: 100%;
    min-height: 480px;
}

.clipped-image-container :deep(.slide-image) {
    min-height: 480px;
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

@media (max-width: 960px) {

    .hero-card {
        flex-direction: column;

        border-radius: 20px;
    }

    .hero-content {
        max-width: 100%;

        padding: 36px 24px;
    }

    .hero-title {
        font-size: 38px;
    }

    .clipped-image-container {
        min-height: 320px;

        clip-path: none;

        -webkit-clip-path: none;

        border-bottom-left-radius: 20px;
        border-bottom-right-radius: 20px;
    }

    .clipped-image-container :deep(.slider-container) {
        min-height: 320px;
    }

    .clipped-image-container :deep(.slide-image) {
        min-height: 320px;
    }

    .desktop-br {
        display: none;
    }
}

@media (max-width: 600px) {

    .hero-wrapper {
        margin: 12px auto 24px;

        padding: 0 12px;
    }

    .hero-content {
        padding: 24px 16px;
    }

    .hero-title {
        font-size: 30px;
    }

    .hero-description {
        font-size: 14px;

        margin-bottom: 20px;
    }

    .search-box {
        max-width: 100%;

        padding: 10px 16px;
    }

    .clipped-image-container {
        min-height: 240px;
    }

    .clipped-image-container :deep(.slider-container) {
        min-height: 240px;
    }

    .clipped-image-container :deep(.slide-image) {
        min-height: 240px;
    }
}

@media (max-width: 480px) {

    .hero-title {
        font-size: 26px;
    }

    .btn-book-now {
        padding: 10px 20px;

        font-size: 14px;
    }
}
</style>