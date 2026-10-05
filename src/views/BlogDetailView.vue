<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFetch } from '@/composables/useFetch'

interface FAQ {
  question: string
  answer: string
}

interface CTAWidget {
  make?: string
  link?: string
}

interface BlogCategory {
  id: number | string
  name: string
  slug: string
}

interface BlogDetail {
  id: number | string
  title: string
  title_jp?: string
  slug: string
  author?: string
  status?: string
  image?: string
  image_alt_text?: string
  short_description?: string
  description?: string
  meta_title?: string
  meta_tags?: string
  meta_description?: string
  faqs?: FAQ[]
  cta_widgets?: CTAWidget[]
  created_at?: string
  category?: BlogCategory
}

const route = useRoute()
const router = useRouter()

const slug = computed(() => String(route.params.slug || ''))
const activeFaqIndex = ref<number | null>(null)

const fallbackBlog: BlogDetail = {
  id: 1,
  title: 'Top 10 AC Maintenance & Servicing Tips for Summer 2026',
  slug: 'top-10-ac-maintenance-tips-2026',
  author: 'Mr Home Service Team',
  status: 'published',
  image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&auto=format&fit=crop&q=80',
  image_alt_text: 'AC Repair Technician',
  short_description: 'Prepare your air conditioner for peak performance with these easy expert maintenance tips.',
  description: `
    <p>Air conditioning units require regular upkeep to ensure efficient cooling and long life. Without proper maintenance, an AC unit can lose about 5% of its original efficiency every year it goes without service.</p>
    <h3>1. Clean or Replace the Air Filter</h3>
    <p>The most important maintenance task that will ensure the efficiency of your air conditioner is to routinely replace or clean its filters. Clogged, dirty filters block normal airflow and reduce a system's efficiency significantly.</p>
    <h3>2. Inspect & Clean the Condenser Coils</h3>
    <p>The air conditioner's condenser coil collects dirt over its months and years of service. Dirt reduces airflow and insulates the coil, reducing its ability to absorb heat.</p>
    <h3>3. Check the Refrigerant Levels</h3>
    <p>If your air conditioner is low on refrigerant, either it was undercharged at installation or it leaks. If it leaks, simply adding refrigerant is not a solution. A trained technician should fix any leak, test the repair, and then charge the system with the correct amount of refrigerant.</p>
  `,
  meta_title: 'Top AC Maintenance Tips 2026',
  faqs: [
    {
      question: 'How often should I service my AC?',
      answer: 'We recommend servicing your AC at least twice a year—once before summer and once before winter if it has heating capabilities.'
    },
    {
      question: 'What happens if I skip AC servicing?',
      answer: 'Skipping service reduces cooling efficiency, increases electricity bills, and can lead to expensive compressor breakdowns.'
    }
  ],
  created_at: '2026-09-30T00:00:00.000000Z',
  category: {
    id: 1,
    name: 'AC Services',
    slug: 'ac-services'
  }
}

const blog = ref<BlogDetail | null>(null)

const { isLoading, execute } = useFetch(`/api/blogs/${slug.value}`, {
  immediate: false,
  fallbackData: fallbackBlog
})

onMounted(async () => {
  if (!slug.value) return
  try {
    const res = await execute()
    const rawData = res?.data || res
    if (rawData && rawData.title) {
      blog.value = rawData
    } else {
      blog.value = fallbackBlog
    }
  } catch (e) {
    blog.value = fallbackBlog
  }
})

