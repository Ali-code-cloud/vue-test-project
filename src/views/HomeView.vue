<template>
    <div class="home-page">
        <ServicesView />

        <div class="why-choose">
            <h2>Why Choose Us?</h2>
            <ul>
                <li v-for="(feature, index) in features" :key="index">
                    ✅ {{ feature }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ServicesView from './ServicesView.vue'
const features = ref([
    'Verified and Trained Technicians',
    'Easy Booking Process',
    'Impeccable Customer Support',
    'Cost-effective Services'
])
</script>

<style scoped>
.home-page {
    max-width: 1200px;
    margin: 0 auto;
}

.why-choose {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.why-choose h2 {
    margin-bottom: 20px;
}

.why-choose ul {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 12px;
}

.why-choose ul li {
    padding: 8px 0;
    color: #4a5568;
}
</style>