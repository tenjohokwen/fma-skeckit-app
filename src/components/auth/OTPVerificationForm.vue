<template>
  <q-form
    @submit.prevent="handleSubmit"
    class="otp-form"
  >
    <!-- Title -->
    <div class="text-center q-mb-lg">
      <h5 class="text-h5 text-weight-bold q-mb-xs">
        {{ $t('auth.passwordReset.enterOtp') }}
      </h5>
      <p class="text-body2 text-grey-7">
        {{ $t('auth.passwordReset.otpSent') }}
      </p>
    </div>

    <!-- OTP input -->
    <q-input
      v-model="otp"
      :label="$t('auth.passwordReset.otp')"
      type="text"
      outlined
      mask="######"
      fill-mask
      unmasked-value
      :rules="[
        val => !!val || $t('validation.required'),
        val => val.length === 6 || $t('validation.otp.invalid')
      ]"
      lazy-rules
      class="q-mb-md"
      autofocus
      input-class="text-center text-h5 letter-spacing"
    >
      <template #prepend>
        <q-icon name="vpn_key" />
      </template>
    </q-input>

    <!-- Hint -->
    <p class="text-caption text-grey-6 text-center q-mb-md">
      Enter the 6-digit code sent to your email
    </p>

    <!-- Submit button -->
    <q-btn
      type="submit"
      :label="$t('auth.passwordReset.verifyOtp')"
      color="primary"
      :loading="loading"
      :disable="loading || otp.length !== 6"
      class="full-width q-mb-md"
      size="lg"
    />

    <!-- Back button -->
    <div class="text-center">
      <q-btn
        flat
        dense
        no-caps
        :label="$t('common.back')"
        color="grey-7"
        @click="$emit('back')"
      />
    </div>
  </q-form>
</template>

<script setup>
/**
 * OTPVerificationForm.vue
 *
 * OTP verification form - validates 6-digit code.
 * Second step in password reset flow.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t: $t } = useI18n()

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
const otp = ref('')

/**
 * Handle form submission
 */
function handleSubmit() {
  if (otp.value.length === 6) {
    emit('submit', otp.value)
  }
}
</script>

<style scoped>
.otp-form {
  width: 100%;
  max-width: 400px;
}

.letter-spacing {
  letter-spacing: 0.5em;
  font-weight: 600;
}
</style>
