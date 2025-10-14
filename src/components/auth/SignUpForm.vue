<template>
  <q-form
    @submit.prevent="handleSubmit"
    class="signup-form"
  >
    <!-- Email input -->
    <q-input
      v-model="formData.email"
      :label="$t('auth.signup.email')"
      type="email"
      outlined
      :rules="[
        val => !!val || $t('validation.email.required'),
        val => isValidEmail(val) || $t('validation.email.invalid')
      ]"
      lazy-rules
      class="q-mb-md"
    >
      <template #prepend>
        <q-icon name="email" />
      </template>
    </q-input>

    <!-- Password input -->
    <q-input
      v-model="formData.password"
      :label="$t('auth.signup.password')"
      :type="showPassword ? 'text' : 'password'"
      outlined
      :rules="[
        val => !!val || $t('validation.password.required'),
        val => val.length >= 8 || $t('validation.password.minLength'),
        val => validatePasswordStrength(val).isValid || validatePasswordStrength(val).errors[0]
      ]"
      lazy-rules
      class="q-mb-md"
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
      :label="$t('auth.signup.confirmPassword')"
      :type="showConfirmPassword ? 'text' : 'password'"
      outlined
      :rules="[
        val => !!val || $t('validation.required'),
        val => val === formData.password || $t('validation.password.mismatch')
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
      :label="$t('auth.signup.submit')"
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
 * SignUpForm.vue
 *
 * Sign up form component with validation.
 * Validates email format and password strength.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from 'src/composables/useAuth'

const { t: $t } = useI18n()
const { isValidEmail, validatePasswordStrength } = useAuth()

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
  email: '',
  password: '',
  confirmPassword: ''
})

// Password visibility toggles
const showPassword = ref(false)
const showConfirmPassword = ref(false)

/**
 * Handle form submission
 */
function handleSubmit() {
  emit('submit', {
    email: formData.value.email,
    password: formData.value.password
  })
}
</script>

<style scoped>
.signup-form {
  width: 100%;
  max-width: 400px;
}
</style>
