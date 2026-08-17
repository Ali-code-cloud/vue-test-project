<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Review {
    id: number
    name: string
    comment: string
    date: string
    rating: number
}

const reviews: Review[] = [
    {
        id: 1,
        name: 'Riaz',
        comment: 'work is good and fast with technical cleaning service.',
        date: '12/07/2023',
        rating: 5
    },
    {
        id: 2,
        name: 'Danial',
        comment: 'Danial is the best component, he is a professional guy in work, zero messy.',
        date: '20/07/2023',
        rating: 5
    },
    {
        id: 3,
        name: 'Muhammad Aqib',
        comment: 'Reliable with standard work done. Fast delivery in good cost, and straight to the point.',
        date: '18/07/2023',
        rating: 5
    },
    {
        id: 4,
        name: 'Sarah Khan',
        comment: 'Very polite behavior and great work quality. High recommendation for AC repair.',
        date: '15/07/2023',
        rating: 5
    }
]

const currentIndex = ref(0)
const isPaused = ref(false)
let timer: number | null = null

const totalDots = reviews.length - 1

const nextSlide = () => {
    if (isPaused.value) return
    currentIndex.value = (currentIndex.value + 1) % totalDots
}

const setSlide = (index: number) => {
    currentIndex.value = index
}

onMounted(() => {
    timer = window.setInterval(nextSlide, 4500)
})

onUnmounted(() => {
    if (timer) clearInterval(timer)
})
</script>

<template>
    <section 
        class="reviews-section auto-switch-slider"
        @mouseenter="isPaused = true" 
        @mouseleave="isPaused = false"
    >
        <h2 class="reviews-title">Our Customers Speak for Us!</h2>

        <div class="reviews-slider-window">
            <div 
                class="reviews-track"
                :style="{ transform: `translateX(-${currentIndex * 34}%)` }"
            >
                <div v-for="review in reviews" :key="review.id" class="review-card">
                    <div class="card-header">
                        <div class="avatar-circle">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="#94A3B8">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
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

        <!-- Slider Dots -->
        <div class="slider-dots">
            <button 
                v-for="(_, index) in totalDots" 
                :key="index"
                class="dot-btn"
                :class="{ active: currentIndex === index }"
                @click="setSlide(index)"
                :aria-label="`Review slide ${index + 1}`"
            ></button>
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
    gap: 24px;
    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.review-card {
    min-width: 320px;
    flex: 0 0 32%;
    background: #ffffff;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
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
    .review-card {
        flex: 0 0 75%;
    }
}

@media (max-width: 500px) {
    .review-card {
        flex: 0 0 90%;
    }
}
</style>
