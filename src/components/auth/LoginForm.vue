<template>
  <q-form
    @submit.prevent="handleSubmit"
    class="login-form"
  >
    <!-- Email input -->
    <q-input
      v-model="formData.email"
      :label="$t('auth.login.email')"
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
      :label="$t('auth.login.password')"
      :type="showPassword ? 'text' : 'password'"
      outlined
      :rules="[
        val => !!val || $t('validation.password.required')
      ]"
      lazy-rules
      class="q-mb-sm"
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

    <!-- Forgot password link -->
    <div class="text-right q-mb-md">
      <q-btn
        flat
        dense
        no-caps
        :label="$t('auth.login.forgotPassword')"
        color="primary"
        size="sm"
        @click="$emit('forgot-password')"
      />
    </div>

    <!-- Submit button -->
    <q-btn
      type="submit"
      :label="$t('auth.login.submit')"
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
 * LoginForm.vue
 *
 * Login form component with email and password inputs.
 * Includes forgot password link.
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
const emit = defineEmits(['submit', 'forgot-password'])

// Form data
const formData = ref({
  email: '',
  password: ''
})

// Password visibility toggle
const showPassword = ref(false)

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
.login-form {
  width: 100%;
  max-width: 400px;
}
</style>
