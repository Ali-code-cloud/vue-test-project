<template>
  <div class="contact-page">
    <div class="contact-header">
      <span class="badge">Get In Touch</span>
      <h1>We are Here to Help You 24/7</h1>
      <p>Have a question or need assistance with your service booking? Send us a message!</p>
    </div>

    <div class="contact-grid">
      <!-- Contact Cards -->
      <div class="contact-cards">
        <div class="card-item">
          <div class="icon-circle bg-blue">📞</div>
          <div>
            <h3>Phone Support</h3>
            <p>042-111-111-242</p>
            <span>Available 24/7 for urgent bookings</span>
          </div>
        </div>

        <div class="card-item">
          <div class="icon-circle bg-green">💬</div>
          <div>
            <h3>WhatsApp Assistance</h3>
            <p>+92 300 0000000</p>
            <span>Fast instant chat support</span>
          </div>
        </div>

        <div class="card-item">
          <div class="icon-circle bg-purple">📧</div>
          <div>
            <h3>Email Us</h3>
            <p>support@mrhomeservices.com</p>
            <span>We reply within 2 hours</span>
          </div>
        </div>
      </div>

      <!-- Contact Form -->
      <div class="contact-form-card">
        <h3>Send Us a Message</h3>
        <form @submit.prevent="handleSubmit" class="contact-form" novalidate>
          <div v-if="submittedMsg" class="success-banner">
            {{ submittedMsg }}
          </div>

          <div class="form-group">
            <label>Your Name</label>
            <input type="text" v-model="form.name" placeholder="Ali Ahmed" class="input-field" />
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input type="email" v-model="form.email" placeholder="ali@example.com" class="input-field" />
          </div>

          <div class="form-group">
            <label>Subject</label>
            <input type="text" v-model="form.subject" placeholder="Inquiry about AC Service" class="input-field" />
          </div>

          <div class="form-group">
            <label>Message</label>
            <textarea v-model="form.message" rows="4" placeholder="How can we assist you?" class="input-field"></textarea>
          </div>

          <button type="submit" class="btn-submit">Submit Message</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showSuccessToast } from '@/utils/alert'

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const submittedMsg = ref('')

const handleSubmit = () => {
  submittedMsg.value = 'Thank you! Your message has been sent successfully. Our support team will contact you shortly.'
  showSuccessToast('Message sent successfully!')
  form.value = { name: '', email: '', subject: '', message: '' }
  setTimeout(() => {
    submittedMsg.value = ''
  }, 4000)
}
</script>

<style scoped>
.contact-page {
  max-width: 1140px;
  margin: 40px auto;
  padding: 0 20px;
}

.contact-header {
  text-align: center;
  margin-bottom: 40px;
}

.badge {
  background: #EFF6FF;
  color: #1A56DB;
  font-weight: 700;
  font-size: 14px;
  padding: 6px 16px;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 14px;
}

.contact-header h1 {
  font-size: 2.6rem;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 12px;
}

.contact-header p {
  color: #64748B;
  font-size: 1.1rem;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 36px;
}

.contact-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-item {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
}

.icon-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.bg-blue { background: #EFF6FF; }
.bg-green { background: #DCFCE7; }
.bg-purple { background: #F3E8FF; }

.card-item h3 {
  font-size: 18px;
  font-weight: 700;
  color: #0F172A;
  margin-bottom: 4px;
}

.card-item p {
  font-size: 16px;
  font-weight: 700;
  color: #1A56DB;
  margin-bottom: 2px;
}

.card-item span {
  font-size: 13px;
  color: #64748B;
}

.contact-form-card {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.contact-form-card h3 {
  font-size: 22px;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 20px;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.success-banner {
  background: #DCFCE7;
  color: #15803D;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.input-field {
  padding: 12px 14px;
  border: 1px solid #CBD5E1;
  border-radius: 10px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #1A56DB;
  box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.1);
}

.btn-submit {
  background: #1A56DB;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-submit:hover {
  background: #1D4ED8;
}

@media (max-width: 860px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
</style>