<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
    name: '',
    phone: '',
    message: ''
})

const isSubmitted = ref(false)

const handleSubmit = () => {
    if (form.value.name && form.value.phone && form.value.message) {
        isSubmitted.value = true
        setTimeout(() => {
            isSubmitted.value = false
            form.value = { name: '', phone: '', message: '' }
        }, 3000)
    }
}
</script>

<template>
    <section class="complaint-section">
        <div class="complaint-container">
            <!-- Left Info -->
            <div class="complaint-info">
                <h2 class="complaint-heading">Resolving your complaints!</h2>
                <p class="complaint-subtext">
                    Write your complaint here to help us make our service better for you.
                </p>
            </div>

            <!-- Right Form Card -->
            <div class="complaint-form-card">
                <div v-if="isSubmitted" class="success-message">
                    ✅ Thank you! Your complaint has been submitted successfully.
                </div>
                <form v-else @submit.prevent="handleSubmit" class="complaint-form">
                    <div class="form-row">
                        <div class="form-group">
                            <input 
                                v-model="form.name" 
                                type="text" 
                                placeholder="Name *" 
                                class="form-input"
                                required
                            />
                        </div>
                        <div class="form-group">
                            <input 
                                v-model="form.phone" 
                                type="tel" 
                                placeholder="Phone number *" 
                                class="form-input"
                                required
                            />
                        </div>
                    </div>

                    <div class="form-group">
                        <textarea 
                            v-model="form.message" 
                            placeholder="Message *" 
                            rows="3" 
                            class="form-textarea"
                            required
                        ></textarea>
                    </div>

                    <div class="form-action">
                        <button type="submit" class="btn-submit">Submit</button>
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
    background: #60A5FA;
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

.success-message {
    padding: 20px;
    background: #F0FDF4;
    color: #15803D;
    border-radius: 8px;
    font-weight: 600;
    text-align: center;
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
    }

    .form-row {
        flex-direction: column;
        gap: 16px;
    }
}
</style>
