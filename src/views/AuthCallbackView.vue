<template>
  <div class="auth-callback">
    <template v-if="errorMessage">
      <h2 class="callback-title">Sign in failed</h2>
      <div class="auth-alert error-alert">{{ errorMessage }}</div>
      <router-link to="/login" class="btn-back-login">Back to Sign In</router-link>
    </template>
    <template v-else>
      <div class="spinner" aria-hidden="true"></div>
      <h2 class="callback-title">Signing you in...</h2>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, getApiError, SOCIAL_REDIRECT_KEY } from '@/stores/auth'
import { showSuccessToast } from '@/utils/alert'

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'You cancelled the sign in. Please try again.',
  authentication_failed: 'We could not verify your account with the provider. Please try again.',
  account_disabled: 'Your account has been disabled. Please contact support.',
  server_error: 'Something went wrong on our side. Please try again later.'
}

const authStore = useAuthStore()
const router = useRouter()
const errorMessage = ref('')

onMounted(async () => {
  // URLSearchParams decodes the token's "|" (sent as %7C)
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  const error = params.get('error')

  const redirectTo = sessionStorage.getItem(SOCIAL_REDIRECT_KEY) || '/dashboard'
  sessionStorage.removeItem(SOCIAL_REDIRECT_KEY)

  // Drop the token from the address bar and browser history
  window.history.replaceState(null, '', '/auth/callback')

  if (error || !token) {
    errorMessage.value = ERROR_MESSAGES[error || ''] || ERROR_MESSAGES.authentication_failed!
    return
  }

  try {
    const user = await authStore.loginWithToken(token)
    showSuccessToast(`Welcome, ${user.name}!`)
    router.replace(redirectTo)
  } catch (e) {
    errorMessage.value = getApiError(e)
  }
})
</script>

<style scoped>
.auth-callback {
  width: 100%;
  text-align: center;
  padding: 24px 0;
}

.callback-title {
  font-size: 24px;
  font-weight: 500;
  color: #000000;
  margin-bottom: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 20px;
  border: 4px solid #e5e7eb;
  border-top-color: #0D52CD;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

.btn-back-login {
  display: inline-block;
  background: #0D52CD;
  color: #ffffff;
  border-radius: 40px;
  padding: 12px 36px;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
}

.btn-back-login:hover {
  background: #0B46B3;
}
</style>
