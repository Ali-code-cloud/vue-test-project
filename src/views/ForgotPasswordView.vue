<template>
  <div class="forgot-password-page">
    <!-- Step 1: Input Email -->
    <div v-if="currentStep === 1" class="step-box">
      <h3>Forgot Password?</h3>
      <p class="step-desc">Enter your registered email to receive a verification OTP code.</p>

      <form @submit.prevent="handleSendOtp" class="auth-form">
        <div v-if="errorMsg" class="error-alert">{{ errorMsg }}</div>
        <div v-if="successMsg" class="success-alert">{{ successMsg }}</div>

        <div class="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            v-model="email" 
            placeholder="user@example.com" 
            required 
            class="input-field"
          />
        </div>

        <button type="submit" class="btn-primary-auth" :disabled="isLoading">
          <span v-if="isLoading">Sending OTP...</span>
          <span v-else>Send Verification OTP</span>
        </button>

        <div class="back-link-wrap">
          <router-link to="/login" class="back-link">← Back to Sign In</router-link>
        </div>
      </form>
    </div>

    <!-- Step 2: Confirm 6-Digit OTP -->
    <div v-else-if="currentStep === 2" class="step-box">
      <h3>Confirm OTP Code</h3>
      <p class="step-desc">
        We sent a 6-digit code to <strong>{{ email }}</strong>
      </p>

      <form @submit.prevent="handleVerifyOtp" class="auth-form">
        <div v-if="errorMsg" class="error-alert">{{ errorMsg }}</div>
        <div v-if="successMsg" class="success-alert">{{ successMsg }}</div>

        <div class="form-group">
          <label>Enter 6-Digit OTP</label>
          <div class="otp-inputs">
            <input 
              v-for="(digit, idx) in 6" 
              :key="idx" 
              type="text" 
              maxlength="1" 
              v-model="otpDigits[idx]" 
              @input="onOtpInput(idx, $event)"
              @keydown.delete="onOtpDelete(idx, $event)"
              :ref="el => otpRefs[idx] = el"
              class="otp-digit-box"
              inputmode="numeric"
              required 
            />
          </div>
        </div>

        <button type="submit" class="btn-primary-auth" :disabled="isLoading">
          <span v-if="isLoading">Verifying...</span>
          <span v-else>Verify OTP Code</span>
        </button>

        <div class="resend-wrap">
          <button 
            type="button" 
            class="btn-resend" 
            :disabled="resendTimer > 0 || isLoading"
            @click="handleResendOtp"
          >
            <span v-if="resendTimer > 0">Resend OTP in {{ resendTimer }}s</span>
            <span v-else>Resend OTP Code</span>
          </button>
        </div>

        <div class="back-link-wrap">
          <button type="button" @click="currentStep = 1; errorMsg = ''; successMsg = ''" class="back-link-btn">← Change Email</button>
        </div>
      </form>
    </div>

    <!-- Step 3: Reset Password -->
    <div v-else-if="currentStep === 3" class="step-box">
      <h3>Set New Password</h3>
      <p class="step-desc">Create a new secure password for your account.</p>

      <form @submit.prevent="handleResetPassword" class="auth-form">
        <div v-if="errorMsg" class="error-alert">{{ errorMsg }}</div>
        <div v-if="successMsg" class="success-alert">{{ successMsg }}</div>

        <div class="form-group">
          <label>New Password</label>
          <input 
            type="password" 
            v-model="newPassword" 
            placeholder="At least 8 characters" 
            required 
            class="input-field"
          />
        </div>

        <div class="form-group">
          <label>Confirm New Password</label>
          <input 
            type="password" 
            v-model="confirmPassword" 
            placeholder="Repeat new password" 
            required 
            class="input-field"
          />
        </div>

        <button type="submit" class="btn-primary-auth" :disabled="isLoading">
          <span v-if="isLoading">Resetting...</span>
          <span v-else>Reset Password</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, getApiError } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const currentStep = ref<1 | 2 | 3>(1)
const email = ref('')
const otpDigits = ref(['', '', '', '', '', ''])
const otpRefs = ref<any[]>([])
const newPassword = ref('')
const confirmPassword = ref('')

const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const resendTimer = ref(0)
let timerInterval: any = null

// Store the verified OTP to send with reset-password
const verifiedOtp = ref('')

