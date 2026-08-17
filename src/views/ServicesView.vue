<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useService } from '@/composables/useService'

const router = useRouter()
const categories = ref<any[]>([])
const isLoading = ref(true)
const service = useService()

onMounted(async () => {
    try {
        categories.value = await service.getCategories()
        isLoading.value = false
    } catch (e) {
        console.log('Failed to load categories:', e)
        isLoading.value = false
    }
})

const openCategoryServices = (category: any) => {
    router.push(`/services/category/${category.id}`)
}
</script>

<template>
    <section class="services-page-section">
        <div class="services-header">
            <h2 class="services-title">Our Service Categories</h2>
            <p class="services-subtitle">Select a category to view specialized services, rates, and technician details
            </p>
        </div>

        <div v-if="isLoading" class="loading-wrap">
            <div class="spinner"></div>
            <p>Loading service categories...</p>
        </div>

        <div v-else class="categories-grid">
            <div v-for="category in categories" :key="category.id" class="category-card"
                @click="openCategoryServices(category)">
                <div class="category-icon-box">
                    <img :src="category?.image_url" :alt="category?.name" class="category-img" />
                </div>
                <h3 class="category-name">{{ category?.name }}</h3>
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

.badge-tag {
    background: #EFF6FF;
    color: #1A56DB;
    font-size: 13px;
    font-weight: 700;
    padding: 4px 14px;
    border-radius: 20px;
    display: inline-block;
    margin-bottom: 12px;
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
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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

.category-desc {
    font-size: 13px;
    color: #64748B;
    line-height: 1.4;
    margin-bottom: 16px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.view-services-link {
    font-size: 14px;
    font-weight: 700;
    color: #1A56DB;
    margin-top: auto;
}

@media (max-width: 600px) {
    .categories-grid {
        grid-template-columns: 1fr;
    }
}
</style>
