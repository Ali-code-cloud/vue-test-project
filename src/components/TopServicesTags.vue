<script setup lang="ts">
import { ref } from 'vue'

const tags = ref([
    'electrician services',
    'vacuum repairing service',
    'impeller radiator fan motor',
    'WASHING MACHINE GEYSER REPAIRING',
    'refrigerator repair',
    'BOTTLE TRAP FITMENT',
    'DCO DUST CLEANING',
    'Door Lock Installation Expert',
    'Water Tank Leakage Fixation',
    'AC Repair Services',
    'General Maintenance and Repairing',
    'Pest Control Services Lahore'
])
</script>

<template>
    <section class="top-services-section">
        <div class="top-services-card">
            <h2 class="section-title">Top Services</h2>
            <div class="tags-container">
                <a 
                    v-for="(tag, index) in tags" 
                    :key="index" 
                    href="#" 
                    class="service-tag"
                >
                    {{ tag }}
                </a>
            </div>
        </div>
    </section>
</template>

<style scoped>
.top-services-section {
    margin: 40px 0 60px;
}

.top-services-card {
    background: #F8FAFC;
    border-radius: 12px;
    padding: 32px;
}

.section-title {
    font-size: 1.8rem;
    font-weight: 800;
    color: #0F172A;
    margin-bottom: 20px;
}

.tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.service-tag {
    background: #ffffff;
    border: 1px solid #CBD5E1;
    border-radius: 20px;
    padding: 6px 16px;
    font-size: 13px;
    color: #334155;
    text-decoration: none;
    transition: all 0.2s ease;
    font-weight: 500;
}

.service-tag:hover {
    border-color: #1A56DB;
    color: #1A56DB;
    background: #EFF6FF;
}
</style>
