<template>
  <q-form
    @submit.prevent="handleSubmit"
    class="forgot-password-form"
  >
    <!-- Title -->
    <div class="text-center q-mb-lg">
      <h5 class="text-h5 text-weight-bold q-mb-xs">
        {{ $t('auth.passwordReset.title') }}
      </h5>
      <p class="text-body2 text-grey-7">
        {{ $t('auth.passwordReset.subtitle') }}
      </p>
    </div>

    <!-- Email input -->
    <q-input
      v-model="email"
      :label="$t('auth.passwordReset.email')"
      type="email"
      outlined
      :rules="[
        val => !!val || $t('validation.email.required'),
        val => isValidEmail(val) || $t('validation.email.invalid')
      ]"
      lazy-rules
      class="q-mb-md"
      autofocus
    >
      <template #prepend>
        <q-icon name="email" />
      </template>
    </q-input>

    <!-- Submit button -->
    <q-btn
      type="submit"
      :label="$t('auth.passwordReset.sendOtp')"
      color="primary"
      :loading="loading"
      :disable="loading"
      class="full-width q-mb-md"
      size="lg"
    />

    <!-- Back to login link -->
    <div class="text-center">
      <q-btn
        flat
        dense
        no-caps
        :label="$t('auth.passwordReset.backToLogin')"
        color="grey-7"
        @click="$emit('back')"
      />
    </div>
  </q-form>
</template>

<script setup>
/**
 * ForgotPasswordForm.vue
 *
 * Forgot password form - requests OTP to be sent to email.
 * First step in password reset flow.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from 'src/composables/useAuth'

const { t: $t } = useI18n()
const { isValidEmail } = useAuth()

// Component props
defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

// Component emits
const emit = defineEmits(['submit', 'back'])

// Form data
const email = ref('')

/**
 * Handle form submission
 */
function handleSubmit() {
  emit('submit', email.value)
}
</script>

<style scoped>
.forgot-password-form {
  width: 100%;
  max-width: 400px;
}
</style>
