<template>
  <div class="social-login">
    <div class="social-divider"><span>or continue with</span></div>

    <div class="social-buttons">
      <button type="button" class="btn-social" :disabled="!!pending" @click="start('google')">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.57-5.15 3.57-8.8z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.87-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95h-4v3.1A12 12 0 0 0 12 24z" />
          <path fill="#FBBC05" d="M5.29 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z" />
          <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.8l3.43-3.43A11.97 11.97 0 0 0 1.29 6.6l4 3.1C6.23 6.86 8.88 4.75 12 4.75z" />
        </svg>
        {{ pending === 'google' ? 'Redirecting...' : 'Google' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore, type SocialProvider } from '@/stores/auth'

// Where to land after the OAuth round trip (defaults to the dashboard)
const props = defineProps<{ redirectTo?: string }>()

const authStore = useAuthStore()
const pending = ref<SocialProvider | null>(null)

const start = (provider: SocialProvider) => {
  pending.value = provider
  authStore.startSocialLogin(provider, props.redirectTo)
}
</script>

<style scoped>
.social-login {
  margin-top: 20px;
}

.social-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 16px;
}

.social-divider::before,
.social-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.social-buttons {
  display: flex;
  gap: 12px;
}

.btn-social {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: #ffffff;
  color: #111827;
  border: 1px solid #d1d5db;
  border-radius: 40px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.btn-social:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-social:disabled {
  opacity: 0.6;
  cursor: wait;
}
</style>
