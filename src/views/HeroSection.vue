<script setup lang="ts">
import { ref } from 'vue'
import technicianImg from '@/assets/technician_hero.png'

const searchQuery = ref('')

const handleSearch = () => {
    if (searchQuery.value.trim()) {
        console.log('Searching for:', searchQuery.value)
    }
}
</script>

<template>
    <section class="hero-section">
        <div class="hero-container">
            <!-- Left Side Content -->
            <div class="hero-content">
                <h1 class="hero-title">
                    Home<br />
                    Maintenance<br />
                    <span class="highlight">Made Easy!!</span>
                </h1>

                <p class="hero-description">
                    Connecting maintenance and repair taskers for quick, safe and affordable bookings
                </p>

                <div class="hero-buttons">
                    <router-link to="/services/category/4" class="btn-book-now">
                        Book now
                    </router-link>
                    <a href="tel:042111111242" class="btn-call-icon" aria-label="Call Tasker">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path
                                d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                        </svg>
                    </a>
                </div>

                <div class="search-bar">
                    <!-- <span class="search-icon"></span> -->
                    <img src="@/assets/search.svg" alt="Search" class="search-icon">
                    <input v-model="searchQuery" type="text" placeholder="Search" class="search-input"
                        @keyup.enter="handleSearch" />
                </div>
            </div>

            <!-- Right Side Image Frame -->
            <div class="hero-visual">
                <div class="arch-frame">
                    <img :src="technicianImg" alt="Technician" class="technician-image" />
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.hero-section {
    background: linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%);
    padding: 60px 24px 80px;
    overflow: hidden;
    position: relative;
}

.hero-container {
    max-width: 1240px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
}

.hero-content {
    flex: 1;
    max-width: 540px;
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    color: #1E3A8A;
    line-height: 1.1;
    margin-bottom: 20px;
    letter-spacing: -1px;
}

.hero-title .highlight {
    color: #1A56DB;
}

.hero-description {
    font-size: 1.1rem;
    color: #475569;
    line-height: 1.5;
    margin-bottom: 32px;
}

.hero-buttons {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 28px;
}

.btn-book-now {
    background: #1A56DB;
    color: white;
    border: none;
    padding: 12px 32px;
    border-radius: 28px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 14px rgba(26, 86, 219, 0.3);
}

.btn-book-now:hover {
    background: #1D4ED8;
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(26, 86, 219, 0.4);
}

.btn-call-icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #1A56DB;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    box-shadow: 0 4px 12px rgba(26, 86, 219, 0.25);
    transition: transform 0.2s, background 0.2s;
}

.btn-call-icon:hover {
    background: #1D4ED8;
    transform: scale(1.08);
}

.search-bar {
    display: flex;
    align-items: center;
    background: #ffffff;
    border-radius: 28px;
    padding: 10px 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    border: 1px solid #E2E8F0;
    max-width: 440px;
}

.search-icon {
    font-size: 16px;
    margin-right: 12px;
    opacity: 0.6;
}

.search-input {
    border: none;
    outline: none;
    width: 100%;
    font-size: 15px;
    color: #1E293B;
    background: transparent;
}

.search-input::placeholder {
    color: #94A3B8;
}

/* Right Visual Arch Frame */
.hero-visual {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.arch-frame {
    width: 440px;
    height: 480px;
    background: radial-gradient(circle at center, #FFFFFF 0%, #DBEAFE 100%);
    border-top-left-radius: 220px;
    border-top-right-radius: 220px;
    border-bottom-left-radius: 120px;
    border-bottom-right-radius: 120px;
    box-shadow: 0 16px 40px rgba(26, 86, 219, 0.12);
    overflow: hidden;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    border: 4px solid #ffffff;
}

.technician-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
}

/* Responsive adjustments */
@media (max-width: 960px) {
    .hero-container {
        flex-direction: column;
        text-align: center;
    }

    .hero-content {
        max-width: 100%;
    }

    .hero-title {
        font-size: 2.8rem;
    }

    .hero-buttons,
    .search-bar {
        justify-content: center;
        margin-left: auto;
        margin-right: auto;
    }

    .arch-frame {
        width: 320px;
        height: 360px;
    }
}

@media (max-width: 480px) {
    .hero-title {
        font-size: 2.2rem;
    }
}
</style>