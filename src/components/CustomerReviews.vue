<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFetch } from '@/composables/useFetch'

const { execute: fetchAllReviewsApi } = useFetch('/api/all-reviews', { immediate: false })
const { execute: fetchLatestReviewsApi } = useFetch('/api/reviews/latest', { immediate: false })

interface Review {
    id: number
    name: string
    comment: string
    date: string
    rating: number
    avatar?: string | null
}

const reviews = ref<Review[]>([
    {
        id: 1,
        name: 'Muhammad Aqib',
        comment: 'Reliable with standard work done. Fast delivery in good cost, and straight to the point.',
        date: '12/08/2026',
        rating: 5
    },
    {
        id: 2,
        name: 'Sarah Khan',
        comment: 'Very polite behavior and great work quality. High recommendation for AC repair.',
        date: '10/08/2026',
        rating: 5
    },
    {
        id: 3,
        name: 'Ali Hassan',
        comment: 'Prompt service and excellent communication throughout. Solved plumbing issue in minutes.',
        date: '07/08/2026',
        rating: 5
    },
    {
        id: 4,
        name: 'Zainab Ahmed',
        comment: 'Highly professional team! Arrived on time and did flawless electrical wiring.',
        date: '04/08/2026',
        rating: 5
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
    if (windowWidth.value <= 600) return 1
    if (windowWidth.value <= 900) return 2
    return 3
})

const totalDots = computed(() => Math.max(1, reviews.value.length - itemsPerView.value + 1))

const trackTransform = computed(() => {
    const shiftPercent = currentIndex.value * (100 / itemsPerView.value)
    return `translateX(-${shiftPercent}%)`
})

const formatDate = (rawDateStr: string) => {
    if (!rawDateStr) return ''
    try {
        const d = new Date(rawDateStr)
        if (isNaN(d.getTime())) return rawDateStr
        return d.toLocaleDateString('en-GB')
    } catch {
        return rawDateStr
    }
}

const formatAvatarUrl = (avatarPath?: string | null) => {
    if (!avatarPath) return null
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) return avatarPath
    return `http://127.0.0.1:8001/${avatarPath.replace(/^\//, '')}`
}

const fetchReviews = async () => {
    try {
        let resData = await fetchAllReviewsApi()
        let items = resData?.data || (Array.isArray(resData) ? resData : [])

        if (!Array.isArray(items) || items.length === 0) {
            resData = await fetchLatestReviewsApi()
            items = resData?.data || (Array.isArray(resData) ? resData : [])
        }

        if (Array.isArray(items) && items.length > 0) {
            reviews.value = items.map((item: any) => ({
                id: item.id,
                name: item.customer_name || 'Customer',
                comment: item.comment || '',
                date: formatDate(item.review_date || item.created_at),
                rating: item.rating || 5,
                avatar: formatAvatarUrl(item.customer_avatar)
            }))
        }
    } catch (e) {
        // Keep fallback static reviews if backend offline
    }
}

const nextSlide = () => {
    if (isPaused.value || totalDots.value <= 1) return
    currentIndex.value = (currentIndex.value + 1) % totalDots.value
}

const setSlide = (index: number) => {
    currentIndex.value = index
}

onMounted(() => {
    window.addEventListener('resize', updateWidth)
    fetchReviews()
    timer = window.setInterval(nextSlide, 4500)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
    if (timer) clearInterval(timer)
})
</script>

<template>
    <section class="reviews-section auto-switch-slider" @mouseenter="isPaused = true" @mouseleave="isPaused = false">
        <h2 class="reviews-title">Our Customers Speak for Us!</h2>

        <div class="reviews-slider-window">
            <div class="reviews-track" :style="{ transform: trackTransform }">
                <div v-for="review in reviews" :key="review.id" class="review-card">
                    <div class="review-card-inner">
                        <div class="card-header">
                            <div class="avatar-circle">
                                <img v-if="review.avatar" :src="review.avatar" class="avatar-img" />
                                <svg v-else viewBox="0 0 24 24" width="24" height="24" fill="#94A3B8">
                                    <path
                                        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            </div>
                            <span class="user-name">{{ review.name }}</span>
                        </div>

                        <p class="review-text">{{ review.comment }}</p>

                        <div class="card-footer">
                            <span class="review-date">{{ review.date }}</span>
                            <div class="star-rating">
                                <span v-for="n in review.rating" :key="n" class="star">★</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Slider Dots -->
        <div v-if="totalDots > 1" class="slider-dots">
            <button v-for="(_, index) in totalDots" :key="index" class="dot-btn"
                :class="{ active: currentIndex === index }" @click="setSlide(index)"
                :aria-label="`Review slide ${index + 1}`"></button>
        </div>
    </section>
</template>

<style scoped>
.reviews-section {
    padding: 60px 0;
}

.reviews-title {
    text-align: center;
    font-size: 2.2rem;
    font-weight: 800;
    color: #0F172A;
    margin-bottom: 40px;
}

.reviews-slider-window {
    overflow: hidden;
    padding: 12px 4px;
}

.reviews-track {
    display: flex;
    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.review-card {
    flex: 0 0 33.333%;
    min-width: 33.333%;
    box-sizing: border-box;
    padding: 0 12px;
}

.review-card-inner {
    background: #ffffff;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    height: 100%;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

.avatar-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #F1F5F9;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user-name {
    font-size: 16px;
    font-weight: 700;
    color: #1E293B;
}

.review-text {
    font-size: 0.95rem;
    color: #475569;
    line-height: 1.5;
    margin-bottom: 24px;
    flex: 1;
}

.card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 16px;
    border-top: 1px dashed #E2E8F0;
}

.review-date {
    font-size: 13px;
    color: #94A3B8;
}

.star-rating {
    display: flex;
    gap: 2px;
}

.star {
    color: #1A56DB;
    font-size: 16px;
}

.slider-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 24px;
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
    .reviews-section {
        padding: 40px 0;
    }

    .reviews-title {
        font-size: 1.75rem;
        margin-bottom: 24px;
    }

    .review-card {
        flex: 0 0 50%;
        min-width: 50%;
        padding: 0 8px;
    }
}

@media (max-width: 600px) {
    .reviews-section {
        padding: 30px 0;
    }

    .reviews-title {
        font-size: 1.5rem;
        margin-bottom: 20px;
    }

    .review-card {
        flex: 0 0 100%;
        min-width: 100%;
        padding: 0 4px;
    }
}
</style>
