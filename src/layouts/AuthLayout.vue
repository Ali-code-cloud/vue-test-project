<template>
    <div class="auth-layout">
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h2>Welcome Back</h2>
                    <p>Sign in to your account</p>
                </div>
                <router-view />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// No header, no footer - clean layout for authentication
</script>

<style scoped>
.auth-layout {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #42b883 0%, #2d8f6f 100%);
}

.auth-container {
    width: 100%;
    max-width: 420px;
    padding: 20px;
}

.auth-card {
    background: white;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.auth-header {
    text-align: center;
    margin-bottom: 30px;
}

.auth-header h2 {
    font-size: 28px;
    color: #1a202c;
    margin-bottom: 8px;
}

.auth-header p {
    color: #718096;
}
</style>