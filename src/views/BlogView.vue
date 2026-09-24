<script setup lang="ts">
import { ref } from 'vue'

const blogPosts = ref([
  {
    id: 1,
    title: 'Top 10 Tips for AC Maintenance Before Summer',
    excerpt: 'Prepare your air conditioner for peak performance with these easy expert maintenance tips.',
    date: 'August 15, 2026',
    author: 'Mr Home Service Team',
    category: 'AC Repair'
  },
  {
    id: 2,
    title: 'Common Plumbing Emergencies & How to Handle Them',
    excerpt: 'Learn how to handle burst pipes, stubborn clogs, and low pressure before a plumber arrives.',
    date: 'August 10, 2026',
    author: 'Plumbing Expert',
    category: 'Plumbing'
  },
  {
    id: 3,
    title: 'Electrical Safety Guide for Homeowners',
    excerpt: 'Essential advice to keep your home electrical system safe and energy-efficient.',
    date: 'August 02, 2026',
    author: 'Master Electrician',
    category: 'Electrical'
  }
])
</script>

<template>
  <div class="blog-container">
    <div class="blog-header">
      <h1 class="page-title">Home Maintenance Blog</h1>
      <p class="page-subtitle">Expert tips, guides, and insights to keep your home running smoothly.</p>
    </div>

    <div class="blog-grid">
      <article v-for="post in blogPosts" :key="post.id" class="blog-card">
        <div class="blog-badge">{{ post.category }}</div>
        <h2 class="post-title">{{ post.title }}</h2>
        <p class="post-excerpt">{{ post.excerpt }}</p>
        <div class="post-meta">
          <span class="post-author">{{ post.author }}</span>
          <span class="post-date">{{ post.date }}</span>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.blog-container {
  max-width: 1200px;
  margin: 40px auto 80px;
  padding: 0 24px;
}

.blog-header {
  text-align: center;
  margin-bottom: 48px;
}

.page-title {
  font-size: 36px;
  font-weight: 800;
  color: #1E293B;
  margin-bottom: 12px;
}

.page-subtitle {
  font-size: 16px;
  color: #64748B;
}

.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 28px;
}

.blog-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.blog-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.blog-badge {
  display: inline-block;
  align-self: flex-start;
  background: #EFF6FF;
  color: #1A56DB;
  font-weight: 600;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.post-title {
  font-size: 20px;
  font-weight: 700;
  color: #1E293B;
  margin-bottom: 12px;
  line-height: 1.35;
}

.post-excerpt {
  font-size: 14px;
  color: #64748B;
  line-height: 1.5;
  margin-bottom: 24px;
  flex-grow: 1;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #94A3B8;
  border-top: 1px solid #F1F5F9;
  padding-top: 16px;
}
</style>
