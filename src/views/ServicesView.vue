<script setup lang="ts">
import { ref } from 'vue'
import acIcon from '@/assets/service-images/ac.png'
import applianceRepair from '@/assets/service-images/appliance-repair.png'
import carpenter from '@/assets/service-images/carpenter.png'
import electrician from '@/assets/service-images/electrician.png'
import geyser from '@/assets/service-images/geyser.png'
import handyman from '@/assets/service-images/handyman.png'
import painter from '@/assets/service-images/painter.png'
import plumber from '@/assets/service-images/plumber.png'
import pestControl from '@/assets/service-images/pest-control.png'

const services = ref([
    { name: 'AC Services', icon: acIcon },
    { name: 'Plumber', icon: plumber },
    { name: 'Electrician', icon: electrician },
    { name: 'Handyman', icon: handyman },
    { name: 'Carpenter', icon: carpenter },
    { name: 'Painter', icon: painter },
    { name: 'Home Appliance', icon: applianceRepair },
    { name: 'Geyser', icon: geyser },
    { name: 'Pest Control', icon: pestControl },
])
</script>
<template>
    <h2>Our Services</h2>

    <div class="services-grid">
        <div class="service-card" v-for="service in services" :key="service.name">
            <div class="service-icon">
                <img v-if="service.icon.includes('.')" :src="service.icon" :alt="service.name" />
                <span v-else>{{ service.icon }}</span>
            </div>

            <h3>{{ service.name }}</h3>
        </div>
    </div>
</template>
<style>
h2 {
    text-align: center;
    font-size: 2rem;
    color: #1a202c;
    margin-bottom: 30px;
}

.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}

.service-card {
    background: white;
    padding: 30px 20px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: transform 0.3s ease;
}

.service-card:hover {
    transform: translateY(-4px);
}

.service-icon {
    font-size: 40px;
    display: block;
    margin-bottom: 12px;
}

.service-card h3 {
    font-size: 16px;
    color: #2d3748;
}
</style>
