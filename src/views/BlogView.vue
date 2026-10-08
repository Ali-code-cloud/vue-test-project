<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFetch } from '@/composables/useFetch'

interface BlogCategory {
  id: number | string
  name: string
  slug: string
  description?: string
  blogs_count?: number
}

interface BlogPost {
  id: number | string
  title: string
  title_jp?: string
  slug: string
  blog_category_id?: number | string
  author?: string
  status?: string
  image?: string
  image_alt_text?: string
  short_description?: string
  created_at?: string
  category?: BlogCategory
}

const router = useRouter()

const searchInput = ref('')
const selectedCategorySlug = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const totalBlogs = ref(0)

const defaultCategories: BlogCategory[] = [
  { id: 1, name: 'AC Services', slug: 'ac-services', blogs_count: 3 },
  { id: 2, name: 'Plumbing', slug: 'plumbing', blogs_count: 2 },
  { id: 3, name: 'Electrical', slug: 'electrical', blogs_count: 4 },
  { id: 4, name: 'Carpentry', slug: 'carpentry', blogs_count: 1 }
]

const defaultBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Top 10 AC Maintenance & Servicing Tips for Summer 2026',
    slug: 'top-10-ac-maintenance-tips-2026',
    author: 'Mr Home Service Team',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
    short_description: 'Prepare your air conditioner for peak performance with these easy expert maintenance tips.',
    created_at: '2026-09-30T00:00:00.000000Z',
    category: { id: 1, name: 'AC Services', slug: 'ac-services' }
  },
  {
    id: 2,
    title: 'Common Plumbing Emergencies & How to Handle Them',
    slug: 'common-plumbing-emergencies-guide',
    author: 'Plumbing Expert',
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&auto=format&fit=crop&q=80',
    short_description: 'Learn how to handle burst pipes, stubborn clogs, and low pressure before a plumber arrives.',
    created_at: '2026-09-25T00:00:00.000000Z',
    category: { id: 2, name: 'Plumbing', slug: 'plumbing' }
  },
  {
    id: 3,
    title: 'Electrical Safety Guide & Energy Saving Tips for Homeowners',
    slug: 'electrical-safety-energy-saving-guide',
    author: 'Master Electrician',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop&q=80',
    short_description: 'Essential advice to keep your home electrical system safe and energy-efficient.',
    created_at: '2026-09-20T00:00:00.000000Z',
    category: { id: 3, name: 'Electrical', slug: 'electrical' }
  }
]

const categories = ref<BlogCategory[]>([])
const blogPosts = ref<BlogPost[]>([])
const isCategoriesLoading = ref(true)

// Fetch Categories using /api/blogs/categories
const { execute: fetchCategoriesApi } = useFetch('/api/blogs/categories', {
  immediate: false,
  fallbackData: defaultCategories
})

const loadCategories = async () => {
  isCategoriesLoading.value = true
  try {
    const res = await fetchCategoriesApi()
    const rawData = res?.data || res || []
    if (Array.isArray(rawData) && rawData.length > 0) {
      categories.value = rawData
    } else {
      categories.value = defaultCategories
    }
  } catch (e) {
    categories.value = defaultCategories
  } finally {
    isCategoriesLoading.value = false
  }
}

// Fetch Published Blogs using /api/blogs
const isBlogsLoading = ref(true)

const loadBlogs = async () => {
  isBlogsLoading.value = true
  try {
    const queryParams = new URLSearchParams()
    queryParams.set('page', String(currentPage.value))
    queryParams.set('per_page', '9')
    if (searchInput.value.trim()) queryParams.set('search', searchInput.value.trim())
    if (selectedCategorySlug.value) queryParams.set('category', selectedCategorySlug.value)

    const url = `/api/blogs?${queryParams.toString()}`
    const { execute: fetchBlogsApi } = useFetch(url, { immediate: false })
    const res = await fetchBlogsApi()

    const rawRes = res?.data || res
    const blogList = rawRes?.data || (Array.isArray(rawRes) ? rawRes : [])

    if (Array.isArray(blogList) && blogList.length > 0) {
      blogPosts.value = blogList
      currentPage.value = rawRes?.current_page || 1
      totalPages.value = rawRes?.last_page || 1
      totalBlogs.value = rawRes?.total || blogList.length
    } else {
      if (!searchInput.value.trim() && !selectedCategorySlug.value) {
        blogPosts.value = defaultBlogPosts
      } else {
        blogPosts.value = []
      }
    }
  } catch (e) {
    blogPosts.value = defaultBlogPosts
  } finally {
    isBlogsLoading.value = false
  }
}

