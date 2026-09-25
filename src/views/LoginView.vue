<template>
    <div class="auth-page-card">
        <!-- Global Alerts -->
        <div v-if="globalError" class="auth-alert error-alert">{{ globalError }}</div>
        <div v-if="globalSuccess" class="auth-alert success-alert">{{ globalSuccess }}</div>

        <!-- 1. WELCOME STEP (Phone or Email + Continue + Bottom Sign In button) -->
        <div v-if="currentMode === 'welcome'" class="modal-body">
            <h2 class="modal-title">Welcome to mr home services</h2>
            <p class="modal-subtitle">Get started!</p>

            <form @submit.prevent="handleRequestOtp" class="auth-form" novalidate>
                <div class="form-field">
                    <input 
                        type="text" 
                        v-model="otpEmail" 
                        placeholder="Phone Number or Email *" 
                        class="input-phone-pill" 
                        :class="{ 'has-error': otpRequestError }" 
                        @input="otpRequestError = ''" 
                    />
                    <span v-if="otpRequestError" class="field-error-text">{{ otpRequestError }}</span>
                </div>

                <button type="submit" class="btn-continue-black" :disabled="isLoading">
                    {{ isLoading ? 'Sending OTP...' : 'Continue' }}
                </button>
            </form>

            <div class="bottom-signin-wrap">
                <button type="button" @click="currentMode = 'login'" class="btn-signin-pill">
                    Sign In
                </button>
            </div>

            <div class="modal-footer-links">
                <p>Here you can see <router-link to="/terms">Terms & Conditions</router-link></p>
                <p>Visit our <router-link to="/privacy">Privacy Policy</router-link></p>
            </div>
        </div>

        <!-- 2. PASSWORD LOGIN STEP -->
        <div v-else-if="currentMode === 'login'" class="modal-body">
            <h2 class="modal-title">Welcome Back</h2>
            <p class="modal-subtitle">Sign in with your registered email & password</p>

            <form @submit.prevent="handleLogin" class="auth-form modal-register-form" novalidate>
                <div class="form-field">
                    <input 
                        type="email" 
                        v-model="loginForm.email" 
                        placeholder="Email Address *" 
                        class="input-phone-pill text-left" 
                        :class="{ 'has-error': loginErrors.email }" 
                        @input="loginErrors.email = ''" 
                    />
                    <span v-if="loginErrors.email" class="field-error-text">{{ loginErrors.email }}</span>
                </div>

                <div class="form-field">
                    <input 
                        type="password" 
                        v-model="loginForm.password" 
                        placeholder="Password *" 
                        class="input-phone-pill text-left" 
                        :class="{ 'has-error': loginErrors.password }" 
                        @input="loginErrors.password = ''" 
                    />
                    <span v-if="loginErrors.password" class="field-error-text">{{ loginErrors.password }}</span>
                </div>

                <div class="modal-forgot-wrap">
                    <router-link to="/forgot-password" class="blue-link">Forgot password?</router-link>
                </div>

                <button type="submit" class="btn-continue-black" :disabled="isLoading">
                    {{ isLoading ? 'Signing in...' : 'Sign In' }}
                </button>
            </form>

            <div class="otp-action-links">
                <a href="#" @click.prevent="currentMode = 'welcome'" class="blue-link">← Sign in with OTP instead</a>
            </div>

            <div class="modal-footer-links">
                <p>Here you can see <router-link to="/terms">Terms & Conditions</router-link></p>
                <p>Visit our <router-link to="/privacy">Privacy Policy</router-link></p>
            </div>
        </div>

        <!-- 3. OTP VERIFY STEP -->
        <div v-else-if="currentMode === 'verify'" class="modal-body">
            <h2 class="modal-title">OTP Verification</h2>
            <p class="modal-subtitle">Enter the 6-digit code sent to</p>
            <p class="phone-display">{{ otpEmail }}</p>

            <form @submit.prevent="handleVerifyOtp" class="auth-form" novalidate>
                <div class="otp-inputs-row">
                    <input 
                        v-for="(digit, index) in 6" 
                        :key="index" 
                        type="text" 
                        maxlength="1" 
                        v-model="otpDigits[index]"
                        @input="onDigitInput(index, $event)" 
                        @keydown.delete="onDigitDelete(index, $event)"
                        :ref="el => inputRefs[index] = el" 
                        class="otp-underline-input" 
                        inputmode="numeric" 
                    />
                </div>

                <button type="submit" class="btn-verify" :class="{ ready: isOtpComplete }" :disabled="isLoading">
                    {{ isLoading ? 'Verifying...' : 'Verify' }}
                </button>
            </form>

            <p class="resend-text">
                <template v-if="resendTimer > 0">Resend OTP in {{ resendTimer }} seconds</template>
                <a v-else href="#" @click.prevent="handleRequestOtp" class="blue-link">Resend OTP</a>
            </p>

            <div class="otp-action-links">
                <a href="#" @click.prevent="currentMode = 'welcome'" class="blue-link">Change Number</a>
            </div>

            <div class="modal-footer-links">
                <p>Here you can see <router-link to="/terms">Terms & Conditions</router-link></p>
                <p>Visit our <router-link to="/privacy">Privacy Policy</router-link></p>
            </div>
        </div>

        <!-- 4. COMPLETE REGISTRATION STEP -->
        <div v-else-if="currentMode === 'register'" class="modal-body">
            <h2 class="modal-title">Complete Registration</h2>
            <p class="modal-subtitle">Enter your details for {{ otpEmail }}</p>

            <form @submit.prevent="handleRegister" class="auth-form modal-register-form" novalidate>
                <div class="form-field">
                    <input type="text" v-model="regForm.name" placeholder="Full Name *" class="input-phone-pill text-left"
                        :class="{ 'has-error': regErrors.name }" @input="regErrors.name = ''" />
                    <span v-if="regErrors.name" class="field-error-text">{{ regErrors.name }}</span>
                </div>

                <div class="form-field">
                    <input type="tel" v-model="regForm.phone" placeholder="Phone Number *" class="input-phone-pill text-left"
                        :class="{ 'has-error': regErrors.phone }" @input="regErrors.phone = ''" />
                    <span v-if="regErrors.phone" class="field-error-text">{{ regErrors.phone }}</span>
                </div>

                <div class="form-field">
                    <input type="text" v-model="regForm.address" placeholder="Address *" class="input-phone-pill text-left"
                        :class="{ 'has-error': regErrors.address }" @input="regErrors.address = ''" />
                    <span v-if="regErrors.address" class="field-error-text">{{ regErrors.address }}</span>
                </div>

                <div class="form-field">
                    <input type="password" v-model="regForm.password" placeholder="Password *" class="input-phone-pill text-left"
                        :class="{ 'has-error': regErrors.password }" @input="regErrors.password = ''" />
                    <span v-if="regErrors.password" class="field-error-text">{{ regErrors.password }}</span>
                </div>

                <div class="form-field">
                    <input type="password" v-model="regForm.password_confirmation" placeholder="Confirm Password *"
                        class="input-phone-pill text-left" :class="{ 'has-error': regErrors.password_confirmation }" @input="regErrors.password_confirmation = ''" />
                    <span v-if="regErrors.password_confirmation" class="field-error-text">{{ regErrors.password_confirmation }}</span>
                </div>

                <button type="submit" class="btn-continue-black" :disabled="isLoading">
                    {{ isLoading ? 'Creating Account...' : 'Complete Registration' }}
                </button>
            </form>

            <div class="modal-footer-links">
                <p>Here you can see <router-link to="/terms">Terms & Conditions</router-link></p>
                <p>Visit our <router-link to="/privacy">Privacy Policy</router-link></p>
            </div>
        </div>

        <div class="back-home-wrap">
            <router-link to="/" class="back-home-link">← Back to Home</router-link>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, getApiError } from '@/stores/auth'
