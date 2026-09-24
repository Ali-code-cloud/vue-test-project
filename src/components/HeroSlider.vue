<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Slide {
    id: number
    image: string
}

const props = defineProps<{
    slides: Slide[]
    autoPlay?: boolean
    interval?: number
}>()

const currentSlide = ref(0)
const transitioning = ref(false)
const isPaused = ref(false)

const total = computed(() => props.slides.length)

const trackStyle = computed(() => ({
    transform: `translateX(-${currentSlide.value * 100}%)`,
    transition: transitioning.value ? 'transform .5s ease' : 'none'
}))

const nextSlide = (force = false) => {
    if (!total.value) return

    if (isPaused.value && !force) return

    transitioning.value = true

    currentSlide.value = (currentSlide.value + 1) % total.value

    setTimeout(() => {
        transitioning.value = false
    }, 500)
}

const prevSlide = () => {
    if (!total.value) return

    transitioning.value = true

    currentSlide.value =
        (currentSlide.value - 1 + total.value) % total.value

    setTimeout(() => {
        transitioning.value = false
    }, 500)
}

const goToSlide = (index: number) => {
    if (!total.value || index === currentSlide.value) return

    transitioning.value = true
    currentSlide.value = index

    setTimeout(() => {
        transitioning.value = false
    }, 500)
}

let timer: number | null = null

const startAutoSwitch = () => {
    if (props.autoPlay === false || total.value <= 1 || timer) return

    timer = window.setInterval(() => {
        nextSlide()
    }, props.interval ?? 4000)
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
    <section class="hero-slider auto-switch-slider" @mouseenter="isPaused = true" @mouseleave="isPaused = false">
        <div class="slider-container">

            <div class="slides-track" :style="trackStyle">
                <div v-for="slide in slides" :key="slide.id" class="slide">
                    <img :src="slide.image" class="slide-image" alt="Hero Slide" />
                </div>
            </div>

            <button v-if="total > 1" class="slider-arrow prev" @click="prevSlide" aria-label="Previous slide"
                type="button">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>

            <button v-if="total > 1" class="slider-arrow next" @click="nextSlide(true)" aria-label="Next slide"
                type="button">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>

            <div v-if="total > 1" class="slider-dots">
                <button v-for="(slide, index) in slides" :key="slide.id" type="button" class="dot"
                    :class="{ active: index === currentSlide }" @click="goToSlide(index)"
                    :aria-label="`Slide ${index + 1}`"></button>
            </div>

        </div>
    </section>
</template>

<style scoped>
.hero-slider {
    width: 100%;
    height: 100%;
    position: relative;
}

.slider-container {
    width: 100%;
    height: 100%;
    min-height: 480px;
    position: relative;
    overflow: hidden;
}

.slides-track {
    display: flex;
    width: 100%;
    height: 100%;
}

.slide {
    min-width: 100%;
    width: 100%;
    height: 100%;
    position: relative;
}

.slide-image {
    width: 100%;
    height: 100%;
    min-height: 480px;
    object-fit: cover;
    object-position: center right;
    display: block;
}

.slider-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);

    width: 42px;
    height: 42px;

    border-radius: 50%;
    border: none;

    background: rgba(255, 255, 255, 0.9);
    color: #1A56DB;

    display: flex;
    align-items: center;
    justify-content: center;

    cursor: pointer;

    opacity: 0;
    visibility: hidden;

    transition:
        opacity 0.2s ease,
        visibility 0.2s ease,
        transform 0.2s ease,
        background 0.2s ease;

    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);

    z-index: 5;
}

.slider-container:hover .slider-arrow {
    opacity: 1;
    visibility: visible;
}

.slider-arrow:hover {
    background: #ffffff;
}

.prev {
    left: 20px;
}

.next {
    right: 20px;
}

.slider-dots {
    position: absolute;
    right: 26px;
    bottom: 26px;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 9px;

    z-index: 10;
}

.dot {
    width: 9px;
    height: 9px;

    padding: 0;
    border: none;
    border-radius: 50%;

    background: rgba(255, 255, 255, 0.65);

    cursor: pointer;

    transition:
        background 0.2s ease,
        transform 0.2s ease;
}

.dot:hover {
    transform: scale(1.15);
}

.dot.active {
    background: #1A56DB;
}

@media (max-width: 960px) {
    .slider-container {
        min-height: 320px;
    }

    .slide-image {
        min-height: 320px;
    }

    .slider-arrow {
        opacity: 1;
        visibility: visible;
        width: 38px;
        height: 38px;
    }

    .prev {
        left: 14px;
    }

    .next {
        right: 14px;
    }

    .slider-dots {
        right: 18px;
        bottom: 18px;
    }
}

@media (max-width: 600px) {
    .slider-container {
        min-height: 240px;
    }

    .slide-image {
        min-height: 240px;
    }

    .slider-arrow {
        width: 34px;
        height: 34px;
    }

    .slider-arrow svg {
        width: 17px;
        height: 17px;
    }

    .prev {
        left: 10px;
    }

    .next {
        right: 10px;
    }

    .slider-dots {
        right: 14px;
        bottom: 14px;
        gap: 7px;
    }

    .dot {
        width: 7px;
        height: 7px;
    }
}
</style>