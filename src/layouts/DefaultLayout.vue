<template>
    <div class="default-layout">
        <!-- Header -->
        <Header />

        <!-- No Hero Section Here - Just content -->

        <!-- Main Content -->
        <main class="main-content">
            <router-view />
        </main>

        <!-- Footer -->
        <Footer />
    </div>
</template>

<script setup lang="ts">
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>

<style scoped>
.default-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.main-content {
    flex: 1;
    max-width: 1280px;
    margin: 0 auto;
    padding: 40px 20px;
    width: 100%;
}
</style>