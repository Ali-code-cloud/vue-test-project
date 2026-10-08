<template>
  <div class="contact-page">
    <div class="contact-back">
      <BackButton />
    </div>

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
          <div v-if="formError" class="error-banner">{{ formError }}</div>

          <div class="form-group">
            <label for="contact-name">Your Name <em>*</em></label>
            <input id="contact-name" v-model="form.name" type="text" placeholder="Ali Ahmed" maxlength="255"
              autocomplete="name" class="input-field" :class="{ invalid: errors.name }" @input="errors.name = ''" />
            <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
          </div>

          <div class="form-group">
            <label for="contact-phone">Phone Number <em>*</em></label>
            <PhoneInput id="contact-phone" v-model="form.phone" class="input-field" :class="{ invalid: errors.phone }"
              @input="errors.phone = ''" />
            <span v-if="errors.phone" class="field-error">{{ errors.phone }}</span>
          </div>

          <div class="form-group">
            <label for="contact-subject">Subject <span class="optional">(optional)</span></label>
            <input id="contact-subject" v-model="form.subject" type="text" placeholder="Inquiry about AC Service"
              :maxlength="SUBJECT_MAX" class="input-field" :class="{ invalid: errors.subject }" @input="errors.subject = ''" />
            <span v-if="errors.subject" class="field-error">{{ errors.subject }}</span>
          </div>

          <div class="form-group">
            <label for="contact-message">Message <em>*</em></label>
            <textarea id="contact-message" v-model="form.message" rows="4" placeholder="How can we assist you?"
              :maxlength="messageMax" class="input-field" :class="{ invalid: errors.message }"
              @input="errors.message = ''"></textarea>
            <div class="field-meta">
              <span v-if="errors.message" class="field-error">{{ errors.message }}</span>
              <span class="char-count" :class="{ near: messageLeft < 100 }">{{ messageLeft }} characters left</span>
            </div>
          </div>

          <button type="submit" class="btn-submit" :disabled="isSending">
            {{ isSending ? 'Sending...' : 'Submit Message' }}
          </button>
          <p v-if="!authStore.isAuthenticated" class="signin-note">
            You'll be asked to sign in with your phone number before the message is sent.
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showSuccessToast, showErrorToast } from '@/utils/alert'
import BackButton from '@/components/BackButton.vue'
import PhoneInput from '@/components/PhoneInput.vue'
import api from '@/composables/useApi'
import { useAuthStore, getPhoneError } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

/*
 * Sends to POST /api/complaint { name, phone, message } (the backend's only message endpoint).
 * It needs a signed-in user: guests are asked to sign in and the message is sent right after.
 * The backend has no subject field, so the subject is put at the start of the message.
 */
const NAME_MAX = 255
const SUBJECT_MAX = 100
const MESSAGE_LIMIT = 2000 // backend: message max 2000, including the subject line
const MESSAGE_MIN = 10

const authStore = useAuthStore()
const cartStore = useCartStore()

const form = ref({
  name: authStore.user?.name || '',
  phone: authStore.user?.phone || '',
  subject: '',
  message: ''
})
const errors = ref({ name: '', phone: '', subject: '', message: '' })
const formError = ref('')
const submittedMsg = ref('')
const isSending = ref(false)
// Waiting for the visitor to sign in before sending
const sendAfterLogin = ref(false)

const subjectLine = computed(() => (form.value.subject.trim() ? `Subject: ${form.value.subject.trim()}\n\n` : ''))
const messageMax = computed(() => MESSAGE_LIMIT - subjectLine.value.length)
const messageLeft = computed(() => messageMax.value - form.value.message.length)

// Fill in name and phone once the visitor signs in (fields they typed are kept)
watch(() => authStore.user, (user) => {
  if (!user) return
  if (!form.value.name.trim()) form.value.name = user.name || ''
  if (!form.value.phone) form.value.phone = user.phone || ''
})