import { showSuccessToast, showErrorToast } from '@/utils/alert'

const authStore = useAuthStore()
const router = useRouter()

const currentMode = ref<'welcome' | 'login' | 'verify' | 'register'>('welcome')
const isLoading = ref(false)
const globalError = ref('')
const globalSuccess = ref('')

const loginForm = ref({ email: '', password: '' })
const loginErrors = ref({ email: '', password: '' })

const otpEmail = ref('')
const otpDigits = ref<string[]>(['', '', '', '', '', ''])
const inputRefs = ref<any[]>([])
const resendTimer = ref(0)
const otpRequestError = ref('')

const regForm = ref({
    name: '',
    phone: '',
    address: '',
    password: '',
    password_confirmation: ''
})
const regErrors = ref({
    name: '',
    phone: '',
    address: '',
    password: '',
    password_confirmation: ''
})

let timerInterval: number | null = null

const startTimer = () => {
    resendTimer.value = 60
    if (timerInterval) clearInterval(timerInterval)
    timerInterval = window.setInterval(() => {
        if (resendTimer.value > 0) {
            resendTimer.value--
        } else {
            if (timerInterval) clearInterval(timerInterval)
        }
    }, 1000)
}

onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval)
})

const isOtpComplete = computed(() => {
    return otpDigits.value.every(d => d.trim().length === 1)
})

