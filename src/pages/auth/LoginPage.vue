<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="login-page-container q-pa-md">
      <!-- Token expired message -->
      <div v-if="showExpiredMessage" class="q-mb-lg">
        <q-banner class="bg-warning text-dark" rounded>
          <template #avatar>
            <q-icon name="schedule" size="md" />
          </template>
          <div>{{ $t('error.token.expired') }}</div>
        </q-banner>
      </div>

      <!-- Error display -->
      <error-display v-if="error" type="error" :message="error" :dismissible="true" @dismiss="error = null"
        class="q-mb-md" />

      <!-- Login Form (default view) -->
      <div v-if="currentView === 'login'">
        <div class="text-center q-mb-xl">
          <h4 class="text-h4 text-weight-bold q-mb-sm">
            {{ $t('auth.login.title') }}
          </h4>
          <p class="text-body2 text-grey-7">
            {{ $t('auth.login.subtitle') }}
          </p>
        </div>

        <login-form :loading="isLoading" @submit="handleLogin" @forgot-password="currentView = 'forgot-password'" />

        <!-- Sign up link -->
        <div class="text-center q-mt-lg">
          <p class="text-body2 text-grey-7">
            {{ $t('auth.login.noAccount') }}
            <router-link :to="{ name: 'signup' }" class="text-primary text-weight-medium">
              {{ $t('auth.login.signup') }}
            </router-link>
          </p>
        </div>
      </div>

      <!-- Forgot Password Form -->
      <div v-else-if="currentView === 'forgot-password'">
        <forgot-password-form :loading="isLoading" @submit="handleRequestPasswordReset" @back="currentView = 'login'" />
      </div>

      <!-- OTP Verification Form -->
      <div v-else-if="currentView === 'verify-otp'">
        <OTPVerificationForm :loading="isLoading" @submit="handleVerifyOTP" @back="currentView = 'forgot-password'" />
      </div>

      <!-- Reset Password Form -->
      <div v-else-if="currentView === 'reset-password'">
        <reset-password-form :loading="isLoading" @submit="handleResetPassword" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
/**
 * LoginPage.vue
 *
 * Login page with multi-step password reset flow.
 * Handles: Login, Forgot Password, OTP Verification, Reset Password.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuth } from 'src/composables/useAuth'
// Components - auto-registered in <script setup>
import LoginForm from 'src/components/auth/LoginForm.vue'
import ForgotPasswordForm from 'src/components/auth/ForgotPasswordForm.vue'
import OTPVerificationForm from 'src/components/auth/OTPVerificationForm.vue'
import ResetPasswordForm from 'src/components/auth/ResetPasswordForm.vue'
import ErrorDisplay from 'src/components/shared/ErrorDisplay.vue'

const route = useRoute()
const { t: $t } = useI18n()
const { login, requestPasswordReset, verifyOTP, resetPassword, isLoading } = useAuth()

// Current view state machine
const currentView = ref('login') // login | forgot-password | verify-otp | reset-password

// Error and message states
const error = ref(null)
const showExpiredMessage = ref(false)

// Store email and OTP for multi-step flow
const resetEmail = ref('')
const resetOTP = ref('')

/**
 * Check for expired token message on mount
 */
onMounted(() => {
  if (route.query.expired === 'true') {
    showExpiredMessage.value = true
  }
})

/**
 * Handle login form submission
 * @param {Object} credentials - { email, password }
 */
async function handleLogin(credentials) {
  error.value = null
  showExpiredMessage.value = false

  try {
    await login(credentials)
    // Router navigation handled in useAuth.login()
  } catch (err) {
    error.value = err.message || $t('error.login.invalid')
  }
}

/**
 * Handle forgot password - request OTP
 * @param {string} email - User email
 */
async function handleRequestPasswordReset(email) {
  error.value = null

  try {
    await requestPasswordReset(email)
    resetEmail.value = email
    currentView.value = 'verify-otp'
  } catch (err) {
    error.value = err.message || $t('error.unknown')
  }
}

/**
 * Handle OTP verification
 * @param {string} otp - 6-digit OTP code
 */
async function handleVerifyOTP(otp) {
  error.value = null

  try {
    await verifyOTP(resetEmail.value, otp)
    resetOTP.value = otp
    currentView.value = 'reset-password'
  } catch (err) {
    error.value = err.message || $t('validation.otp.incorrect')
  }
}

/**
 * Handle password reset
 * @param {string} newPassword - New password
 */
async function handleResetPassword(newPassword) {
  error.value = null

  try {
    await resetPassword(resetEmail.value, resetOTP.value, newPassword)
    // Router navigation handled in useAuth.resetPassword()
  } catch (err) {
    error.value = err.message || $t('error.unknown')
  }
}
</script>

<style scoped>
.login-page-container {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  padding: 2rem;
}

@media (max-width: 600px) {
  .login-page-container {
    box-shadow: none;
    border-radius: 0;
  }
}
</style>
