/**
 * useAuth.js
 *
 * Composable for authentication operations.
 * Provides form validation, error handling, and auth flow management.
 *
 * Per constitution: Composition API composables for reusable logic
 */

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { useNotifications } from './useNotifications'

export function useAuth() {
  const router = useRouter()
  const authStore = useAuthStore()
  const { notifySuccess, notifyError, notifyApiError } = useNotifications()

  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  function validatePasswordStrength(password) {
    const errors = []

    if (!password || password.length < 8) {
      errors.push('validation.password.minLength')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Sign up a new user
   * @param {Object} credentials - { email, password }
   * @returns {Promise<void>}
   */
  async function signup(credentials) {
    error.value = null
    isLoading.value = true

    try {
      // Validate email
      if (!isValidEmail(credentials.email)) {
        throw new Error('validation.email.invalid')
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(credentials.password)
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0])
      }

      await authStore.signup(credentials)
      notifySuccess('auth.signup.success')
    } catch (err) {
      error.value = err.message
      notifyApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Verify email with token
   * @param {string} email - User email
   * @param {string} token - Verification token
   * @returns {Promise<void>}
   */
  async function verifyEmail(email, token) {
    error.value = null
    isLoading.value = true

    try {
      await authStore.verifyEmail(email, token)
      notifySuccess('auth.verify.success')
    } catch (err) {
      error.value = err.message
      notifyError(err.message || 'auth.verify.error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Resend verification email
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  async function resendVerification(email) {
    error.value = null
    isLoading.value = true

    try {
      await authStore.resendVerification(email)
      notifySuccess('auth.verify.resendSuccess')
    } catch (err) {
      error.value = err.message
      notifyApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise<void>}
   */
  async function login(credentials) {
    error.value = null
    isLoading.value = true

    try {
      await authStore.login(credentials)
      notifySuccess('auth.login.success')

      // Redirect to intended destination or dashboard
      const redirect = router.currentRoute.value.query.redirect
      router.push(redirect || { name: 'dashboard' })
    } catch (err) {
      error.value = err.message
      notifyApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  async function requestPasswordReset(email) {
    error.value = null
    isLoading.value = true

    try {
      await authStore.requestPasswordReset(email)
      notifySuccess('auth.passwordReset.otpSent')
    } catch (err) {
      error.value = err.message
      notifyApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Verify OTP code
   * @param {string} email - User email
   * @param {string} otp - OTP code
   * @returns {Promise<void>}
   */
  async function verifyOTP(email, otp) {
    error.value = null
    isLoading.value = true

    try {
      await authStore.verifyOTP(email, otp)
      notifySuccess('auth.passwordReset.verified')
    } catch (err) {
      error.value = err.message
      notifyApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reset password with verified OTP
   * @param {string} email - User email
   * @param {string} otp - Verified OTP
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async function resetPassword(email, otp, newPassword) {
    error.value = null
    isLoading.value = true

    try {
      // Validate password strength
      const passwordValidation = validatePasswordStrength(newPassword)
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0])
      }

      await authStore.resetPassword(email, otp, newPassword)
      notifySuccess('auth.passwordReset.success')
      router.push({ name: 'login' })
    } catch (err) {
      error.value = err.message
      notifyApiError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout user
   */
  function logout() {
    authStore.logout()
    router.push({ name: 'login' })
  }

  return {
    // State
    isLoading,
    error,
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isAdmin: computed(() => authStore.isAdmin),
    user: computed(() => authStore.user),

    // Validation
    isValidEmail,
    validatePasswordStrength,

    // Actions
    signup,
    verifyEmail,
    resendVerification,
    login,
    requestPasswordReset,
    verifyOTP,
    resetPassword,
    logout
  }
}