const getImageUrl = (path?: string) => {
  if (!path) return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&auto=format&fit=crop&q=80'
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/')) return `http://127.0.0.1:8001${path}`
  return `http://127.0.0.1:8001/${path}`
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'Recently Published'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const toggleFaq = (index: number) => {
  activeFaqIndex.value = activeFaqIndex.value === index ? null : index
}

const goBack = () => {
  router.push('/blog')
}
</script>

<template>
  <div class="blog-detail-page">
    <div class="blog-detail-container">
      <!-- Back Navigation Pill Button -->
      <div class="top-nav-bar">
        <button class="btn-back" @click="goBack">
          ← Back to Blogs
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-wrap">
        <div class="spinner"></div>
        <p>Loading blog post...</p>
      </div>

      <!-- Blog Post Content -->
      <article v-else-if="blog" class="blog-article">
        <!-- Category & Meta Header -->
        <div class="article-header">
          <span v-if="blog.category?.name" class="category-badge">
            {{ blog.category.name }}
          </span>
          <h1 class="article-title">{{ blog.title }}</h1>
          <div class="article-meta">
            <span class="meta-item">✍️ {{ blog.author || 'Mr Home Service Team' }}</span>
            <span class="meta-dot">•</span>
            <span class="meta-item">🗓️ {{ formatDate(blog.created_at) }}</span>
          </div>
        </div>

        <!-- Featured Hero Image -->
        <div class="featured-image-box">
          <img 
            :src="getImageUrl(blog.image)" 
            :alt="blog.image_alt_text || blog.title" 
            class="featured-img" 
          />
        </div>

        <!-- Short Description -->
        <div v-if="blog.short_description" class="short-desc-callout">
          <p>{{ blog.short_description }}</p>
        </div>

        <!-- HTML Main Content -->
        <div class="article-body" v-html="blog.description"></div>

        <!-- FAQs Accordion Section -->
        <div v-if="blog.faqs && blog.faqs.length > 0" class="faqs-section">
          <h3 class="section-heading">Frequently Asked Questions</h3>
          <div class="faqs-accordion">
            <div 
              v-for="(faq, idx) in blog.faqs" 
              :key="idx" 
              class="faq-item"
              :class="{ open: activeFaqIndex === idx }"
            >
              <button class="faq-question-btn" @click="toggleFaq(idx)">
                <span>{{ faq.question }}</span>
                <span class="faq-chevron">{{ activeFaqIndex === idx ? '−' : '+' }}</span>
              </button>
              <div v-if="activeFaqIndex === idx" class="faq-answer">
                <p>{{ faq.answer }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA Widgets Section -->
        <div v-if="blog.cta_widgets && blog.cta_widgets.length > 0" class="cta-section">
          <div v-for="(cta, i) in blog.cta_widgets" :key="i" class="cta-card">
            <h4>Need Help with {{ cta.make || 'this Service' }}?</h4>
            <a :href="cta.link || '/services'" class="btn-cta">Explore {{ cta.make || 'Services' }} ➔</a>
          </div>
        </div>
      </article>

      <!-- Not Found State -->
      <div v-else class="empty-wrap">
        <h2>Blog Post Not Found</h2>
        <p>The post you are looking for might have been moved or deleted.</p>
        <button class="btn-back" @click="goBack">Return to Blogs</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blog-detail-page {
  max-width: 1000px;
  margin: 32px auto 80px;
  padding: 0 20px;
}

.top-nav-bar {
  margin-bottom: 24px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #EFF6FF;
  color: #1D4ED8;
  border: 1.5px solid #BFDBFE;
  border-radius: 30px;
  padding: 9px 22px;
  font-weight: 700;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(29, 78, 216, 0.08);
}

.btn-back:hover {
  background: #1D4ED8;
  color: #ffffff;
  border-color: #1D4ED8;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(29, 78, 216, 0.25);
}

.loading-wrap, .empty-wrap {
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

.category-badge {
  display: inline-block;
  background: #EFF6FF;
  color: #1A56DB;
  font-size: 13px;
  font-weight: 700;
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.article-title {
  font-size: 36px;
  font-weight: 900;
  color: #0F172A;
  line-height: 1.25;
  margin-bottom: 16px;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #64748B;
  margin-bottom: 28px;
}

.meta-dot {
  color: #CBD5E1;
}

.featured-image-box {
  width: 100%;
  max-height: 480px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.featured-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.short-desc-callout {
  background: #F8FAFC;
  border-left: 4px solid #1A56DB;
  border-radius: 0 12px 12px 0;
  padding: 18px 24px;
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  line-height: 1.6;
  margin-bottom: 32px;
}

.article-body {
  font-size: 16px;
  color: #334155;
  line-height: 1.8;
  margin-bottom: 48px;
}

.article-body :deep(h2),
.article-body :deep(h3) {
  font-size: 22px;
  font-weight: 800;
  color: #0F172A;
  margin: 32px 0 12px;
}

.article-body :deep(p) {
  margin-bottom: 16px;
}

.faqs-section {
  background: #F8FAFC;
  border-radius: 20px;
  padding: 32px;
  border: 1px solid #E2E8F0;
  margin-bottom: 40px;
}

.section-heading {
  font-size: 22px;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 20px;
}

.faqs-accordion {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-item {
  background: white;
  border-radius: 12px;
  border: 1px solid #CBD5E1;
  overflow: hidden;
  transition: border-color 0.2s;
}

.faq-item.open {
  border-color: #1A56DB;
}

.faq-question-btn {
  width: 100%;
  padding: 16px 20px;
  background: transparent;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  color: #0F172A;
  cursor: pointer;
  text-align: left;
}

.faq-chevron {
  font-size: 20px;
  font-weight: bold;
  color: #1A56DB;
}

.faq-answer {
  padding: 0 20px 16px;
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
}

.cta-section {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 32px;
}

.cta-card {
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
}

.cta-card h4 {
  font-size: 17px;
  font-weight: 700;
  color: #1E40AF;
  margin-bottom: 16px;
}

.btn-cta {
  display: inline-block;
  background: #1A56DB;
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-cta:hover {
  background: #1D4ED8;
}

@media (max-width: 600px) {
  .article-title {
    font-size: 26px;
  }
  .featured-image-box {
    max-height: 260px;
  }
  .faqs-section {
    padding: 20px 16px;
  }
}
</style>
