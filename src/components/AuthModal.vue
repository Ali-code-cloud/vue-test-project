<template>
  <transition name="modal-fade">
    <div v-if="cartStore.showAuthModal" class="auth-modal-overlay" @click.self="close">
      <div class="auth-modal-card">
        <!-- Close Button -->
        <button class="btn-close-modal" @click="close" aria-label="Close modal">✕</button>
        <div v-if="cartStore.authModalStep === 'welcome'" class="modal-body welcome-step">
          <div class="verify-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <h2 class="modal-title">Verify Your Phone</h2>
          <p class="modal-subtitle">Enter your Pakistani phone number to receive a secure verification code.</p>

          <form @submit.prevent="handleEmailSubmit" class="auth-form" novalidate>
            <div v-if="authError" class="warning-text">{{ authError }}</div>

            <div class="form-field">
              <label for="auth-phone" class="field-label">Phone Number</label>
              <PhoneInput id="auth-phone" v-model="emailInput" class="phone-box" :class="{ invalid: step1Error }"
                @input="step1Error = ''" />
              <span v-if="step1Error" class="field-error-text">{{ step1Error }}</span>
            </div>

            <button type="submit" class="btn-continue" :disabled="isSending">
              {{ isSending ? 'Sending OTP...' : 'Continue' }}
            </button>
          </form>

          <SocialLoginButtons :redirect-to="route.fullPath" />

          <p class="signin-line">
            Already have a password?
            <a href="#" class="blue-link" @click.prevent="cartStore.authModalStep = 'login'">Sign In</a>
          </p>

          <p class="terms-line">
            By continuing you agree to our
            <router-link to="/terms" @click="close">Terms</router-link> &amp;
            <router-link to="/privacy" @click="close">Privacy Policy</router-link>
          </p>

          <div class="secured-by">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            Secured by Mr Home Services
          </div>
        </div>

        <!-- STEP 4: PASSWORD SIGN IN SCREEN IN MODAL -->
        <div v-else-if="cartStore.authModalStep === 'login'" class="modal-body login-step">
          <h2 class="modal-title">Welcome Back</h2>
          <p class="modal-subtitle">Sign in with your phone number and password</p>

          <form @submit.prevent="handleModalPasswordLogin" class="auth-form modal-register-form" novalidate>
            <div v-if="authError" class="warning-text">{{ authError }}</div>

            <div class="form-field">
              <PhoneInput
                v-model="loginEmail"
                placeholder="Phone Number *"
                class="input-phone-pill text-left"
                :class="{ 'has-error': loginErrors.email }" 
                @input="loginErrors.email = ''" 
              />
              <span v-if="loginErrors.email" class="field-error-text">{{ loginErrors.email }}</span>
            </div>

            <div class="form-field">
              <input 
                type="password" 
                v-model="loginPassword" 
                placeholder="Password *"
                class="input-phone-pill text-left" 
                :class="{ 'has-error': loginErrors.password }" 
                @input="loginErrors.password = ''" 
              />
              <span v-if="loginErrors.password" class="field-error-text">{{ loginErrors.password }}</span>
            </div>

            <div class="modal-forgot-wrap">
              <router-link to="/forgot-password" @click="close" class="blue-link">Forgot password?</router-link>
            </div>

            <button type="submit" class="btn-continue-black" :disabled="isLoggingIn">
              {{ isLoggingIn ? 'Signing In...' : 'Sign In' }}
            </button>
          </form>

          <div class="otp-action-links">
            <a href="#" @click.prevent="cartStore.authModalStep = 'welcome'" class="blue-link">← Sign in with OTP instead</a>
          </div>

          <div class="modal-footer-links">
            <p>Here you can see <router-link to="/terms" @click="close">Terms & Conditions</router-link></p>
            <p>Visit our <router-link to="/privacy" @click="close">Privacy Policy</router-link></p>
          </div>
        </div>

        <!-- STEP 2: OTP VERIFICATION SCREEN -->
        <div v-else-if="cartStore.authModalStep === 'otp'" class="modal-body otp-step">
          <h2 class="modal-title">OTP Verification</h2>
          <p class="modal-subtitle">Enter the 6-digit code sent to</p>
          <p class="phone-display">{{ formatPhone(cartStore.userPhoneNumber) }}</p>

          <form @submit.prevent="handleVerifyOtp" class="auth-form" novalidate>
            <div v-if="authError" class="warning-text">{{ authError }}</div>

            <!-- 6 Digit Underline Inputs -->
            <div class="otp-inputs-row">
              <input v-for="(digit, index) in 6" :key="index" type="text" maxlength="1" v-model="otpDigits[index]"
                @input="onDigitInput(index, $event)" @keydown.delete="onDigitDelete(index, $event)"
                :ref="el => inputRefs[index] = el" class="otp-underline-input" inputmode="numeric" />
            </div>

            <div v-if="showDigitWarning" class="warning-text">
              Please enter all 6 digits
            </div>

            <button type="submit" class="btn-verify" :class="{ ready: isOtpComplete }" :disabled="isVerifying">
              {{ isVerifying ? 'Verifying...' : 'Verify' }}
            </button>
          </form>

          <p class="resend-text">
            <template v-if="resendTimer > 0">Resend OTP in {{ resendTimer }} seconds</template>
            <a v-else href="#" @click.prevent="handleResendOtp" class="blue-link">Resend OTP</a>
          </p>

          <div class="otp-action-links">
            <a href="#" @click.prevent="backToWelcome" class="blue-link">Change Number</a>
          </div>

          <div class="modal-footer-links">
            <p>Here you can see <router-link to="/terms" @click="close">Terms & Conditions</router-link></p>
            <p>Visit our <router-link to="/privacy" @click="close">Privacy Policy</router-link></p>
          </div>
        </div>

        <!-- STEP 3: REGISTRATION SCREEN -->
        <div v-else-if="cartStore.authModalStep === 'register'" class="modal-body register-step">
          <h2 class="modal-title">Complete Registration</h2>
          <p class="modal-subtitle">Enter your details for {{ formatPhone(cartStore.userPhoneNumber) }}</p>

          <form @submit.prevent="handleModalRegister" class="auth-form modal-register-form" novalidate>
            <div v-if="authError" class="warning-text">{{ authError }}</div>

            <div class="form-field">
              <input type="text" v-model="regName" placeholder="Full Name *" class="input-phone-pill text-left"
                :class="{ 'has-error': regErrors.name }" @input="regErrors.name = ''" />
              <span v-if="regErrors.name" class="field-error-text">{{ regErrors.name }}</span>
            </div>

            <div v-if="!signedUpWithPhone" class="form-field">
              <PhoneInput v-model="regPhone" placeholder="Phone Number *" class="input-phone-pill text-left"
                :class="{ 'has-error': regErrors.phone }" @input="regErrors.phone = ''" />
              <span v-if="regErrors.phone" class="field-error-text">{{ regErrors.phone }}</span>
            </div>

            <div class="form-field">
              <input type="text" v-model="regAddress" placeholder="Address *" class="input-phone-pill text-left"
                :class="{ 'has-error': regErrors.address }" @input="regErrors.address = ''" />
              <span v-if="regErrors.address" class="field-error-text">{{ regErrors.address }}</span>
            </div>

            <div class="form-field">
              <input type="password" v-model="regPassword" placeholder="Password *" class="input-phone-pill text-left"
                :class="{ 'has-error': regErrors.password }" @input="regErrors.password = ''" />
              <span v-if="regErrors.password" class="field-error-text">{{ regErrors.password }}</span>
            </div>

            <div class="form-field">
              <input type="password" v-model="regConfirmPassword" placeholder="Confirm Password *"
                class="input-phone-pill text-left" :class="{ 'has-error': regErrors.password_confirmation }" @input="regErrors.password_confirmation = ''" />
              <span v-if="regErrors.password_confirmation" class="field-error-text">{{ regErrors.password_confirmation }}</span>
            </div>

            <button type="submit" class="btn-continue-black" :disabled="isRegistering">
              {{ isRegistering ? 'Creating Account...' : 'Complete Registration' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore, getApiError, isPhoneIdentifier, getPhoneError, formatPhone } from '@/stores/auth'
import { showSuccessToast, showErrorToast } from '@/utils/alert'
import SocialLoginButtons from '@/components/SocialLoginButtons.vue'
import PhoneInput from '@/components/PhoneInput.vue'

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const emailInput = ref('')
const otpDigits = ref<string[]>(['', '', '', '', '', ''])
const inputRefs = ref<any[]>([])
const resendTimer = ref(0)
const showDigitWarning = ref(false)
const authError = ref('')
const isSending = ref(false)
const isVerifying = ref(false)
const isRegistering = ref(false)

// Registration Form fields for Step 3 in Modal
const regName = ref('')
const regPhone = ref('')
const regAddress = ref('')
const regPassword = ref('')
const regConfirmPassword = ref('')

const step1Error = ref('')
const signedUpWithPhone = computed(() => isPhoneIdentifier(cartStore.userPhoneNumber || ''))
const regErrors = ref({
  name: '',
  phone: '',
  address: '',
  password: '',
  password_confirmation: ''
})

const clearRegErrors = () => {
  regErrors.value = {
    name: '',
    phone: '',
    address: '',
    password: '',
    password_confirmation: ''
  }
  authError.value = ''
}

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

watch(() => cartStore.authModalStep, (newStep) => {
  if (newStep === 'otp') {
    otpDigits.value = ['', '', '', '', '', '']
    showDigitWarning.value = false
    authError.value = ''
  } else if (newStep === 'register') {
    clearRegErrors()
    // The verified phone number is the account's phone; no need to type it again
    if (signedUpWithPhone.value) regPhone.value = cartStore.userPhoneNumber.trim()
  }
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const isOtpComplete = computed(() => {
  return otpDigits.value.every(d => d.trim().length === 1)
})

const close = () => {
  cartStore.closeAuthModal()
  authError.value = ''
  step1Error.value = ''
  clearRegErrors()
}

const backToWelcome = () => {
  cartStore.authModalStep = 'welcome'
  authError.value = ''
  step1Error.value = ''
}

/** Step 1: Send OTP to the entered phone number via API */
const handleEmailSubmit = async () => {
  authError.value = ''
  step1Error.value = getPhoneError(emailInput.value)
  if (step1Error.value) return
  // The +92 field gives the local format the backend stores (03001234567)
  const phone = emailInput.value

  isSending.value = true
  try {
    await authStore.requestOtp(phone)
    cartStore.proceedToOtp(phone)
    startTimer()
    showSuccessToast('OTP code sent successfully!')
  } catch (e: any) {
    authError.value = getApiError(e)
    showErrorToast(authError.value)
  } finally {
    isSending.value = false
  }
}

/** Resend OTP */
const handleResendOtp = async () => {
  if (resendTimer.value > 0) return
  authError.value = ''
  isSending.value = true
  try {
    await authStore.requestOtp(cartStore.userPhoneNumber)
    startTimer()
    showSuccessToast('OTP resent successfully!')
  } catch (e: any) {
    authError.value = getApiError(e)
    showErrorToast(authError.value)
  } finally {
    isSending.value = false
  }
}

const onDigitInput = (index: number, event: any) => {
  const val = event.target.value
  if (val && index < 5) {
    inputRefs.value[index + 1]?.focus()
  }
  showDigitWarning.value = false
}

const onDigitDelete = (index: number, event: any) => {
  if (!otpDigits.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }
}

/** Step 2: Verify the 6-digit OTP via real API */
const handleVerifyOtp = async () => {
  authError.value = ''
  isVerifying.value = true
  try {
    const otp = otpDigits.value.join('')
    const data = await authStore.verifyOtp(cartStore.userPhoneNumber, otp)
    if (data?.token || authStore.isAuthenticated) {
      showSuccessToast('Authenticated successfully!')
      cartStore.closeAuthModal()
    } else {
      showSuccessToast('OTP verified!')
      cartStore.authModalStep = 'register'
    }
  } catch (e: any) {
    authError.value = getApiError(e)
    showErrorToast(authError.value)
  } finally {
    isVerifying.value = false
  }
}

// Password Login in Modal
const loginEmail = ref('')
const loginPassword = ref('')
const isLoggingIn = ref(false)
const loginErrors = ref({ email: '', password: '' })

const handleModalPasswordLogin = async () => {
  loginErrors.value = { email: '', password: '' }
  authError.value = ''

  loginErrors.value.email = getPhoneError(loginEmail.value)
  if (loginErrors.value.email) return
  if (!loginPassword.value || !loginPassword.value.trim()) {
    loginErrors.value.password = 'Password is required.'
    return
  }

  isLoggingIn.value = true
  try {
    const res = await authStore.login(loginEmail.value.trim(), loginPassword.value)
    if (authStore.isAuthenticated) {
      showSuccessToast('Logged in successfully!')
      cartStore.closeAuthModal()
      router.push('/dashboard')
    } else {
      authError.value = res?.message || 'Invalid credentials.'
      showErrorToast(authError.value)
    }
  } catch (e: any) {
    if (e.response?.data?.errors) {
      const errs = e.response.data.errors
      if (errs.email) loginErrors.value.email = Array.isArray(errs.email) ? errs.email[0] : errs.email
      if (errs.phone) loginErrors.value.email = Array.isArray(errs.phone) ? errs.phone[0] : errs.phone
      if (errs.password) loginErrors.value.password = Array.isArray(errs.password) ? errs.password[0] : errs.password
    }
    if (!loginErrors.value.email && !loginErrors.value.password) {
      authError.value = getApiError(e)
      showErrorToast(authError.value)
    }
  } finally {
    isLoggingIn.value = false
  }
}

/** Step 3: Register in Modal */
const handleModalRegister = async () => {
  clearRegErrors()
  isRegistering.value = true
  try {
    await authStore.register({
      // Send the verified identifier; email is optional for phone sign-ups
      ...(signedUpWithPhone.value ? {} : { email: cartStore.userPhoneNumber.trim() }),
      name: (regName.value || '').trim(),
      phone: signedUpWithPhone.value ? cartStore.userPhoneNumber.trim() : (regPhone.value || '').trim(),
      address: (regAddress.value || '').trim(),
      password: regPassword.value,
      password_confirmation: regConfirmPassword.value
    })
    showSuccessToast('Account created successfully!')
    cartStore.closeAuthModal()
  } catch (e: any) {
    authError.value = getApiError(e)
    if (e.response?.data?.errors) {
      const errs = e.response.data.errors
      if (errs.name) regErrors.value.name = Array.isArray(errs.name) ? errs.name[0] : errs.name
      if (errs.phone) regErrors.value.phone = Array.isArray(errs.phone) ? errs.phone[0] : errs.phone
      if (errs.address) regErrors.value.address = Array.isArray(errs.address) ? errs.address[0] : errs.address
      if (errs.password) regErrors.value.password = Array.isArray(errs.password) ? errs.password[0] : errs.password
      if (errs.password_confirmation) regErrors.value.password_confirmation = Array.isArray(errs.password_confirmation) ? errs.password_confirmation[0] : errs.password_confirmation
    }
    showErrorToast(authError.value)
  } finally {
    isRegistering.value = false
  }
}
</script>

<style scoped>
/* Phone step (card design) */
.verify-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 18px;
  border-radius: 16px;
  background: #E0EAFF;
  color: #1A56DB;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-step .modal-subtitle {
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
  color: #64748B;
  line-height: 1.55;
}

.field-label {
  display: block;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #64748B;
  margin-bottom: 8px;
}

.phone-box {
  background: #FFFFFF;
  border: 1.5px solid #CBD5E1;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 16px;
  color: #0F172A;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.phone-box:focus-within {
  border-color: #1A56DB;
  box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.12);
}

.phone-box.invalid {
  border-color: #DC2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.signin-line {
  margin-top: 20px;
  font-size: 14px;
  color: #475569;
}

.signin-line .blue-link {
  font-weight: 700;
}

.terms-line {
  margin-top: 8px;
  font-size: 12px;
  color: #94A3B8;
}

.terms-line a {
  color: #64748B;
  text-decoration: underline;
}

.secured-by {
  margin-top: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #94A3B8;
}

.secured-by svg {
  color: #1A56DB;
}

.welcome-step .auth-form {
  margin-bottom: 0;
}

.modal-forgot-wrap {
  text-align: right;
  margin-bottom: 16px;
}
.auth-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-modal-card {
  background: #F8FAFC;
  border-radius: 28px;
  width: 100%;
  max-width: 460px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 40px 36px 28px;
  position: relative;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
  text-align: center;
}

.btn-close-modal {
  position: absolute;
  top: 16px;
  right: 20px;
  background: transparent;
  border: none;
  font-size: 22px;
  font-weight: 300;
  color: #000000;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
  transition: opacity 0.2s;
}

.btn-close-modal:hover {
  opacity: 0.7;
}

.modal-title {
  font-size: 26px;
  font-weight: 800;
  color: #0F172A;
  line-height: 1.25;
  margin-bottom: 10px;
  letter-spacing: -0.5px;
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
  margin: 0 auto 28px;
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
}

.input-phone-pill::placeholder {
  color: #8E8E93;
  text-align: center;
}

.input-phone-pill:focus {
  border-color: #000000;
  background: #ffffff;
}

/* Hide the hint as soon as the field is tapped */
.input-phone-pill:focus::placeholder {
  color: transparent;
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

.btn-continue-black:hover {
  opacity: 0.9;
}

.btn-continue {
  display: block;
  width: 100%;
  margin-top: 24px;
  padding: 15px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #1A56DB 0%, #3B82F6 100%);
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(26, 86, 219, 0.28);
  transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
}

.btn-continue:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(26, 86, 219, 0.34);
}

.btn-continue:disabled {
  opacity: 0.7;
  cursor: wait;
}

/* OTP Digits Row */
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
  margin-bottom: 28px;
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

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .auth-modal-card {
    padding: 36px 18px 24px;
    max-width: 95vw;
    border-radius: 20px;
  }

  .modal-title {
    font-size: 24px;
  }

  .otp-inputs-row {
    gap: 6px;
  }

  .otp-underline-input {
    width: 32px;
    height: 42px;
    font-size: 18px;
  }

  .btn-continue-black,
  .btn-verify {
    max-width: 100%;
  }
}
</style>
