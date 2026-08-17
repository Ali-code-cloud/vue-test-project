<template>
  <div class="about-page">
    <div class="about-hero">
      <span class="badge">Who We Are</span>
      <h1>Your Trusted Home Maintenance Partner</h1>
      <p class="subtitle">
        Connecting millions of households with background-verified, expert technicians across Pakistan.
      </p>
    </div>

    <div class="stats-banner">
      <div class="stat-box">
        <h3>50,000+</h3>
        <p>Happy Customers</p>
      </div>
      <div class="stat-box">
        <h3>1,200+</h3>
        <p>Verified Professionals</p>
      </div>
      <div class="stat-box">
        <h3>4.9 ★</h3>
        <p>Average Service Rating</p>
      </div>
      <div class="stat-box">
        <h3>4 Cities</h3>
        <p>Lahore, KHI, ISL, RWP</p>
      </div>
    </div>

    <div class="about-grid">
      <div class="info-card">
        <div class="card-icon">🎯</div>
        <h3>Our Mission</h3>
        <p>To revolutionize home services in Pakistan by providing transparent pricing, instant technician booking, and 100% service guarantee.</p>
      </div>
      <div class="info-card">
        <div class="card-icon">👁️</div>
        <h3>Our Vision</h3>
        <p>To empower local skilled taskers with reliable income opportunities while giving homeowners total peace of mind for every repair job.</p>
      </div>
      <div class="info-card">
        <div class="card-icon">🛡️</div>
        <h3>Quality Assurance</h3>
        <p>Every technician undergoes strict background verification, technical aptitude testing, and customer etiquette training before onboard.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.about-page {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.about-hero {
  text-align: center;
  margin-bottom: 48px;
}

.badge {
  background: #EFF6FF;
  color: #1A56DB;
  font-weight: 700;
  font-size: 14px;
  padding: 6px 16px;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 16px;
}

.about-hero h1 {
  font-size: 2.8rem;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 16px;
}

.subtitle {
  font-size: 1.15rem;
  color: #64748B;
  max-width: 680px;
  margin: 0 auto;
  line-height: 1.6;
}

.stats-banner {
  background: linear-gradient(135deg, #1A56DB 0%, #1E40AF 100%);
  color: white;
  border-radius: 20px;
  padding: 40px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 30px;
  text-align: center;
  margin-bottom: 48px;
  box-shadow: 0 12px 32px rgba(26, 86, 219, 0.2);
}

.stat-box h3 {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 6px;
}

.stat-box p {
  color: #DBEAFE;
  font-size: 14px;
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 28px;
}

.info-card {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s;
}

.info-card:hover {
  transform: translateY(-4px);
}

.card-icon {
  font-size: 36px;
  margin-bottom: 16px;
}

.info-card h3 {
  font-size: 20px;
  font-weight: 700;
  color: #0F172A;
  margin-bottom: 12px;
}

.info-card p {
  color: #475569;
  line-height: 1.6;
  font-size: 15px;
}

@media (max-width: 768px) {
  .about-hero h1 {
    font-size: 2rem;
  }

  .stats-banner {
    padding: 24px;
    gap: 20px;
  }

  .stat-box h3 {
    font-size: 1.8rem;
  }
}
</style>