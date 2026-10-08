<template>
  <button type="button" class="back-btn" :aria-label="label" :title="label" @click="goBack">
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = withDefaults(defineProps<{
  /** Where to go when there is no previous page in this site (opened from a link or bookmark) */
  fallback?: string
  label?: string
}>(), {
  fallback: '/',
  label: 'Go back'
})

const router = useRouter()

function goBack() {
  // history.state.back is set by vue-router when there is an in-app page to return to
  if (window.history.state?.back) router.back()
  else router.push(props.fallback)
}
</script>

<style scoped>
.back-btn {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #E2E8F0;
  border-radius: 50%;
  background: #FFFFFF;
  color: #0F172A;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
  transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.15s;
}

.back-btn:hover {
  background: #EFF4FF;
  border-color: #C7D7FE;
  color: #1A56DB;
}

.back-btn:active {
  transform: scale(0.95);
}
</style>