onMounted(() => {
  loadCategories()
  loadBlogs()
})

const handleCategorySelect = (slug: string) => {
  selectedCategorySlug.value = slug
  currentPage.value = 1
  loadBlogs()
}

const handleSearch = () => {
  currentPage.value = 1
  loadBlogs()
}

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadBlogs()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const openBlogDetail = (post: BlogPost) => {
  if (post.slug) {
    router.push(`/blog/${post.slug}`)
  }
}

const getImageUrl = (path?: string) => {
  if (!path) return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80'
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/')) return `http://127.0.0.1:8001${path}`
  return `http://127.0.0.1:8001/${path}`
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'Recent'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="blog-container">
    <!-- Blog Page Header Banner -->
    <div class="blog-header">
      <h1 class="page-title">Home Maintenance Blog</h1>
      <p class="page-subtitle">Expert tips, comprehensive guides, and insights to keep your home running efficiently.</p>
      
      <!-- Search Box Container -->
      <div class="blog-search-wrap">
        <div class="search-pill-box">
          <svg class="search-icon-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            v-model="searchInput" 
            placeholder="Search articles, guides, and tips..." 
            class="search-input" 
            @keyup.enter="handleSearch"
          />
          <button class="btn-search" @click="handleSearch">Search</button>
        </div>
      </div>
    </div>

    <!-- Category Filter Row Scroll Track -->
    <div class="category-tabs-container-box">
      <div class="category-tabs-scroll-track">
        <button 
          class="category-text-tab"
          :class="{ active: selectedCategorySlug === '' }"
          @click="handleCategorySelect('')"
        >
          <span class="tab-label">All Categories</span>
          <span v-if="selectedCategorySlug === ''" class="active-blue-bar"></span>
        </button>

        <button 
          v-for="cat in categories" 
          :key="cat.id" 
          class="category-text-tab"
          :class="{ active: selectedCategorySlug === cat.slug }"
          @click="handleCategorySelect(cat.slug)"
        >
          <span class="tab-label">
            {{ cat.name }}
            <small v-if="cat.blogs_count !== undefined" class="count-pill">({{ cat.blogs_count }})</small>
          </span>
          <span v-if="selectedCategorySlug === cat.slug" class="active-blue-bar"></span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isBlogsLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading blog posts...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="blogPosts.length === 0" class="empty-state">
      <h3>No Articles Found</h3>
      <p>We couldn't find any articles matching your search criteria.</p>
      <button class="btn-reset" @click="searchInput = ''; selectedCategorySlug = ''; loadBlogs();">
        Reset Filters
      </button>
    </div>

    <!-- Blog Posts Grid -->
    <div v-else class="blog-grid">
      <article 
        v-for="post in blogPosts" 
        :key="post.id" 
        class="blog-card"
        @click="openBlogDetail(post)"
      >
        <div class="card-image-box">
          <img :src="getImageUrl(post.image)" :alt="post.image_alt_text || post.title" class="card-img" />
          <span v-if="post.category?.name" class="blog-badge">{{ post.category.name }}</span>
        </div>

        <div class="card-body">
          <h2 class="post-title">{{ post.title }}</h2>
          <p class="post-excerpt">{{ post.short_description || 'Click to read full article details...' }}</p>
          
          <div class="post-meta">
            <span class="post-author">✍️ {{ post.author || 'Admin' }}</span>
            <span class="post-date">{{ formatDate(post.created_at) }}</span>
          </div>

          <button class="btn-read-more">
            Read Article
          </button>
        </div>
      </article>
    </div>

    <!-- Pagination Bar -->
    <div v-if="totalPages > 1" class="pagination-bar">
      <button 
        class="page-btn" 
        :disabled="currentPage === 1" 
        @click="changePage(currentPage - 1)"
      >
        Previous
      </button>

      <span class="page-indicator">Page {{ currentPage }} of {{ totalPages }}</span>

      <button 
        class="page-btn" 
        :disabled="currentPage === totalPages" 
        @click="changePage(currentPage + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<style scoped>
.blog-container {
  max-width: 1200px;
  margin: 32px auto 80px;
  padding: 0 20px;
}

.blog-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 38px;
  font-weight: 900;
  color: #0F172A;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 16px;
  color: #64748B;
  margin-bottom: 24px;
}

