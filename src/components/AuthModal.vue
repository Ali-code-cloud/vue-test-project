<template>
  <transition name="modal-fade">
    <div v-if="cartStore.showAuthModal" class="auth-modal-overlay" @click.self="close">
      <div class="auth-modal-card">
        <!-- Close Button -->
        <button class="btn-close-modal" @click="close" aria-label="Close modal">✕</button>

        <!-- STEP 1: WELCOME / REQUEST OTP SCREEN -->
        <div v-if="cartStore.authModalStep === 'welcome'" class="modal-body welcome-step">
          <h2 class="modal-title">Welcome to Mr Home Services</h2>
          <p class="modal-subtitle">Enter your email to request an OTP code</p>

          <form @submit.prevent="handleEmailSubmit" class="auth-form">
            <div v-if="authError" class="warning-text">{{ authError }}</div>

            <div class="form-field">
              <input 
                type="email" 
                v-model="emailInput" 
                placeholder="Email Address" 
                class="input-phone" 
                required 
              />
            </div>

            <button type="submit" class="btn-continue" :disabled="isSending">
              {{ isSending ? 'Sending OTP...' : 'Send Verification OTP' }}
            </button>
          </form>

          <!-- PROMINENT SIGN IN LINK FOR EXISTING USERS -->
          <div class="already-account-box">
            <p>Already have an account?</p>
            <button type="button" @click="goToLogin" class="btn-outline-signin">
              🔑 Sign In Here
            </button>
          </div>

          <div class="modal-footer-links">
            <p>Here you can see <a href="#" @click.prevent>Terms & Conditions</a></p>
            <p>Visit our <a href="#" @click.prevent>Privacy Policy</a></p>
          </div>
        </div>

        <!-- STEP 2: OTP VERIFICATION SCREEN -->
        <div v-else-if="cartStore.authModalStep === 'otp'" class="modal-body otp-step">
          <h2 class="modal-title">OTP Verification</h2>
          <p class="modal-subtitle">Enter the 6-digit code sent to</p>
          <p class="phone-display">{{ cartStore.userPhoneNumber }}</p>

          <form @submit.prevent="handleVerifyOtp" class="auth-form">
            <div v-if="authError" class="warning-text">{{ authError }}</div>

            <!-- 6 Digit Underline Inputs -->
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
            <a href="#" @click.prevent="backToWelcome" class="blue-link">Change Email</a>
          </div>

          <div class="modal-footer-links">
            <p>Here you can see <a href="#" @click.prevent>Terms & Conditions</a></p>
            <p>Visit our <a href="#" @click.prevent>Privacy Policy</a></p>
          </div>
        </div>

        <!-- STEP 3: REGISTRATION SCREEN -->
        <div v-else-if="cartStore.authModalStep === 'register'" class="modal-body register-step">
          <h2 class="modal-title">Complete Registration</h2>
          <p class="modal-subtitle">Enter your details for {{ cartStore.userPhoneNumber }}</p>

          <form @submit.prevent="handleModalRegister" class="auth-form modal-register-form">
            <div v-if="authError" class="warning-text">{{ authError }}</div>

            <div class="form-field">
              <input type="text" v-model="regName" placeholder="Full Name *" class="input-phone text-left" required />
            </div>

            <div class="form-field">
              <input type="tel" v-model="regPhone" placeholder="Phone Number *" class="input-phone text-left" required />
            </div>

            <div class="form-field">
              <input type="text" v-model="regAddress" placeholder="Address *" class="input-phone text-left" required />
            </div>

            <div class="form-field">
              <input type="password" v-model="regPassword" placeholder="Password *" class="input-phone text-left" required />
            </div>

            <div class="form-field">
              <input type="password" v-model="regConfirmPassword" placeholder="Confirm Password *" class="input-phone text-left" required />
            </div>

            <button type="submit" class="btn-continue" :disabled="isRegistering">
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
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore, getApiError } from '@/stores/auth'

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

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
    authError.value = ''
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
}

const backToWelcome = () => {
  cartStore.authModalStep = 'welcome'
  authError.value = ''
}

