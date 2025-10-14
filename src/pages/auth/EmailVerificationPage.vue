<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="verification-page-container q-pa-md">
      <!-- Loading state -->
      <div v-if="isVerifying" class="text-center">
        <loading-indicator
          :message="$t('auth.verify.verifying')"
          size="60px"
        />
      </div>

      <!-- Success state -->
      <div v-else-if="verificationSuccess" class="text-center">
        <q-icon name="check_circle" size="80px" color="positive" class="q-mb-md" />
        <h5 class="text-h5 text-weight-bold q-mb-sm">
          {{ $t('common.success') }}
        </h5>
        <p class="text-body1 q-mb-xl">
          {{ $t('auth.verify.success') }}
        </p>
        <q-btn
          :label="$t('auth.signup.login')"
          color="primary"
          size="lg"
          :to="{ name: 'login' }"
        />
      </div>

      <!-- Error state -->
      <div v-else class="text-center">
        <q-icon name="error" size="80px" color="negative" class="q-mb-md" />
        <h5 class="text-h5 text-weight-bold q-mb-sm">
          {{ $t('common.error') }}
        </h5>
        <p class="text-body1 q-mb-lg">
          {{ errorMessage || $t('auth.verify.error') }}
        </p>

        <!-- Resend verification button -->
        <div v-if="email" class="q-gutter-md">
          <q-btn
            :label="$t('auth.verify.resend')"
            color="primary"
            outline
            :loading="isResending"
            :disable="isResending"
            @click="handleResendVerification"
          />
          <q-btn
            :label="$t('auth.verify.backToLogin')"
            color="primary"
            flat
            :to="{ name: 'login' }"
          />
        </div>

        <!-- Back to signup if no email -->
        <div v-else>
          <q-btn
            :label="$t('auth.signup.title')"
            color="primary"
            :to="{ name: 'signup' }"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
/**
 * EmailVerificationPage.vue
 *
 * Email verification page that processes verification token from URL.
 * Automatically verifies on mount and shows success/error state.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuth } from 'src/composables/useAuth'
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue'

const route = useRoute()
const { t: $t } = useI18n()
const { verifyEmail, resendVerification } = useAuth()

const isVerifying = ref(true)
const isResending = ref(false)
const verificationSuccess = ref(false)
const errorMessage = ref(null)
const email = ref(null)
const token = ref(null)

/**
 * Verify email on component mount
 */
onMounted(async () => {
  // Extract email and token from URL query params
  email.value = route.query.email
  token.value = route.query.token

  if (!email.value || !token.value) {
    isVerifying.value = false
    errorMessage.value = 'Missing email or verification token'
    return
  }

  try {
    await verifyEmail(email.value, token.value)
    verificationSuccess.value = true
  } catch (err) {
    errorMessage.value = err.message || $t('auth.verify.error')
  } finally {
    isVerifying.value = false
  }
})

/**
 * Handle resend verification email
 */
async function handleResendVerification() {
  if (!email.value) return

  isResending.value = true
  errorMessage.value = null

  try {
    await resendVerification(email.value)
    errorMessage.value = null
    // Show success message that email was resent
  } catch (err) {
    errorMessage.value = err.message || 'Failed to resend verification email'
  } finally {
    isResending.value = false
  }
}
</script>

<style scoped>
.verification-page-container {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  padding: 3rem 2rem;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 600px) {
  .verification-page-container {
    box-shadow: none;
    border-radius: 0;
    padding: 2rem 1rem;
  }
}
</style>
