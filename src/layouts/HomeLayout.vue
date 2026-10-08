<template>
    <div class="home-layout">
        <!-- Header -->
        <Header />

        <!-- Hero Section - ONLY on home page -->
        <HeroSection />

        <!-- Main Content - Home page content will render here -->
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
import HeroSection from '@/views/HeroSection.vue';
</script>

<style scoped>
.home-layout {
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