const goToLogin = () => {
  cartStore.closeAuthModal()
  router.push('/login')
}

/** Step 1: Send OTP to the entered email via API */
const handleEmailSubmit = async () => {
  authError.value = ''
  if (!emailInput.value.trim()) return

  isSending.value = true
  try {
    await authStore.requestOtp(emailInput.value.trim())
    cartStore.proceedToOtp(emailInput.value.trim())
    startTimer()
  } catch (e) {
    authError.value = getApiError(e)
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
  } catch (e) {
    authError.value = getApiError(e)
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
  if (!isOtpComplete.value) {
    showDigitWarning.value = true
    return
  }

  authError.value = ''
  isVerifying.value = true
  try {
    const otp = otpDigits.value.join('')
    const data = await authStore.verifyOtp(cartStore.userPhoneNumber, otp)
    if (data?.token || authStore.isAuthenticated) {
      cartStore.closeAuthModal()
    } else {
      // OTP verified successfully, now open registration form!
      cartStore.authModalStep = 'register'
    }
  } catch (e) {
    authError.value = getApiError(e)
  } finally {
    isVerifying.value = false
  }
}

/** Step 3: Register in Modal */
const handleModalRegister = async () => {
  authError.value = ''
  if (!regName.value || !regPhone.value || !regAddress.value) {
    authError.value = 'Name, Phone Number, and Address are required.'
    return
  }

  if (regPassword.value !== regConfirmPassword.value) {
    authError.value = 'Passwords do not match.'
    return
  }

  isRegistering.value = true
  try {
    await authStore.register({
      email: cartStore.userPhoneNumber,
      name: regName.value,
      phone: regPhone.value,
      address: regAddress.value,
      password: regPassword.value,
      password_confirmation: regConfirmPassword.value
    })
    cartStore.closeAuthModal()
  } catch (e) {
    authError.value = getApiError(e)
  } finally {
    isRegistering.value = false
  }
}
</script>

<style scoped>
.auth-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-modal-card {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 620px;
  padding: 48px 40px;
  position: relative;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.btn-close-modal {
  position: absolute;
  top: 16px;
  right: 20px;
  background: transparent;
  border: none;
  font-size: 20px;
  font-weight: bold;
  color: #000;
  cursor: pointer;
}

.modal-title {
  font-size: 26px;
  font-weight: 700;
  color: #0F172A;
  margin-bottom: 8px;
}

.modal-subtitle {
  font-size: 14px;
  color: #64748B;
  margin-bottom: 16px;
}

.phone-display {
  font-size: 15px;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 28px;
}

.auth-form {
  max-width: 380px;
  margin: 0 auto 20px;
}

.already-account-box {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 14px;
  margin: 16px auto;
  max-width: 380px;
}

.already-account-box p {
  font-size: 13px;
  color: #64748B;
  margin-bottom: 8px;
}

.btn-outline-signin {
  width: 100%;
  padding: 10px;
  background: white;
  color: #1A56DB;
  border: 2px solid #1A56DB;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline-signin:hover {
  background: #1A56DB;
  color: white;
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
  margin-bottom: 12px;
}

.input-phone {
  width: 100%;
  padding: 14px 20px;
  border-radius: 30px;
  border: 1px solid #E2E8F0;
  background: #F8FAFC;
  font-size: 15px;
  text-align: center;
  outline: none;
  color: #1E293B;
  transition: border-color 0.2s, background 0.2s;
}

.input-phone:focus {
  border-color: #1A56DB;
  background: white;
}

.btn-continue {
  background: #000000;
  color: white;
  border: none;
  width: 100%;
  max-width: 240px;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin: 10px auto 0;
  display: block;
}

/* OTP Digits Row */
.otp-inputs-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.otp-underline-input {
  width: 36px;
  height: 44px;
  border: none;
  border-bottom: 2px solid #94A3B8;
  font-size: 20px;
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
  border-radius: 12px;
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
  font-size: 12px;
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
  font-size: 13px;
  color: #475569;
  margin-top: 24px;
}

.modal-footer-links a {
  color: #2563EB;
  text-decoration: none;
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
</style>
