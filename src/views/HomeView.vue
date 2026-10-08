<template>
    <div class="home-page">
        <!-- 1. Services Grid Section -->
        <ServicesView />

        <!-- 2. Trending Services Slider -->
        <TrendingServices />

        <!-- 3. Customer Reviews Slider -->
        <CustomerReviews />

        <!-- 4. Complaint Form Section -->
        <ComplaintForm />

        <!-- 5. Top Services Tag Chips -->
        <TopServicesTags />
    </div>
</template>

<script setup lang="ts">
import ServicesView from './ServicesView.vue'
import TrendingServices from '@/components/TrendingServices.vue'
import CustomerReviews from '@/components/CustomerReviews.vue'
import ComplaintForm from '@/components/ComplaintForm.vue'
import TopServicesTags from '@/components/TopServicesTags.vue'
</script>

<style scoped>
.home-page {
    width: 100%;
}
</style>