const onDigitInput = (index: number, event: any) => {
    const val = event.target.value
    if (val && index < 5) {
        inputRefs.value[index + 1]?.focus()
    }
}

const onDigitDelete = (index: number, event: any) => {
    if (!otpDigits.value[index] && index > 0) {
        inputRefs.value[index - 1]?.focus()
    }
}

const clearErrors = () => {
    globalError.value = ''
    globalSuccess.value = ''
    loginErrors.value = { email: '', password: '' }
    otpRequestError.value = ''
    regErrors.value = { name: '', phone: '', address: '', password: '', password_confirmation: '' }
}

/** 1. Password Login */
const handleLogin = async () => {
    clearErrors()
    let isValid = true

    if (!loginForm.value.email || !loginForm.value.email.trim()) {
        loginErrors.value.email = 'Email Address is required.'
        isValid = false
    }
    if (!loginForm.value.password || !loginForm.value.password.trim()) {
        loginErrors.value.password = 'Password is required.'
        isValid = false
    }

    if (!isValid) return

    isLoading.value = true
    try {
        const res = await authStore.login(loginForm.value.email.trim(), loginForm.value.password)
        if (authStore.isAuthenticated) {
            showSuccessToast('Logged in successfully!')
            router.push('/dashboard')
        } else {
            globalError.value = res?.message || 'Invalid credentials.'
            showErrorToast(globalError.value)
        }
    } catch (e: any) {
        if (e.response?.data?.errors) {
            const errs = e.response.data.errors
            if (errs.email) loginErrors.value.email = Array.isArray(errs.email) ? errs.email[0] : errs.email
            if (errs.password) loginErrors.value.password = Array.isArray(errs.password) ? errs.password[0] : errs.password
        }
        if (!loginErrors.value.email && !loginErrors.value.password) {
            globalError.value = getApiError(e)
            showErrorToast(globalError.value)
        }
    } finally {
        isLoading.value = false
    }
}

/** 2. Request OTP */
const handleRequestOtp = async () => {
    clearErrors()
    if (!otpEmail.value || !otpEmail.value.trim()) {
        otpRequestError.value = 'Phone Number or Email is required.'
        return
    }

    isLoading.value = true
    try {
        const res = await authStore.requestOtp(otpEmail.value.trim())
        showSuccessToast('OTP code sent successfully!')
        if (res?.data?.otp) {
            otpDigits.value = String(res.data.otp).padStart(6, '0').split('')
        }
        startTimer()
        currentMode.value = 'verify'
    } catch (e: any) {
        if (e.response?.data?.errors?.email) {
            otpRequestError.value = Array.isArray(e.response.data.errors.email) ? e.response.data.errors.email[0] : e.response.data.errors.email
            showErrorToast(otpRequestError.value)
        } else {
            globalError.value = getApiError(e)
            showErrorToast(globalError.value)
        }
    } finally {
        isLoading.value = false
    }
}

