<template>
    <div class="login-page">
        <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
                <label>Email</label>
                <input type="email" v-model="email" required />
            </div>

            <div class="form-group">
                <label>Password</label>
                <input type="password" v-model="password" required />
            </div>

            <button type="submit" class="btn-login-submit">Sign In</button>

            <p class="register-link">
                Don't have an account? <router-link to="/register">Register</router-link>
            </p>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const password = ref('')

const handleLogin = () => {
    console.log('Login:', email.value, password.value)
    // Handle login logic
}
</script>

<style scoped>
.login-page {
    width: 100%;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-group label {
    font-weight: 500;
    color: #2d3748;
}

.form-group input {
    padding: 12px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.2s ease;
}

.form-group input:focus {
    outline: none;
    border-color: #42b883;
}

.btn-login-submit {
    padding: 12px;
    background: #42b883;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
}

.btn-login-submit:hover {
    background: #3aa876;
}

.register-link {
    text-align: center;
    color: #718096;
}

.register-link a {
    color: #42b883;
    text-decoration: none;
    font-weight: 600;
}

.register-link a:hover {
    text-decoration: underline;
}
</style>