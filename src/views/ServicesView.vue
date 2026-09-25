<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFetch } from '@/composables/useFetch'

interface Category {
    id: number | string
    name: string
    image_url?: string
    image?: string
    description?: string
}

const router = useRouter()
const categories = ref<Category[]>([])

const defaultCategories = [
    { id: 1, name: 'AC Services', image_url: '/src/assets/ac.png' },
    { id: 2, name: 'Plumbing', image_url: '/src/assets/plumbing.png' },
    { id: 3, name: 'Electrical', image_url: '/src/assets/electrical.png' },
    { id: 4, name: 'Carpentry', image_url: '/src/assets/carpentry.png' },
    { id: 5, name: 'Cleaning', image_url: '/src/assets/cleaning.png' },
    { id: 6, name: 'Painting', image_url: '/src/assets/painting.png' }
]

const { isLoading, execute } = useFetch('/api/service-categories', {
    immediate: false,
    fallbackData: defaultCategories
})

onMounted(async () => {
    try {
        const res = await execute()
        const rawCats = res?.data || res || []
        if (Array.isArray(rawCats) && rawCats.length > 0) {
            categories.value = rawCats
        } else {
            categories.value = defaultCategories
        }
    } catch (e) {
        categories.value = defaultCategories
    }
})

const openCategoryServices = (category: Category) => {
    router.push(`/services/category/${category.id}`)
}
</script>

<template>
    <section class="services-page-section">
        <div class="services-header">
            <h2 class="services-title">Our Service Categories</h2>
            <p class="services-subtitle">Select a category to view specialized services and rates</p>
        </div>

        <div v-if="isLoading" class="loading-wrap">
            <div class="spinner"></div>
            <p>Loading service categories...</p>
        </div>

        <div v-else class="categories-grid">
            <div 
                v-for="category in categories" 
                :key="category.id" 
                class="category-card"
                @click="openCategoryServices(category)"
            >
                <div class="category-icon-box">
                    <img :src="category.image_url || category.image || '/src/assets/ac.png'" :alt="category.name" class="category-img" />
                </div>
                <h3 class="category-name">{{ category.name }}</h3>
            </div>
        </div>
    </section>
</template>

<style scoped>
.services-page-section {
    max-width: 1200px;
    margin: 40px auto;
    padding: 0 20px;
}

.services-header {
    text-align: center;
    margin-bottom: 40px;
}

.services-title {
    font-size: 2.4rem;
    font-weight: 800;
    color: #0F172A;
    margin-bottom: 8px;
}

.services-subtitle {
    font-size: 1rem;
    color: #64748B;
}

.loading-wrap {
    text-align: center;
    padding: 60px;
    color: #64748B;
}

.spinner {
    width: 36px;
    height: 36px;
    border: 4px solid #CBD5E1;
    border-top-color: #1A56DB;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 12px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 24px;
}

.category-card {
    background: #ffffff;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.category-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(26, 86, 219, 0.12);
    border-color: #1A56DB;
}

.category-icon-box {
    width: 80px;
    height: 80px;
    border-radius: 16px;
    background: #F8FAFC;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    overflow: hidden;
}

.category-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.category-name {
    font-size: 18px;
    font-weight: 700;
    color: #0F172A;
    margin-bottom: 6px;
}

@media (max-width: 768px) {
    .services-page-section {
        margin: 16px auto 30px;
        padding: 0 12px;
    }

    .services-header {
        margin-bottom: 20px;
    }

    .services-title {
        font-size: 2rem;
        font-weight: 900;
        letter-spacing: -0.5px;
    }

    .services-subtitle {
        display: none;
    }

    .categories-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 12px;
    }

    .category-card {
        padding: 16px 12px;
        border-radius: 12px;
    }

    .category-icon-box {
        width: 60px;
        height: 60px;
        border-radius: 12px;
    }

    .category-name {
        font-size: 15px;
    }
}
</style>