/** 3. Verify OTP */
const handleVerifyOtp = async () => {
    clearErrors()
    const otp = otpDigits.value.join('')
    if (!otp || otp.length < 6) {
        showErrorToast('Please enter all 6 digits of OTP.')
        return
    }

    isLoading.value = true
    try {
        const data = await authStore.verifyOtp(otpEmail.value.trim(), otp)
        if (data?.token || authStore.isAuthenticated) {
            showSuccessToast('Authenticated successfully!')
            router.push('/dashboard')
        } else {
            showSuccessToast('OTP verified!')
            currentMode.value = 'register'
        }
    } catch (e: any) {
        globalError.value = getApiError(e)
        showErrorToast(globalError.value)
    } finally {
        isLoading.value = false
    }
}

/** 4. Register */
const handleRegister = async () => {
    clearErrors()
    let isValid = true

    if (!regForm.value.name || !regForm.value.name.trim()) {
        regErrors.value.name = 'Full Name is required.'
        isValid = false
    }
    if (!regForm.value.phone || !regForm.value.phone.trim()) {
        regErrors.value.phone = 'Phone Number is required.'
        isValid = false
    }
    if (!regForm.value.address || !regForm.value.address.trim()) {
        regErrors.value.address = 'Address is required.'
        isValid = false
    }
    if (!regForm.value.password) {
        regErrors.value.password = 'Password is required.'
        isValid = false
    }
    if (!regForm.value.password_confirmation) {
        regErrors.value.password_confirmation = 'Confirm Password is required.'
        isValid = false
    } else if (regForm.value.password !== regForm.value.password_confirmation) {
        regErrors.value.password_confirmation = 'Passwords do not match.'
        isValid = false
    }

    if (!isValid) return

    isLoading.value = true
    try {
        const res = await authStore.register({
            email: otpEmail.value.trim(),
            name: regForm.value.name.trim(),
            phone: regForm.value.phone.trim(),
            address: regForm.value.address.trim(),
            password: regForm.value.password,
            password_confirmation: regForm.value.password_confirmation
        })

        if (authStore.isAuthenticated) {
            showSuccessToast('Account created successfully!')
            router.push('/dashboard')
        }
    } catch (e: any) {
        if (e.response?.data?.errors) {
            const errs = e.response.data.errors
            if (errs.name) regErrors.value.name = Array.isArray(errs.name) ? errs.name[0] : errs.name
            if (errs.phone) regErrors.value.phone = Array.isArray(errs.phone) ? errs.phone[0] : errs.phone
            if (errs.address) regErrors.value.address = Array.isArray(errs.address) ? errs.address[0] : errs.address
            if (errs.password) regErrors.value.password = Array.isArray(errs.password) ? errs.password[0] : errs.password
            if (errs.password_confirmation) regErrors.value.password_confirmation = Array.isArray(errs.password_confirmation) ? errs.password_confirmation[0] : errs.password_confirmation
        }
        if (!regErrors.value.name && !regErrors.value.phone && !regErrors.value.address && !regErrors.value.password && !regErrors.value.password_confirmation) {
            globalError.value = getApiError(e)
            showErrorToast(globalError.value)
        }
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped>
.auth-page-card {
    width: 100%;
    text-align: center;
}

.modal-title {
    font-size: 32px;
    font-weight: 500;
    color: #000000;
    line-height: 1.25;
    margin-bottom: 12px;
    letter-spacing: -0.5px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.modal-subtitle {
    font-size: 14px;
    color: #333333;
    margin-bottom: 28px;
    font-weight: 400;
}

.phone-display {
    font-size: 15px;
    font-weight: 700;
    color: #0F172A;
    margin-bottom: 28px;
}

.auth-form {
    max-width: 380px;
    margin: 0 auto 20px;
}

.modal-register-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.text-left {
    text-align: left !important;
}

.form-field {
    margin-bottom: 16px;
}

.input-phone-pill {
    width: 100%;
    padding: 16px 24px;
    border-radius: 40px;
    border: 1px solid #EAEAEA;
    background: #F7F7F8;
    font-size: 15px;
    text-align: center;
    outline: none;
    color: #111827;
    transition: border-color 0.2s, background 0.2s;
    box-sizing: border-box;
}

.input-phone-pill::placeholder {
    color: #8E8E93;
    text-align: center;
}

.input-phone-pill:focus {
    border-color: #000000;
    background: #ffffff;
}

.input-phone-pill.has-error {
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
    padding-left: 12px;
}

.btn-continue-black {
    background: #000000;
    color: #ffffff;
    border: none;
    width: 100%;
    max-width: 200px;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    margin: 20px auto 0;
    display: block;
    transition: background 0.2s, opacity 0.2s;
}

.btn-continue-black:hover:not(:disabled) {
    opacity: 0.9;
}

.btn-continue-black:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.bottom-signin-wrap {
    margin-top: 24px;
    margin-bottom: 24px;
    display: flex;
    justify-content: center;
}

.btn-signin-pill {
    background: #0D52CD;
    color: #ffffff;
    border: none;
    border-radius: 40px;
    padding: 12px 36px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    box-shadow: 0 4px 14px rgba(13, 82, 205, 0.25);
}

.btn-signin-pill:hover {
    background: #0B46B3;
    transform: translateY(-1px);
}

.modal-forgot-wrap {
    text-align: right;
    margin-bottom: 16px;
}

.otp-inputs-row {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 20px;
}

.otp-underline-input {
    width: 38px;
    height: 46px;
    border: none;
    border-bottom: 2px solid #94A3B8;
    font-size: 22px;
    font-weight: bold;
    text-align: center;
    outline: none;
    background: transparent;
    color: #0F172A;
    transition: border-color 0.2s;
}

.otp-underline-input:focus {
    border-bottom-color: #1A56DB;
}

.warning-text {
    color: #DC2626;
    font-size: 13px;
    margin-bottom: 16px;
    font-weight: 500;
}

.btn-verify {
    background: #64748B;
    color: white;
    border: none;
    width: 100%;
    max-width: 180px;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    margin: 0 auto;
    display: block;
    transition: background 0.2s;
}

.btn-verify.ready,
.btn-verify:hover {
    background: #1A56DB;
}

.resend-text {
    font-size: 13px;
    color: #64748B;
    margin-bottom: 16px;
}

.otp-action-links {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 24px;
}

.blue-link {
    color: #2563EB;
    font-size: 14px;
    text-decoration: none;
}

.blue-link:hover {
    text-decoration: underline;
}

.modal-footer-links {
    font-size: 14px;
    color: #333333;
    line-height: 1.6;
    margin-top: 12px;
}

.modal-footer-links p {
    margin-bottom: 2px;
}

.modal-footer-links a {
    color: #2563EB;
    text-decoration: none;
    font-weight: 500;
}

.modal-footer-links a:hover {
    text-decoration: underline;
}

.back-home-wrap {
    display: flex;
    justify-content: center;
    margin-top: 24px;
}

.back-home-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #EFF6FF;
    color: #1D4ED8;
    border: 1.5px solid #BFDBFE;
    border-radius: 30px;
    padding: 9px 24px;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(29, 78, 216, 0.1);
}

.back-home-link:hover {
    background: #1D4ED8;
    color: #ffffff;
    border-color: #1D4ED8;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(29, 78, 216, 0.25);
}

.auth-alert {
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 20px;
}

.error-alert {
    background: #FEF2F2;
    color: #DC2626;
    border: 1px solid #FCA5A5;
}

.success-alert {
    background: #F0FDF4;
    color: #16A34A;
    border: 1px solid #86EFAC;
}
</style>