const startResendTimer = () => {
  resendTimer.value = 60
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--
    } else {
      clearInterval(timerInterval)
    }
  }, 1000)
}

/** Step 1 → Forgot Password API sends OTP */
const handleSendOtp = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  if (!email.value.trim()) {
    errorMsg.value = 'Please enter your email address.'
    return
  }

  isLoading.value = true
  try {
    const data = await authStore.forgotPassword(email.value)
    successMsg.value = data.message || 'OTP sent successfully!'
    currentStep.value = 2
    otpDigits.value = ['', '', '', '', '', '']
    startResendTimer()
    setTimeout(() => {
      if (otpRefs.value[0]) otpRefs.value[0].focus()
    }, 100)
  } catch (e) {
    errorMsg.value = getApiError(e)
  } finally {
    isLoading.value = false
  }
}

const handleResendOtp = async () => {
  if (resendTimer.value > 0) return
  await handleSendOtp()
}

const onOtpInput = (idx: number, event: any) => {
  const val = event.target.value
  if (val && idx < 5 && otpRefs.value[idx + 1]) {
    otpRefs.value[idx + 1].focus()
  }
}

const onOtpDelete = (idx: number, event: any) => {
  if (!otpDigits.value[idx] && idx > 0 && otpRefs.value[idx - 1]) {
    otpRefs.value[idx - 1].focus()
  }
}

/** Step 2 → Verify the 6-digit OTP */
const handleVerifyOtp = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  const enteredOtp = otpDigits.value.join('')
  if (enteredOtp.length < 6) {
    errorMsg.value = 'Please enter the full 6-digit OTP code.'
    return
  }

  isLoading.value = true
  try {
    const data = await authStore.verifyOtp(email.value, enteredOtp)
    verifiedOtp.value = enteredOtp
    successMsg.value = data.message || 'OTP verified!'
    currentStep.value = 3
  } catch (e) {
    errorMsg.value = getApiError(e)
  } finally {
    isLoading.value = false
  }
}

/** Step 3 → Reset password with OTP + new password */
const handleResetPassword = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = 'Passwords do not match!'
    return
  }
  if (newPassword.value.length < 8) {
    errorMsg.value = 'Password must be at least 8 characters.'
    return
  }

  isLoading.value = true
  try {
    const data = await authStore.resetPassword({
      email: email.value,
      otp: verifiedOtp.value,
      password: newPassword.value,
      password_confirmation: confirmPassword.value
    })
    successMsg.value = data.message || 'Password reset successfully! Redirecting to login...'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (e) {
    errorMsg.value = getApiError(e)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.forgot-password-page {
  width: 100%;
}

.step-box {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-box h3 {
  font-size: 22px;
  font-weight: 800;
  color: #0F172A;
  margin: 0;
}

.step-desc {
  font-size: 14px;
  color: #64748B;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error-alert {
  background: #FEE2E2;
  color: #DC2626;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.success-alert {
  background: #D1FAE5;
  color: #065F46;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
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
  padding: 12px 14px;
  border: 1px solid #CBD5E1;
  border-radius: 10px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #1A56DB;
  box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.12);
}

.otp-inputs {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 10px 0;
}

.otp-digit-box {
  width: 44px;
  height: 52px;
  text-align: center;
  font-size: 22px;
  font-weight: 800;
  color: #1A56DB;
  border: 2px solid #CBD5E1;
  border-radius: 10px;
  outline: none;
  transition: all 0.2s;
}

.otp-digit-box:focus {
  border-color: #1A56DB;
  box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.15);
}

.btn-primary-auth {
  padding: 13px;
  background: #1A56DB;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary-auth:hover:not(:disabled) {
  background: #1D4ED8;
}

.btn-primary-auth:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.resend-wrap {
  text-align: center;
}

.btn-resend {
  background: none;
  border: none;
  color: #1A56DB;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-resend:disabled {
  color: #94A3B8;
  cursor: not-allowed;
}

.back-link-wrap {
  text-align: center;
  margin-top: 4px;
}

.back-link {
  color: #64748B;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
}

.back-link:hover {
  color: #0F172A;
}

.back-link-btn {
  background: none;
  border: none;
  color: #64748B;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.back-link-btn:hover {
  color: #0F172A;
}
</style>
