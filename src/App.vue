<template>
  <router-view />
  <AuthModal />
</template>

<script setup lang="ts">
import AuthModal from '@/components/AuthModal.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f8fafc;
}
</style>