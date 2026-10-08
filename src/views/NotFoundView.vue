<template>
    <div class="not-found">
        <span class="not-found-code">404</span>
        <h1 class="not-found-title">Page Not Found</h1>
        <p class="not-found-text">
            The page you are looking for doesn't exist or has been moved.
        </p>
        <div class="not-found-actions">
            <router-link to="/" class="btn-home">Go to Home</router-link>
            <router-link to="/services" class="btn-services">Browse Services</router-link>
        </div>
    </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.not-found {
    max-width: 560px;
    margin: 0 auto;
    padding: 80px 20px;
    text-align: center;
}

.not-found-code {
    display: block;
    font-size: 96px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -2px;
    background: linear-gradient(135deg, #1A56DB 0%, #3B82F6 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin-bottom: 12px;
}

.not-found-title {
    font-size: 28px;
    font-weight: 800;
    color: #0F172A;
    margin-bottom: 10px;
}

.not-found-text {
    font-size: 16px;
    color: #64748B;
    line-height: 1.6;
    margin-bottom: 28px;
}

.not-found-actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
}

.btn-home,
.btn-services {
    padding: 12px 26px;
    border-radius: 999px;
    font-size: 15px;
    font-weight: 700;
    text-decoration: none;
    transition: background 0.2s, color 0.2s, transform 0.15s;
}

.btn-home {
    background: #1A56DB;
    color: #FFFFFF;
    box-shadow: 0 8px 18px rgba(26, 86, 219, 0.25);
}

.btn-home:hover {
    background: #1E40AF;
    transform: translateY(-1px);
}

.btn-services {
    background: #EFF4FF;
    color: #1A56DB;
}

.btn-services:hover {
    background: #DBE6FF;
}

@media (max-width: 480px) {
    .not-found {
        padding: 56px 16px;
    }

    .not-found-code {
        font-size: 72px;
    }

    .not-found-title {
        font-size: 24px;
    }
}
</style>
