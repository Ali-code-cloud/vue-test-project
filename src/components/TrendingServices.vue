<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import washingMachineImg from '@/assets/washing_machine.png'
import muslimShowerImg from '@/assets/muslim_shower.png'
import acRepairImg from '@/assets/service-images/ac.png'

import { useFetch } from '@/composables/useFetch'

interface TrendingService {
    id: number
    title: string
    rating: string
    price: string
    image: string
}

const trendingServices = ref<TrendingService[]>([
    {
        id: 1,
        title: 'Automatic Washing Machine Repairing',
        rating: '4.8',
        price: 'Rs:1200',
        image: washingMachineImg
    },
    {
        id: 2,
        title: 'Muslim shower Replacement',
        rating: '4.8',
        price: 'Rs:450',
        image: muslimShowerImg
    },
    {
        id: 3,
        title: 'Master AC Deep Cleaning & Service',
        rating: '4.9',
        price: 'Rs:1500',
        image: acRepairImg
    }
])

const currentIndex = ref(0)
const isPaused = ref(false)
let timer: number | null = null

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)

const updateWidth = () => {
    windowWidth.value = window.innerWidth
}

const itemsPerView = computed(() => {
    return windowWidth.value <= 900 ? 1 : 2
})

const totalDots = computed(() => Math.max(1, trendingServices.value.length - itemsPerView.value + 1))

const trackTransform = computed(() => {
    const shiftPercent = currentIndex.value * (100 / itemsPerView.value)
    return `translateX(-${shiftPercent}%)`
})

const nextSlide = () => {
    if (isPaused.value || totalDots.value <= 1) return
    currentIndex.value = (currentIndex.value + 1) % totalDots.value
}

const setSlide = (index: number) => {
    currentIndex.value = index
}

const { execute: fetchTrendingApi } = useFetch('/api/trending-services', { immediate: false })

const formatImageUrl = (imagePath?: string | null) => {
    if (!imagePath) return washingMachineImg
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath
    return `http://127.0.0.1:8001/storage/${imagePath.replace(/^\//, '')}`
}

const fetchTrendingServices = async () => {
    try {
        const res = await fetchTrendingApi()
        const items = res?.data || (Array.isArray(res) ? res : [])
        if (Array.isArray(items) && items.length > 0) {
            trendingServices.value = items.map((item: any) => ({
                id: item.id,
                title: item.name || 'Home Service',
                rating: item.rating && Number(item.rating) > 0 ? String(item.rating) : '4.8',
                price: item.discounted_price ? `Rs:${Math.round(Number(item.discounted_price))}` : (item.original_price ? `Rs:${Math.round(Number(item.original_price))}` : 'Rs:1200'),
                image: formatImageUrl(item.image)
            }))
        }
    } catch (err) {
        // Keep initial fallback values
    }
}

onMounted(() => {
    window.addEventListener('resize', updateWidth)
    fetchTrendingServices()
    timer = window.setInterval(nextSlide, 3500)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
    if (timer) clearInterval(timer)
})
</script>

<template>
    <section class="trending-section auto-switch-slider" @mouseenter="isPaused = true" @mouseleave="isPaused = false">
        <div class="trending-container">
            <!-- Left Info Block -->
            <div class="trending-info">
                <span class="trending-badge">Trending Services</span>
                <h2 class="trending-heading">Hot-sellers are up for grabs!</h2>
                <p class="trending-description">
                    The most popular, highly recommended & pocket friendly deals of the month.
                    Our customers love these MUST-COMPLY services. Try now!
                </p>
            </div>

            <!-- Right Slider Block -->
            <div class="trending-slider-wrapper">
                <div class="trending-cards-window">
                    <div class="trending-cards-track" :style="{ transform: trackTransform }">
                        <div v-for="service in trendingServices" :key="service.id" class="trending-card-item">
                            <div class="trending-card">
                                <div class="card-image-box">
                                    <img :src="service.image" :alt="service.title" class="service-product-img" />
                                </div>
                                <div class="card-blue-content">
                                    <h3 class="card-title">{{ service.title }}</h3>
                                    <div class="card-meta">
                                        <span class="rating-badge">★ {{ service.rating }}</span>
                                        <span class="price-tag">{{ service.price }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pagination Dots -->
                <div v-if="totalDots > 1" class="slider-dots">
                    <button v-for="(_, index) in totalDots" :key="index" class="dot-btn"
                        :class="{ active: currentIndex === index }" @click="setSlide(index)"
                        :aria-label="`Slide ${index + 1}`"></button>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.trending-section {
    background: #F4F7FE;
    border-radius: 16px;
    padding: 48px 36px;
    margin: 40px 0;
}

.trending-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 40px;
}

.trending-info {
    flex: 1;
    max-width: 400px;
}

.trending-badge {
    color: #1A56DB;
    font-size: 15px;
    font-weight: 700;
    display: block;
    margin-bottom: 8px;
}

.trending-heading {
    font-size: 2.2rem;
    font-weight: 800;
    color: #0F172A;
    line-height: 1.2;
    margin-bottom: 16px;
}

.trending-description {
    font-size: 0.95rem;
    color: #64748B;
    line-height: 1.6;
}

.trending-slider-wrapper {
    flex: 1.4;
    overflow: hidden;
    position: relative;
    width: 100%;
}

.trending-cards-window {
    overflow: hidden;
    padding: 10px 0;
}

.trending-cards-track {
    display: flex;
    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.trending-card-item {
    flex: 0 0 50%;
    min-width: 50%;
    box-sizing: border-box;
    padding: 0 10px;
}

.trending-card {
    border-radius: 12px;
    overflow: hidden;
    background: white;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    height: 100%;
}

.card-image-box {
    height: 160px;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
}

.service-product-img {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
}

.card-blue-content {
    background: #2563EB;
    color: white;
    padding: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.card-title {
    font-size: 15px;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 12px;
}

.card-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.rating-badge {
    background: #EAB308;
    color: #0F172A;
    font-size: 12px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 12px;
}

.price-tag {
    font-size: 16px;
    font-weight: 800;
}

.slider-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 20px;
}

.dot-btn {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #CBD5E1;
    border: none;
    cursor: pointer;
    transition: background 0.3s, transform 0.2s;
}

.dot-btn.active {
    background: #1A56DB;
    transform: scale(1.2);
}

@media (max-width: 900px) {
    .trending-section {
        padding: 32px 20px;
        margin: 24px 0;
    }

    .trending-container {
        flex-direction: column;
        text-align: center;
        gap: 24px;
    }

    .trending-info {
        max-width: 100%;
    }

    .trending-heading {
        font-size: 1.75rem;
    }

    .trending-card-item {
        flex: 0 0 100%;
        min-width: 100%;
        padding: 0 4px;
    }
}
</style>
