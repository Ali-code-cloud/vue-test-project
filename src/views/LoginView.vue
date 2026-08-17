<template>
    <div class="login-card-inner">
        <div v-if="errorMsg" class="error-alert">{{ errorMsg }}</div>
        <div v-if="successMsg" class="success-alert">{{ successMsg }}</div>

        <form @submit.prevent="handlePasswordLogin" class="login-form">
            <div class="form-group">
                <label>Email Address</label>
                <div class="input-wrapper">
                    <span class="input-icon">✉️</span>
                    <input 
                        type="email" 
                        v-model="email" 
                        placeholder="user@example.com" 
                        required 
                    />
                </div>
            </div>

            <div class="form-group">
                <label>Password</label>
                <div class="input-wrapper">
                    <span class="input-icon">🔒</span>
                    <input 
                        type="password" 
                        v-model="password" 
                        placeholder="••••••••" 
                        required 
                    />
                </div>
            </div>

            <div class="form-options">
                <label class="remember-me">
                    <input type="checkbox" v-model="rememberMe" />
                    <span>Remember me</span>
                </label>
                <router-link to="/forgot-password" class="forgot-pass">Forgot password?</router-link>
            </div>

            <button type="submit" class="btn-login-submit" :disabled="isLoading">
                <span v-if="isLoading">Signing in...</span>
                <span v-else>Sign In</span>
            </button>
        </form>

        <div class="register-prompt-box">
            <p>Don't have an account?</p>
            <button type="button" @click="openRegisterModal" class="btn-register-link">
                ✨ Register with OTP / Create Account
            </button>
        </div>

        <div class="back-home-wrap">
            <router-link to="/" class="back-home-link">← Back to Home</router-link>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, getApiError } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const email = ref('')
const password = ref('')
const rememberMe = ref(true)

const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

const openRegisterModal = () => {
    cartStore.openAuthModal()
}

/** Password Login */
const handlePasswordLogin = async () => {
    errorMsg.value = ''
    successMsg.value = ''
    if (!email.value.trim() || !password.value.trim()) {
        errorMsg.value = 'Please fill in both email and password.'
        return
    }

    isLoading.value = true
    try {
        const data = await authStore.login(email.value, password.value)
        if (data.token || authStore.isAuthenticated) {
            successMsg.value = 'Login successful! Redirecting...'
            setTimeout(() => router.push('/dashboard'), 500)
        } else {
            errorMsg.value = data.message || 'Invalid email or password.'
        }
    } catch (e) {
        errorMsg.value = getApiError(e)
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped>
.login-card-inner {
    width: 100%;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.error-alert {
    background: #FEE2E2;
    color: #DC2626;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 16px;
    border: 1px solid #FCA5A5;
}

.success-alert {
    background: #D1FAE5;
    color: #065F46;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 16px;
    border: 1px solid #6EE7B7;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-weight: 600;
    color: #1E293B;
    font-size: 14px;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon {
    position: absolute;
    left: 14px;
    font-size: 16px;
    pointer-events: none;
}

.input-wrapper input {
    width: 100%;
    padding: 13px 14px 13px 44px;
    border: 1px solid #CBD5E1;
    border-radius: 12px;
    font-size: 15px;
    color: #0F172A;
    background: #F8FAFC;
    transition: all 0.2s ease;
}

.input-wrapper input:focus {
    outline: none;
    background: white;
    border-color: #1A56DB;
    box-shadow: 0 0 0 4px rgba(26, 86, 219, 0.12);
}

.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13.5px;
    margin-top: 2px;
}

.remember-me {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #475569;
    cursor: pointer;
    user-select: none;
}

.remember-me input {
    width: 16px;
    height: 16px;
    accent-color: #1A56DB;
    cursor: pointer;
}

.forgot-pass {
    color: #1A56DB;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
}

.forgot-pass:hover {
    color: #1D4ED8;
    text-decoration: underline;
}

.btn-login-submit {
    width: 100%;
    padding: 14px;
    background: #1A56DB;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(26, 86, 219, 0.25);
    transition: all 0.2s ease;
    margin-top: 6px;
}

.btn-login-submit:hover:not(:disabled) {
    background: #1D4ED8;
    box-shadow: 0 6px 16px rgba(26, 86, 219, 0.35);
    transform: translateY(-1px);
}

.btn-login-submit:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
}

.register-prompt-box {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #E2E8F0;
    text-align: center;
}

.register-prompt-box p {
    font-size: 13.5px;
    color: #64748B;
    margin-bottom: 10px;
}

.btn-register-link {
    display: inline-block;
    width: 100%;
    padding: 11px;
    background: white;
    color: #1A56DB;
    border: 2px solid #1A56DB;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
}

.btn-register-link:hover {
    background: #EFF6FF;
    color: #1D4ED8;
    border-color: #1D4ED8;
}

.back-home-wrap {
    text-align: center;
    margin-top: 16px;
}

.back-home-link {
    font-size: 13px;
    color: #64748B;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.back-home-link:hover {
    color: #0F172A;
}
</style>