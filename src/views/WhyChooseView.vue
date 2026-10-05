<template>
  <div class="why-page">
    <!-- Hero -->
    <section class="why-hero">
      <span class="why-badge">Discover the difference</span>
      <h1 class="why-title">Why Choose <span class="why-title-accent">Mr Home Services</span>?</h1>
      <p class="why-subtitle">
        We are making home maintenance simple by combining verified technicians, upfront pricing,
        and real convenience under a single trusted platform.
      </p>
    </section>

    <!-- Reasons (overlap the hero) -->
    <section class="reasons">
      <div v-for="r in reasons" :key="r.key" class="reason-card">
        <span class="reason-icon">
          <svg v-if="r.key === 'verified'" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
          <svg v-else-if="r.key === 'ontime'" viewBox="0 0 24 24" width="24" height="24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <svg v-else-if="r.key === 'expert'" viewBox="0 0 24 24" width="24" height="24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path
              d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 10v12" />
            <path
              d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
          </svg>
        </span>
        <h3 class="reason-title">{{ r.title }}</h3>
        <p class="reason-text">{{ r.text }}</p>
      </div>
    </section>

    <!-- Story -->
    <section class="story">
      <div class="story-content">
        <span class="eyebrow"><span class="eyebrow-line"></span>Our story &amp; focus</span>
        <h2 class="section-title">Empowering Homes, Training Communities</h2>
        <p class="story-text">
          At Mr Home Services, we believe home maintenance should be a source of comfort, not stress. We started
          with a clear, two-sided goal: give homes and offices vetted in-house experts, and create steady work
          by training and onboarding skilled local technicians.
        </p>
        <p class="story-text">
          We handle the coordination, scheduling and service guarantee so you can enjoy your space. From urgent
          plumbing to appliance repair, we are committed to good craftsmanship and customer care.
        </p>
        <div class="story-actions">
          <router-link to="/services" class="btn-primary">
            Book a Service
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </router-link>
          <router-link to="/contact" class="btn-outline">Contact Team</router-link>
        </div>
      </div>

      <div class="seal-card">
        <span class="seal-icon">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </span>
        <h3 class="seal-title">Our Quality Seal</h3>
        <p class="seal-text">
          Every service booked through Mr Home Services is covered by our post-service guarantee for complete
          peace of mind.
        </p>
      </div>
    </section>

    <!-- Core promises -->
    <section class="promises">
      <h2 class="section-title center">Our Core Promises</h2>
      <span class="title-underline"></span>
      <p class="promises-subtitle">How we hold ourselves accountable to the best possible standards, every day.</p>

      <div class="promise-grid">
        <div v-for="p in promises" :key="p.title" class="promise-card">
          <h4 class="promise-title">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="8 12 11 15 16 9" />
            </svg>
            {{ p.title }}
          </h4>
          <p class="promise-text">{{ p.text }}</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <h2 class="cta-title">Ready for hassle-free home maintenance?</h2>
      <p class="cta-text">
        Get matched with verified in-house experts. Instant booking, upfront pricing and complete safety are
        just a click away.
      </p>
      <router-link to="/services" class="btn-cta">
        Explore Services
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </router-link>
    </section>
  </div>
</template>

<script setup lang="ts">
const reasons = [
  {
    key: 'verified',
    title: 'Verified Professionals',
    text: 'Every technician goes through background screening and practical skill checks for quality and security.'
  },
  {
    key: 'ontime',
    title: 'On-Time Service',
    text: 'We respect your schedule. Our experts arrive on time with the right tools to finish the job quickly.'
  },
  {
    key: 'expert',
    title: 'Expert Craftsmanship',
    text: 'From simple fixture repairs to full maintenance, we deliver precise results with proper equipment.'
  },
  {
    key: 'guarantee',
    title: 'Post-Service Guarantee',
    text: 'Your satisfaction comes first. We stand by our work with a post-service guarantee.'
  }
]

const promises = [
  { title: 'Customer First', text: 'Every decision we make is about adding value and ease to our customers’ lives.' },
  { title: 'Skill Empowerment', text: 'We train and hire in-house staff, creating skilled jobs in our communities.' },
  { title: 'Transparent Pricing', text: 'Upfront estimates and clear rates, so there are no hidden costs or surprises.' },
  { title: 'Quality Assurance', text: 'Regular feedback checks keep our service standards consistently high.' }
]
</script>

<style scoped>
.why-page {
  color: #0F172A;
}

/* Hero */
.why-hero {
  background:
    radial-gradient(circle at 85% 0%, rgba(255, 255, 255, 0.14), transparent 40%),
    linear-gradient(135deg, #0F3FA6 0%, #1A56DB 60%, #2F6FEB 100%);
  border-radius: 24px;
  padding: 64px 24px 128px;
  text-align: center;
  color: #FFFFFF;
}

.why-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.28);
  margin-bottom: 18px;
}

.why-title {
  font-size: 46px;
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.8px;
  margin: 0 0 16px;
  color: #FFFFFF;
}

.why-title-accent {
  color: #BFDBFE;
  font-weight: 900;
}

.why-subtitle {
  max-width: 660px;
  margin: 0 auto;
  font-size: 17px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.88);
}

/* Reasons */
.reasons {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  margin: -88px 32px 0;
  position: relative;
}

