<template>
    <div class="auth-layout">
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <router-link to="/" class="auth-logo">
                        <span class="logo-bold">Mr Home</span> <span class="logo-sub">Services</span>
                    </router-link>
                    <h2>{{ headerTitle }}</h2>
                    <p>{{ headerSub }}</p>
                </div>
                <router-view />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const headerTitle = computed(() => {
    if (route.path.includes('register')) return 'Create Account'
    if (route.path.includes('forgot-password')) return 'Reset Password'
    return 'Welcome Back'
})

const headerSub = computed(() => {
    if (route.path.includes('register')) return 'Join thousands of happy homeowners today'
    if (route.path.includes('forgot-password')) return 'Verify your phone/email to set a new password'
    return 'Sign in with OTP or password to access your dashboard'
})
</script>

<style scoped>
.auth-layout {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1A56DB 100%);
    padding: 20px;
}

.auth-container {
    width: 100%;
    max-width: 440px;
}

.auth-card {
    background: white;
    border-radius: 20px;
    padding: 36px 32px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
}

.auth-header {
    text-align: center;
    margin-bottom: 24px;
}

.auth-logo {
    text-decoration: none;
    display: inline-block;
    margin-bottom: 12px;
}

.logo-bold {
    font-size: 28px;
    font-weight: 800;
    color: #1A56DB;
}

.logo-sub {
    font-size: 14px;
    font-weight: 600;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.auth-header h2 {
    font-size: 24px;
    font-weight: 800;
    color: #0F172A;
    margin-bottom: 6px;
}

.auth-header p {
    color: #64748B;
    font-size: 14px;
}

@media (max-width: 480px) {
    .auth-card {
        padding: 24px 20px;
    }
}
</style>