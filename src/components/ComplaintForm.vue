<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, getApiError } from '@/stores/auth'
import api from '@/composables/useApi'
import { showSuccessToast, showErrorToast } from '@/utils/alert'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
    name: authStore.user?.name || '',
    phone: authStore.user?.phone || '',
    message: ''
})

const formErrors = ref({
    name: '',
    phone: '',
    message: ''
})

const clearFormErrors = () => {
    formErrors.value = {
        name: '',
        phone: '',
        message: ''
    }
}

const isSubmitting = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
    errorMessage.value = ''
    clearFormErrors()

    // Check if user is logged in
    if (!authStore.isAuthenticated || !authStore.user) {
        showErrorToast('Please sign in to file a complaint.')
        authStore.logout()
        router.push('/login')
        return
    }

    let hasClientError = false
    if (!form.value.name.trim()) {
        formErrors.value.name = 'The name field is required.'
        hasClientError = true
    }
    if (!form.value.phone.trim()) {
        formErrors.value.phone = 'The phone number field is required.'
        hasClientError = true
    }
    if (!form.value.message.trim()) {
        formErrors.value.message = 'The message field is required.'
        hasClientError = true
    }

    if (hasClientError) {
        showErrorToast('Please fix the errors in the form.')
        return
    }

    isSubmitting.value = true

    try {
        const { data } = await api.post('/api/complaint', {
            name: (form.value.name || '').trim(),
            phone: (form.value.phone || '').trim(),
            email: authStore.user?.email || '',
            message: (form.value.message || '').trim()
        })

        if (data?.status === false) {
            if (data?.errors) {
                if (data.errors.name) formErrors.value.name = Array.isArray(data.errors.name) ? data.errors.name[0] : data.errors.name
                if (data.errors.phone) formErrors.value.phone = Array.isArray(data.errors.phone) ? data.errors.phone[0] : data.errors.phone
                if (data.errors.message) formErrors.value.message = Array.isArray(data.errors.message) ? data.errors.message[0] : data.errors.message
            }
            throw new Error(data.message || 'Failed to submit complaint.')
        }

        showSuccessToast(data?.message || 'Your complaint has been submitted successfully!')

        form.value = {
            name: authStore.user?.name || '',
            phone: authStore.user?.phone || '',
            message: ''
        }
        clearFormErrors()

    } catch (error: any) {
        if (error.response?.data?.errors) {
            const errs = error.response.data.errors
            if (errs.name) formErrors.value.name = Array.isArray(errs.name) ? errs.name[0] : errs.name
            if (errs.phone) formErrors.value.phone = Array.isArray(errs.phone) ? errs.phone[0] : errs.phone
            if (errs.message) formErrors.value.message = Array.isArray(errs.message) ? errs.message[0] : errs.message
        }
        const msg = getApiError(error)
        errorMessage.value = msg
        showErrorToast(msg)
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <section class="complaint-section">
        <div class="complaint-container">

            <!-- Left Info -->
            <div class="complaint-info">
                <h2 class="complaint-heading">
                    Resolving your complaints!
                </h2>

                <p class="complaint-subtext">
                    Write your complaint here to help us make our service
                    better for you.
                </p>
            </div>

            <!-- Right Form Card -->
            <div class="complaint-form-card">

                <!-- Error Alert -->
                <div v-if="errorMessage" class="error-message">
                    ❌ {{ errorMessage }}
                </div>

                <form @submit.prevent="handleSubmit" class="complaint-form" novalidate>
                    <div class="form-row">
                        <div class="form-group">
                            <input 
                                v-model="form.name" 
                                type="text" 
                                placeholder="Name *" 
                                class="form-input" 
                                :class="{ 'has-error': formErrors.name }"
                                @input="formErrors.name = ''"
                            />
                            <span v-if="formErrors.name" class="text-danger-error">{{ formErrors.name }}</span>
                        </div>

                        <div class="form-group">
                            <input 
                                v-model="form.phone" 
                                type="tel" 
                                placeholder="Phone number *" 
                                class="form-input" 
                                :class="{ 'has-error': formErrors.phone }"
                                @input="formErrors.phone = ''"
                            />
                            <span v-if="formErrors.phone" class="text-danger-error">{{ formErrors.phone }}</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <textarea 
                            v-model="form.message" 
                            placeholder="Message *" 
                            rows="3" 
                            class="form-textarea"
                            :class="{ 'has-error': formErrors.message }"
                            @input="formErrors.message = ''"
                        ></textarea>
                        <span v-if="formErrors.message" class="text-danger-error">{{ formErrors.message }}</span>
                    </div>

                    <div class="form-action">
                        <button type="submit" class="btn-submit" :disabled="isSubmitting">
                            {{ isSubmitting ? 'Submitting...' : 'Submit' }}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    </section>
</template>

<style scoped>
.complaint-section {
    background: #F4F7FE;
    border-radius: 16px;
    padding: 44px 36px;
    margin: 40px 0;
}

.complaint-container {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
}

.complaint-info {
    flex: 1;
    max-width: 380px;
}

.complaint-heading {
    font-size: 2.2rem;
    font-weight: 800;
    color: #0F172A;
    line-height: 1.2;
    margin-bottom: 12px;
}

.complaint-subtext {
    font-size: 0.95rem;
    color: #64748B;
    line-height: 1.5;
}

.complaint-form-card {
    flex: 1.3;
    background: #ffffff;
    border-radius: 12px;
    padding: 28px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.form-row {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
}

.form-group {
    flex: 1;
    margin-bottom: 16px;
}

.form-row .form-group {
    margin-bottom: 0;
}

.form-input,
.form-textarea {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #CBD5E1;
    border-radius: 20px;
    font-size: 14px;
    color: #1E293B;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-family: inherit;
    box-sizing: border-box;
}

.form-textarea {
    border-radius: 12px;
    resize: vertical;
}

.form-input:focus,
.form-textarea:focus {
    border-color: #1A56DB;
    box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.1);
}

.form-action {
    display: flex;
    justify-content: flex-end;
}

.btn-submit {
    background: #5096F6;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 10px 36px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-submit:hover {
    background: #1A56DB;
}

.btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.error-message {
    padding: 12px 16px;
    margin-bottom: 16px;
    background: #FEF2F2;
    color: #B91C1C;
    border-radius: 8px;
    font-size: 14px;
}

@media (max-width: 800px) {
    .complaint-container {
        flex-direction: column;
    }

    .complaint-info {
        max-width: 100%;
        text-align: center;
    }

    .complaint-form-card {
        width: 100%;
        box-sizing: border-box;
    }

    .form-row {
        flex-direction: column;
        gap: 0;
    }

    .form-row .form-group {
        margin-bottom: 16px;
    }
}
</style>