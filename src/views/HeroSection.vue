<script setup lang="ts">
import HeroSlider from '@/components/HeroSlider.vue'
import { ref } from 'vue'

const searchQuery = ref('')

const handleSearch = () => {
    if (searchQuery.value.trim()) {
        console.log('Searching for:', searchQuery.value)
        // Navigate to search results or filter services
    }
}

const handleBookNow = () => {
    console.log('Book Now clicked')
    // Navigate to booking page or open booking modal
}
import sliderImage from '@/assets/hero-slider/1.jpg'
import sliderImage1 from '@/assets/hero-slider/2.jpg'

const slides = [
    {
        id: 1,
        image: sliderImage
    },
    {
        id: 2,
        image: sliderImage1
    },
    {
        id: 2,
        image: sliderImage1
    }
]
</script>

<template>
    <section class="hero-section">
        <div class="hero-container">

            <!-- Left -->
            <div class="hero-content">
                <h1 class="hero-title">
                    Home Maintenance <br>
                    <span class="highlight">Made Easy!!</span>
                </h1>

                <p class="hero-description">
                    Connecting customers and technicians for quick,
                    safe, and affordable bookings.
                </p>

                <div class="hero-actions">
                    <button class="btn-book" @click="handleBookNow">
                        Book Now
                    </button>

                    <div class="search-box">
                        <span class="search-icon">🔍</span>

                        <input v-model="searchQuery" class="search-input" placeholder="Search services...">

                        <button class="search-btn" @click="handleSearch">
                            Search
                        </button>
                    </div>
                </div>
            </div>

            <!-- Right -->
            <div class="hero-image">
                <HeroSlider :slides="slides" />
            </div>

        </div>
    </section>
</template>

<style scoped>
/* ===== Hero Section ===== */
.hero-section {
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%);
    padding: 80px 20px 100px;
    padding-left: 0px;
    position: relative;
    overflow: hidden;
}

/* Decorative background elements */
.hero-section::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(66, 184, 131, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
}

.hero-section::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(66, 184, 131, 0.08) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
}

.hero-container {
    max-width: 1400px;
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 60px;
}

/* ===== Hero Content ===== */
.hero-content {
    width: 45%;
    text-align: left;
}

.hero-image {
    width: 55%;
}

.hero-image :deep(.hero-slider) {
    width: 100%;
}

@media(max-width:992px) {

    .hero-container {
        flex-direction: column-reverse;
    }

    .hero-content,
    .hero-image {
        width: 100%;
        text-align: center;
    }

}

/* ===== Hero Title ===== */
.hero-title {
    font-size: 2.8rem;
    font-weight: 800;
    color: #1a202c;
    line-height: 1.15;
    margin-bottom: 20px;
    letter-spacing: -0.02em;
}

.hero-title .highlight {
    color: #42b883;
    position: relative;
    display: inline-block;
}

/* Underline effect for highlight */
.hero-title .highlight::after {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 0;
    width: 100%;
    height: 10px;
    background: rgba(66, 184, 131, 0.2);
    border-radius: 4px;
    z-index: -1;
}

/* ===== Hero Description ===== */
.hero-description {
    font-size: 1.15rem;
    color: #4a5568;
    max-width: 600px;
    margin: 0 auto 32px;
    line-height: 1.7;
}

/* ===== Hero Actions ===== */
.hero-actions {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    max-width: 700px;
    margin: 0 auto;
}

@media (min-width: 640px) {
    .hero-actions {
        flex-direction: row;
        gap: 20px;
        justify-content: center;
    }
}

/* ===== Book Now Button ===== */
.btn-book {
    background: linear-gradient(135deg, #42b883 0%, #3aa876 100%);
    color: white;
    border: none;
    padding: 14px 48px;
    font-size: 18px;
    font-weight: 600;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 16px rgba(66, 184, 131, 0.3);
    white-space: nowrap;
    min-width: 160px;
    letter-spacing: 0.5px;
}

.btn-book:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(66, 184, 131, 0.4);
}

.btn-book:active {
    transform: translateY(-1px);
}

/* ===== Search Box ===== */
.search-box {
    display: flex;
    align-items: center;
    background: white;
    border-radius: 50px;
    padding: 4px 4px 4px 20px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
    flex: 1;
    min-width: 200px;
    max-width: 400px;
    width: 100%;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.search-box:focus-within {
    box-shadow: 0 4px 24px rgba(66, 184, 131, 0.15);
    border-color: #42b883;
    transform: scale(1.02);
}

.search-icon {
    font-size: 18px;
    color: #a0aec0;
    margin-right: 10px;
    flex-shrink: 0;
}

.search-input {
    border: none;
    outline: none;
    padding: 10px 0;
    font-size: 15px;
    color: #2d3748;
    flex: 1;
    background: transparent;
    font-family: inherit;
    min-width: 0;
}

.search-input::placeholder {
    color: #a0aec0;
}

.search-btn {
    padding: 10px 24px;
    background: #42b883;
    color: white;
    border: none;
    border-radius: 50px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.search-btn:hover {
    background: #3aa876;
    transform: scale(1.02);
}

/* ===== Responsive Design ===== */

/* Tablet */
@media (max-width: 768px) {
    .hero-section {
        padding: 60px 20px 80px;
    }

    .hero-title {
        font-size: 2.4rem;
    }

    .hero-description {
        font-size: 1.05rem;
        padding: 0 16px;
    }

    .hero-actions {
        flex-direction: column;
        max-width: 400px;
    }

    .btn-book {
        width: 100%;
        text-align: center;
    }

    .search-box {
        max-width: 100%;
    }
}

/* Mobile */
@media (max-width: 480px) {
    .hero-section {
        padding: 40px 16px 60px;
    }

    .hero-title {
        font-size: 1.8rem;
    }

    .hero-title .highlight::after {
        height: 6px;
        bottom: 2px;
    }

    .hero-description {
        font-size: 0.95rem;
        padding: 0;
        margin-bottom: 24px;
    }

    .btn-book {
        padding: 12px 32px;
        font-size: 16px;
        min-width: 140px;
    }

    .search-box {
        padding: 3px 3px 3px 16px;
    }

    .search-input {
        font-size: 14px;
        padding: 8px 0;
    }

    .search-btn {
        padding: 8px 16px;
        font-size: 13px;
    }

    .search-icon {
        font-size: 16px;
        margin-right: 8px;
    }
}

/* Small Mobile */
@media (max-width: 360px) {
    .hero-title {
        font-size: 1.5rem;
    }

    .search-box {
        flex-wrap: wrap;
        border-radius: 12px;
        padding: 12px;
        gap: 8px;
    }

    .search-icon {
        display: none;
    }

    .search-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
    }

    .search-btn {
        width: 100%;
        justify-content: center;
    }
}
</style>