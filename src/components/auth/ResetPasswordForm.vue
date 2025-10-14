<template>
  <q-form
    @submit.prevent="handleSubmit"
    class="reset-password-form"
  >
    <!-- Title -->
    <div class="text-center q-mb-lg">
      <h5 class="text-h5 text-weight-bold q-mb-xs">
        {{ $t('auth.passwordReset.resetPassword') }}
      </h5>
      <p class="text-body2 text-grey-7">
        Enter your new password
      </p>
    </div>

    <!-- New password input -->
    <q-input
      v-model="formData.newPassword"
      :label="$t('auth.passwordReset.newPassword')"
      :type="showPassword ? 'text' : 'password'"
      outlined
      :rules="[
        val => !!val || $t('validation.password.required'),
        val => val.length >= 8 || $t('validation.password.minLength'),
        val => validatePasswordStrength(val).isValid || validatePasswordStrength(val).errors[0]
      ]"
      lazy-rules
      class="q-mb-md"
      autofocus
    >
      <template #prepend>
        <q-icon name="lock" />
      </template>
      <template #append>
        <q-icon
          :name="showPassword ? 'visibility' : 'visibility_off'"
          class="cursor-pointer"
          @click="showPassword = !showPassword"
        />
      </template>
    </q-input>

    <!-- Confirm password input -->
    <q-input
      v-model="formData.confirmPassword"
      :label="$t('auth.passwordReset.confirmPassword')"
      :type="showConfirmPassword ? 'text' : 'password'"
      outlined
      :rules="[
        val => !!val || $t('validation.required'),
        val => val === formData.newPassword || $t('validation.password.mismatch')
      ]"
      lazy-rules
      class="q-mb-md"
    >
      <template #prepend>
        <q-icon name="lock" />
      </template>
      <template #append>
        <q-icon
          :name="showConfirmPassword ? 'visibility' : 'visibility_off'"
          class="cursor-pointer"
          @click="showConfirmPassword = !showConfirmPassword"
        />
      </template>
    </q-input>

    <!-- Submit button -->
    <q-btn
      type="submit"
      :label="$t('auth.passwordReset.resetPassword')"
      color="primary"
      :loading="loading"
      :disable="loading"
      class="full-width"
      size="lg"
    />
  </q-form>
</template>

<script setup>
/**
 * ResetPasswordForm.vue
 *
 * Password reset form - enter new password after OTP verification.
 * Final step in password reset flow.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from 'src/composables/useAuth'

const { t: $t } = useI18n()
const { validatePasswordStrength } = useAuth()

// Component props
defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

// Component emits
const emit = defineEmits(['submit'])

// Form data
const formData = ref({
  newPassword: '',
  confirmPassword: ''
})

// Password visibility toggles
const showPassword = ref(false)
const showConfirmPassword = ref(false)

/**
 * Handle form submission
 */
function handleSubmit() {
  emit('submit', formData.value.newPassword)
}
</script>

<style scoped>
.reset-password-form {
  width: 100%;
  max-width: 400px;
}
</style>
