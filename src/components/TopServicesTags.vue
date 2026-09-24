<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/composables/useApi'

interface Category {
    id: number | string
    name: string
    is_popular?: number | boolean
    popular?: number | boolean
    slug?: string
}

const router = useRouter()
const popularCategories = ref<Category[]>([])
const isLoading = ref(true)

const defaultPopularTags = [
    { id: 1, name: 'AC Cleaning & Repairing', is_popular: 1 },
    { id: 2, name: 'Automatic Washing Machine Repair', is_popular: 1 },
    { id: 3, name: 'Plumbing & Muslim Shower Replacement', is_popular: 1 },
    { id: 4, name: 'Electrician & Radiator Fan Services', is_popular: 1 },
    { id: 5, name: 'Refrigerator & Geyser Maintenance', is_popular: 1 },
    { id: 6, name: 'Pest Control & Fumigation Services', is_popular: 1 }
]

const fetchPopularCategories = async () => {
    try {
        const { data } = await api.get('/api/service-categories')
        const rawCats = data?.data || data || []
        if (Array.isArray(rawCats) && rawCats.length > 0) {
            const popularOnly = rawCats.filter((c: any) => c.is_popular == 1 || c.popular == 1 || c.is_popular === true)
            popularCategories.value = popularOnly.length > 0 ? popularOnly : rawCats
            return
        }
    } catch (e) {
        // Fallback
    }

    try {
        const res = await fetch('http://mrhomeservices.test:8001/api/service-categories')
        const resData = await res.json()
        const rawCats = resData?.data || resData || []
        if (Array.isArray(rawCats) && rawCats.length > 0) {
            const popularOnly = rawCats.filter((c: any) => c.is_popular == 1 || c.popular == 1 || c.is_popular === true)
            popularCategories.value = popularOnly.length > 0 ? popularOnly : rawCats
            return
        }
    } catch (err) {
        popularCategories.value = defaultPopularTags
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchPopularCategories()
})

const navigateToCategory = (cat: Category) => {
    if (cat.id) {
        router.push(`/services/category/${cat.id}`)
    } else {
        router.push('/services')
    }
}
</script>

<template>
    <section class="top-services-section">
        <div class="top-services-card">
            <h2 class="section-title">Popular Categories & Top Services</h2>
            <div v-if="isLoading" class="loading-state">
                <span>Loading popular categories...</span>
            </div>
            <div v-else class="tags-container">
                <button 
                    v-for="cat in popularCategories" 
                    :key="cat.id" 
                    class="service-tag"
                    @click="navigateToCategory(cat)"
                >
                    <span class="fire-icon">🔥</span> {{ cat.name }}
                </button>
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
    border-radius: 16px;
    padding: 32px;
    border: 1px solid #E2E8F0;
}

.section-title {
    font-size: 1.8rem;
    font-weight: 800;
    color: #0F172A;
    margin-bottom: 20px;
}

.loading-state {
    color: #64748B;
    font-size: 14px;
}

.tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.service-tag {
    background: #ffffff;
    border: 1.5px solid #CBD5E1;
    border-radius: 20px;
    padding: 8px 18px;
    font-size: 14px;
    color: #334155;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.fire-icon {
    font-size: 13px;
}

.service-tag:hover {
    border-color: #1A56DB;
    color: #1A56DB;
    background: #EFF6FF;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(26, 86, 219, 0.1);
}
</style>
