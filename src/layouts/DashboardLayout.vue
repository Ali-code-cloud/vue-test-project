<template>
  <div class="dashboard-layout">
    <Header />
    <main class="dashboard-main">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F8FAFC;
}

.dashboard-main {
  flex: 1;
}
</style>