.reason-card {
  background: #FFFFFF;
  border: 1px solid #E5EAF3;
  border-radius: 18px;
  padding: 28px 22px;
  text-align: center;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.reason-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 36px rgba(26, 86, 219, 0.14);
}

.reason-icon {
  width: 54px;
  height: 54px;
  margin: 0 auto 18px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1A56DB;
  background: #E0EAFF;
}

.reason-title {
  font-size: 17px;
  font-weight: 800;
  margin: 0 0 10px;
}

.reason-text {
  font-size: 14px;
  line-height: 1.6;
  color: #64748B;
  margin: 0;
}

/* Story */
.story {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 56px;
  align-items: center;
  margin: 80px 0;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #1A56DB;
  margin-bottom: 14px;
}

.eyebrow-line {
  width: 24px;
  height: 2px;
  background: #1A56DB;
}

.section-title {
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -0.4px;
  line-height: 1.2;
  margin: 0 0 18px;
  color: #0F172A;
}

.section-title.center {
  text-align: center;
  margin-bottom: 12px;
}

.story-text {
  font-size: 15.5px;
  line-height: 1.75;
  color: #475569;
  margin: 0 0 16px;
}

.story-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 26px;
}

.btn-primary,
.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 22px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #1A56DB;
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(26, 86, 219, 0.25);
}

.btn-primary:hover {
  background: #1D4ED8;
  transform: translateY(-1px);
}

.btn-outline {
  background: #FFFFFF;
  color: #0F172A;
  border: 1.5px solid #CBD5E1;
}

.btn-outline:hover {
  border-color: #1A56DB;
  color: #1A56DB;
}

.seal-card {
  background:
    radial-gradient(circle at 20% 0%, rgba(255, 255, 255, 0.16), transparent 45%),
    linear-gradient(160deg, #1A56DB 0%, #0F3FA6 100%);
  border-radius: 22px;
  padding: 56px 36px;
  text-align: center;
  color: #FFFFFF;
  box-shadow: 0 20px 44px rgba(26, 86, 219, 0.3);
}

.seal-icon {
  width: 84px;
  height: 84px;
  margin: 0 auto 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.seal-title {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 10px;
}

.seal-text {
  font-size: 14.5px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.86);
  margin: 0;
}

/* Promises */
.promises {
  background: #FFFFFF;
  border: 1px solid #E5EAF3;
  border-radius: 24px;
  padding: 48px 40px;
  text-align: center;
}

.title-underline {
  display: block;
  width: 48px;
  height: 4px;
  border-radius: 4px;
  background: #1A56DB;
  margin: 0 auto 16px;
}

.promises-subtitle {
  font-size: 15px;
  color: #64748B;
  margin: 0 0 34px;
}

.promise-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  text-align: left;
}

.promise-card {
  background: #F4F6F8;
  border-radius: 16px;
  padding: 20px;
}

.promise-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 800;
  margin: 0 0 8px;
  color: #0F172A;
}

.promise-title svg {
  color: #1A56DB;
  flex-shrink: 0;
}

.promise-text {
  font-size: 13.5px;
  line-height: 1.6;
  color: #64748B;
  margin: 0 0 0 26px;
}

/* CTA */
.cta {
  margin: 64px 0 20px;
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.16), transparent 55%),
    linear-gradient(135deg, #0F3FA6 0%, #1A56DB 100%);
  border-radius: 24px;
  padding: 56px 24px;
  text-align: center;
  color: #FFFFFF;
  box-shadow: 0 20px 44px rgba(26, 86, 219, 0.25);
}

.cta-title {
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -0.4px;
  margin: 0 0 14px;
}

.cta-text {
  max-width: 560px;
  margin: 0 auto 28px;
  font-size: 15.5px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.86);
}

.btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 14px 28px;
  border-radius: 12px;
  background: #FFFFFF;
  color: #1A56DB;
  font-size: 15px;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.2);
  transition: transform 0.2s ease;
}

.btn-cta:hover {
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 1024px) {
  .reasons {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin: -88px 16px 0;
  }

  .promise-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .story {
    gap: 36px;
  }
}

@media (max-width: 768px) {
  .why-hero {
    padding: 44px 18px 104px;
    border-radius: 20px;
  }

  .why-title {
    font-size: 32px;
  }

  .why-subtitle {
    font-size: 15px;
  }

  .reasons {
    margin: -72px 0 0;
    gap: 12px;
  }

  .reason-card {
    padding: 20px 14px;
  }

  .reason-icon {
    width: 46px;
    height: 46px;
    margin-bottom: 12px;
  }

  .reason-title {
    font-size: 15px;
  }

  .reason-text {
    font-size: 13px;
  }

  .story {
    grid-template-columns: minmax(0, 1fr);
    margin: 48px 0;
  }

  .section-title {
    font-size: 26px;
  }

  .seal-card {
    padding: 40px 24px;
  }

  .promises {
    padding: 32px 18px;
    border-radius: 20px;
  }

  .cta {
    margin-top: 44px;
    padding: 40px 20px;
    border-radius: 20px;
  }

  .cta-title {
    font-size: 24px;
  }
}

@media (max-width: 560px) {
  .reasons,
  .promise-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .story-actions a {
    flex: 1;
    justify-content: center;
  }
}
</style>
