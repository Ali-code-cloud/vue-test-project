<template>
  <div class="redirecting-wrap">
    <p>Redirecting to login...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  router.replace('/login')
})
</script>

<style scoped>
.redirecting-wrap {
  text-align: center;
  padding: 40px 20px;
  color: #64748B;
  font-size: 15px;
}
</style>