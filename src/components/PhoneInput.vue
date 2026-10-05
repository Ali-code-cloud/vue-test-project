<template>
  <!-- The wrapper takes the parent's input classes, so it looks like the field it replaces -->
  <div class="phone-field" :class="[attrs.class, { centered: center }]" :style="rootStyle" @click="inputEl?.focus()">
    <span class="phone-code">+92</span>
    <input
      ref="inputEl"
      v-bind="inputAttrs"
      type="tel"
      inputmode="numeric"
      autocomplete="tel-national"
      class="phone-field-input"
      :style="center ? { width: centeredWidth } : undefined"
      :value="display"
      :placeholder="placeholder"
      @input="onInput"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs, type StyleValue } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** Local format the backend stores: 03001234567 ('' while empty) */
  modelValue?: string | null
  placeholder?: string
  /** Keep "+92" and the number together in the middle of the field */
  center?: boolean
}>(), {
  modelValue: '',
  placeholder: '300 1234567',
  center: false
})

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const attrs = useAttrs()
const inputEl = ref<HTMLInputElement | null>(null)

const rootStyle = computed(() => attrs.style as StyleValue)

// Everything except class/style goes on the <input> (id, required, @input, ...)
const inputAttrs = computed(() => {
  const rest = { ...attrs }
  delete rest.class
  delete rest.style
  return rest
})

/** Digits after the country code: "+92 300 1234567", "923001234567", "03001234567" -> "3001234567" */
function localDigits(value: string) {
  return value.replace(/\D/g, '').replace(/^(92|0)/, '').slice(0, 10)
}

const display = computed(() => localDigits(props.modelValue || ''))

// Centered: the input is only as wide as its text, so the pair can sit in the middle
const centeredWidth = computed(() => `${(display.value || props.placeholder).length + 1}ch`)

function onInput(event: Event) {
  const el = event.target as HTMLInputElement
  const digits = localDigits(el.value)
  el.value = digits
  emit('update:modelValue', digits ? '0' + digits : '')
}
</script>

<style scoped>
.phone-field {
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: normal;
  cursor: text;
}

.phone-field:focus-within {
  border-color: #1A56DB;
}

.phone-code {
  flex-shrink: 0;
  font-weight: 600;
  color: #0F172A;
  user-select: none;
}

.phone-field-input {
  flex: 1;
  min-width: 0;
  width: 100%;
  padding: 0;
  margin: 0;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  color: inherit;
  text-align: left;
}

.phone-field.centered {
  justify-content: center;
}

.phone-field.centered .phone-field-input {
  flex: 0 1 auto;
  max-width: 100%;
}

.phone-field-input::placeholder {
  color: #94A3B8;
}
</style>
