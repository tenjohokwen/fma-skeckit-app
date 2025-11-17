<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="signup-page-container q-pa-md">
      <!-- Header -->
      <div class="text-center q-mb-xl">
        <h4 class="text-h4 text-weight-bold q-mb-sm">
          {{ $t('auth.signup.title') }}
        </h4>
        <p class="text-body2 text-grey-7">
          {{ $t('auth.signup.subtitle') }}
        </p>
      </div>

      <!-- Success message after signup -->
      <div v-if="signupSuccess" class="q-mb-lg">
        <q-banner class="bg-positive text-white" rounded>
          <template #avatar>
            <q-icon name="check_circle" size="md" />
          </template>
          <div>
            <div class="text-weight-bold q-mb-xs">
              {{ $t('common.success') }}
            </div>
            <div>{{ $t('auth.signup.success') }}</div>
          </div>
        </q-banner>
      </div>

      <!-- Error display -->
      <error-display v-if="error && !signupSuccess" type="error" :message="error" :dismissible="true"
        @dismiss="error = null" class="q-mb-md" />

      <!-- Sign up form -->
      <sign-up-form v-if="!signupSuccess" :loading="isLoading" @submit="handleSignup" />

      <!-- Already have account link -->
      <div class="text-center q-mt-lg">
        <p class="text-body2 text-grey-7">
          {{ $t('auth.signup.alreadyHaveAccount') }}
          <router-link :to="{ name: 'login' }" class="text-primary text-weight-medium">
            {{ $t('auth.signup.login') }}
          </router-link>
        </p>
      </div>

      <!-- After success, show link to login -->
      <div v-if="signupSuccess" class="text-center q-mt-md">
        <q-btn :label="$t('auth.signup.login')" color="primary" outline :to="{ name: 'login' }" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
/**
 * SignUpPage.vue
 *
 * User registration page with email verification flow.
 * Redirects to token entry page after successful signup.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuth } from 'src/composables/useAuth'
import SignUpForm from 'src/components/auth/SignUpForm.vue'
import ErrorDisplay from 'src/components/shared/ErrorDisplay.vue'

const router = useRouter()
const { t: $t } = useI18n()
const { signup, isLoading } = useAuth()

const error = ref(null)
const signupSuccess = ref(false)

/**
 * Handle signup form submission
 * @param {Object} credentials - { email, password }
 */
async function handleSignup(credentials) {
  error.value = null
  signupSuccess.value = false

  try {
    await signup(credentials)
    signupSuccess.value = true

    // Redirect to token entry page with email in query
    setTimeout(() => {
      router.push({
        name: 'verify-token',
        query: { email: credentials.email }
      })
    }, 1500)
  } catch (err) {
    error.value = err.message || $t('error.unknown')
  }
}
</script>

<style scoped>
.signup-page-container {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  padding: 2rem;
}

@media (max-width: 600px) {
  .signup-page-container {
    box-shadow: none;
    border-radius: 0;
  }
}
</style>