.blog-search-wrap {
  display: flex;
  justify-content: center;
}

.search-pill-box {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border: 1.5px solid #CBD5E1;
  border-radius: 40px;
  padding: 6px 6px 6px 18px;
  width: 100%;
  max-width: 540px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-pill-box:focus-within {
  border-color: #1A56DB;
  box-shadow: 0 6px 18px rgba(26, 86, 219, 0.12);
}

.search-icon-svg {
  color: #94A3B8;
  margin-right: 10px;
  flex-shrink: 0;
}

.search-input {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  font-size: 15px;
  color: #1E293B;
}

.btn-search {
  background: #1A56DB;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 30px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.btn-search:hover {
  background: #1D4ED8;
}

/* Category Tabs Container Box */
.category-tabs-container-box {
  background: #F4F6F8;
  border-radius: 16px;
  padding: 14px 20px;
  margin-bottom: 32px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.category-tabs-scroll-track {
  display: flex;
  align-items: center;
  gap: 28px;
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 2px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.category-tabs-scroll-track::-webkit-scrollbar {
  display: none;
}

.category-text-tab {
  background: transparent;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: #475569;
  padding: 8px 4px 10px;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

.category-text-tab:hover {
  color: #1A56DB;
}

.category-text-tab.active {
  color: #1A56DB;
  font-weight: 700;
}

.active-blue-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #1A56DB;
  border-radius: 2px;
}

.count-pill {
  font-size: 12px;
  opacity: 0.7;
}

/* Loading & Empty State */
.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748B;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 4px solid #CBD5E1;
  border-top-color: #1A56DB;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-reset {
  background: #EFF6FF;
  color: #1A56DB;
  border: 1.5px solid #BFDBFE;
  padding: 10px 24px;
  border-radius: 20px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 16px;
}

/* Blog Cards Grid */
.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 28px;
}

.blog-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.blog-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(26, 86, 219, 0.12);
  border-color: #BFDBFE;
}

.card-image-box {
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;
  background: #F8FAFC;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.blog-card:hover .card-img {
  transform: scale(1.04);
}

.blog-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  background: rgba(26, 86, 219, 0.9);
  color: #ffffff;
  font-weight: 700;
  font-size: 12px;
  padding: 4px 14px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.card-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.post-title {
  font-size: 19px;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 10px;
  line-height: 1.35;
}

.post-excerpt {
  font-size: 14px;
  color: #64748B;
  line-height: 1.55;
  margin-bottom: 20px;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #94A3B8;
  border-top: 1px solid #F1F5F9;
  padding-top: 14px;
  margin-bottom: 16px;
}

.btn-read-more {
  align-self: flex-start;
  background: transparent;
  color: #1A56DB;
  border: none;
  font-size: 14px;
  font-weight: 700;
  padding: 0;
  cursor: pointer;
}

.blog-card:hover .btn-read-more {
  text-decoration: underline;
}

/* Pagination Bar */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 48px;
}

.page-btn {
  background: #EFF6FF;
  color: #1A56DB;
  border: 1.5px solid #BFDBFE;
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #1A56DB;
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-indicator {
  font-size: 14px;
  font-weight: 600;
  color: #64748B;
}

@media (max-width: 600px) {
  .page-title {
    font-size: 28px;
  }
  .blog-grid {
    grid-template-columns: 1fr;
  }
}
</style>