function validate(): boolean {
  const e = { name: '', phone: '', subject: '', message: '' }
  const name = form.value.name.trim()
  const message = form.value.message.trim()

  if (!name) e.name = 'Please enter your name.'
  else if (name.length < 2) e.name = 'Name must be at least 2 characters.'
  else if (name.length > NAME_MAX) e.name = `Name may not be longer than ${NAME_MAX} characters.`

  e.phone = getPhoneError(form.value.phone)

  if (form.value.subject.trim().length > SUBJECT_MAX) e.subject = `Subject may not be longer than ${SUBJECT_MAX} characters.`

  if (!message) e.message = 'Please write your message.'
  else if (message.length < MESSAGE_MIN) e.message = `Message must be at least ${MESSAGE_MIN} characters.`
  else if (subjectLine.value.length + message.length > MESSAGE_LIMIT) e.message = `Message is too long (max ${messageMax.value} characters).`

  errors.value = e
  const firstInvalid = (['name', 'phone', 'subject', 'message'] as const).find(k => e[k])
  if (firstInvalid) {
    document.getElementById(`contact-${firstInvalid}`)?.focus()
    return false
  }
  return true
}

async function handleSubmit() {
  formError.value = ''
  submittedMsg.value = ''
  if (!validate()) return

  // The endpoint needs a signed-in user: sign in first, then this sends automatically
  if (!authStore.isAuthenticated) {
    sendAfterLogin.value = true
    cartStore.openAuthModal()
    return
  }

  isSending.value = true
  try {
    await api.post('/api/complaint', {
      name: form.value.name.trim(),
      phone: form.value.phone,
      message: subjectLine.value + form.value.message.trim()
    }, { skipAuthRedirect: true } as any)

    // The endpoint's own text talks about a "complaint"; this page is a general contact form
    submittedMsg.value = 'Thank you! Your message has been sent. Our support team will contact you shortly.'
    showSuccessToast('Message sent successfully!')
    form.value.subject = ''
    form.value.message = ''
  } catch (err: any) {
    const res = err?.response
    if (res?.status === 401) {
      // Signed out or session expired: sign in again, the message is kept and sent after
      authStore.logout()
      sendAfterLogin.value = true
      cartStore.openAuthModal()
      return
    }
    if (res?.status === 422 && res.data?.errors) {
      const be = res.data.errors
      const first = (v: unknown) => (Array.isArray(v) ? String(v[0]) : v ? String(v) : '')
      errors.value = {
        name: first(be.name),
        phone: first(be.phone || be.phone_number),
        subject: '',
        message: first(be.message)
      }
    }
    formError.value = res?.data?.message || (res ? 'Could not send your message. Please try again.' : 'Could not reach the server. Please check your connection and try again.')
    showErrorToast(formError.value)
  } finally {
    isSending.value = false
  }
}

// Visitor signed in from the popup: send the message they already wrote
watch(() => authStore.isAuthenticated, (signedIn) => {
  if (signedIn && sendAfterLogin.value) {
    sendAfterLogin.value = false
    handleSubmit()
  }
})

// Popup closed without signing in: stop waiting
watch(() => cartStore.showAuthModal, (open) => {
  if (!open && !authStore.isAuthenticated && sendAfterLogin.value) {
    sendAfterLogin.value = false
    formError.value = 'Please sign in to send your message. Your message is still here.'
  }
})
</script>

<style scoped>
.contact-page {
  max-width: 1140px;
  margin: 40px auto;
  padding: 0 20px;
}

.contact-back {
  margin-bottom: 8px;
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
  font-family: inherit;
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

.btn-submit:hover:not(:disabled) {
  background: #1D4ED8;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: wait;
}

.form-group label em {
  color: #DC2626;
  font-style: normal;
}

.form-group label .optional {
  color: #94A3B8;
  font-weight: 500;
}

.input-field:focus-within {
  border-color: #1A56DB;
  box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.1);
}

.input-field.invalid {
  border-color: #DC2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.08);
}

.field-error {
  color: #DC2626;
  font-size: 12px;
  font-weight: 500;
}

.field-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.char-count {
  margin-left: auto;
  font-size: 12px;
  color: #94A3B8;
  white-space: nowrap;
}

.char-count.near {
  color: #D97706;
}

.error-banner {
  background: #FEF2F2;
  color: #B91C1C;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
}

.signin-note {
  margin: -6px 0 0;
  font-size: 12px;
  color: #64748B;
  text-align: center;
}

/* Long values (e.g. the support email) must wrap instead of widening the column */
.card-item > div:last-child {
  min-width: 0;
}

.card-item p {
  overflow-wrap: anywhere;
}

.icon-circle {
  flex-shrink: 0;
}

@media (max-width: 860px) {
  .contact-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 480px) {
  .contact-page {
    padding: 0 16px;
  }

  .contact-header h1 {
    font-size: 2rem;
  }

  .card-item {
    padding: 18px;
    gap: 14px;
  }

  .contact-form-card {
    padding: 22px 18px;
  }
}
</style>