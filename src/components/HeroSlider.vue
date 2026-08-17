<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Slide {
    id: number
    image: string
}
const props = defineProps<{ slides: Slide[], autoPlay?: boolean, interval?: number }>()
const currentSlide = ref(0)
const transitioning = ref(false)
const isPaused = ref(false)

const trackStyle = computed(() => ({
    transform: `translateX(-${currentSlide.value * 100}%)`,
    transition: transitioning.value ? 'transform .5s ease' : 'none'
}))
const total = computed(() => props.slides.length)

const nextSlide = () => { 
    if (isPaused.value) return
    transitioning.value = true
    currentSlide.value = (currentSlide.value + 1) % total.value
    setTimeout(() => transitioning.value = false, 500) 
}

const prevSlide = () => { 
    transitioning.value = true
    currentSlide.value = (currentSlide.value - 1 + total.value) % total.value
    setTimeout(() => transitioning.value = false, 500) 
}

const goToSlide = (i: number) => { 
    transitioning.value = true
    currentSlide.value = i
    setTimeout(() => transitioning.value = false, 500) 
}

let timer: number | null = null

const startAutoSwitch = () => {
    if (props.autoPlay !== false && !timer) {
        timer = window.setInterval(nextSlide, props.interval ?? 4000)
    }
}

const stopAutoSwitch = () => {
    if (timer) {
        clearInterval(timer)
        timer = null
    }
}

onMounted(() => {
    startAutoSwitch()
})

onUnmounted(() => {
    stopAutoSwitch()
})
</script>

<template>
    <section 
        class="hero-slider auto-switch-slider"
        @mouseenter="isPaused = true" 
        @mouseleave="isPaused = false"
    >
        <div class="slider-container">
            <div class="slides-track" :style="trackStyle">
                <div v-for="slide in slides" :key="slide.id" class="slide">
                    <img :src="slide.image" class="slide-image" alt="Hero Slide" />
                </div>
            </div>

            <button class="slider-arrow prev" @click="prevSlide" aria-label="Previous slide">
                ❮
            </button>

            <button class="slider-arrow next" @click="nextSlide" aria-label="Next slide">
                ❯
            </button>
        </div>

        <div class="slider-dots">
            <button v-for="(slide, index) in slides" :key="slide.id" class="dot"
                :class="{ active: index === currentSlide }" @click="goToSlide(index)" :aria-label="`Slide ${index + 1}`" />
        </div>
    </section>
</template>

<style scoped>
.hero-slider {
    width: 100%;
    position: relative;
}

.slider-container {
    overflow: hidden;
    border-radius: 30px;
    position: relative;
}

.slides-track {
    display: flex;
}

.slide {
    min-width: 100%;
}

.slide-image {
    width: 100%;
    height: 650px;
    object-fit: cover;
    display: block;
    border-radius: 30px;
}

.slider-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 45px;
    height: 45px;
    border-radius: 50%;
    border: none;
    background: #fff;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.prev {
    left: 20px;
}

.next {
    right: 20px;
}

.slider-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 20px;
}

.dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    background: #d1d5db;
    cursor: pointer;
}

.dot.active {
    background: #42b883;
}

@media (max-width: 768px) {
    .slide-image {
        height: 380px;
        border-radius: 16px;
    }
    
    .slider-container {
        border-radius: 16px;
    }
}
</style>
