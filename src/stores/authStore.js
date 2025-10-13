/**
 * authStore.js
 *
 * Pinia store for authentication state management.
 * Handles user authentication, token management, and session persistence.
 *
 * Per constitution: Use Pinia for state management, Vue 3 Composition API style.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from 'src/services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const tokenExpiry = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Computed
  const isAuthenticated = computed(() => {
    return !!token.value && !!user.value
  })

  const isTokenValid = computed(() => {
    if (!tokenExpiry.value) return false
    return Date.now() < tokenExpiry.value
  })

  const isAdmin = computed(() => {
    return user.value?.role === 'ROLE_ADMIN'
  })

  const isVerified = computed(() => {
    return user.value?.status === 'VERIFIED'
  })

  // Actions

  /**
   * Initialize auth state from localStorage
   */
  function init() {
    const savedToken = localStorage.getItem('auth_token')
    const savedExpiry = localStorage.getItem('auth_expiry')
    const savedUser = localStorage.getItem('auth_user')

    if (savedToken && savedExpiry && savedUser) {
      const expiry = parseInt(savedExpiry)
      if (Date.now() < expiry) {
        token.value = savedToken
        tokenExpiry.value = expiry
        user.value = JSON.parse(savedUser)
      } else {
        clearAuth()
      }
    }
  }

  /**
   * Sign up a new user
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} Response data
   */
  async function signup(credentials) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('auth.signup', credentials)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Verify email with token
   * @param {string} email - User email
   * @param {string} verificationToken - Verification token
   * @returns {Promise<Object>} Response data
   */
  async function verifyEmail(email, verificationToken) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('auth.verifyEmail', {
        email,
        token: verificationToken
      })
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Resend verification email
   * @param {string} email - User email
   * @returns {Promise<Object>} Response data
   */
  async function resendVerification(email) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('auth.resendVerification', { email })
      return response.data
    } catch (err) {
      error.value = err.message
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
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('auth.login', credentials)

      // Store auth data
      if (response.token) {
        setAuth(response.token, response.data)
      }

      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Response data
   */
  async function requestPasswordReset(email) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('auth.requestPasswordReset', { email })
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Verify OTP for password reset
   * @param {string} email - User email
   * @param {string} otp - OTP code
   * @returns {Promise<Object>} Response data
   */
  async function verifyOTP(email, otp) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('auth.verifyOTP', { email, otp })
      return response.data
    } catch (err) {
      error.value = err.message
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
   * @returns {Promise<Object>} Response data
   */
  async function resetPassword(email, otp, newPassword) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('auth.resetPassword', {
        email,
        otp,
        newPassword
      })
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout user
   */
  function logout() {
    clearAuth()
  }

  /**
   * Set authentication data
   * @param {Object} tokenData - Token object from API
   * @param {Object} userData - User data object
   */
  function setAuth(tokenData, userData) {
    token.value = tokenData.value
    tokenExpiry.value = tokenData.ttl
    user.value = userData

    // Persist to localStorage
    localStorage.setItem('auth_token', tokenData.value)
    localStorage.setItem('auth_expiry', tokenData.ttl.toString())
    localStorage.setItem('auth_user', JSON.stringify(userData))
  }

  /**
   * Clear authentication data
   */
  function clearAuth() {
    token.value = null
    tokenExpiry.value = null
    user.value = null

    // Clear localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_expiry')
    localStorage.removeItem('auth_user')
  }

  /**
   * Check if token needs refresh and refresh if needed
   * @returns {Promise<boolean>} True if token was refreshed
   */
  async function checkAndRefreshToken() {
    if (!token.value || !tokenExpiry.value) {
      return false
    }

    // Refresh if token expires in less than 5 minutes
    const fiveMinutes = 5 * 60 * 1000
    const timeUntilExpiry = tokenExpiry.value - Date.now()

    if (timeUntilExpiry < fiveMinutes && timeUntilExpiry > 0) {
      try {
        // Make an authenticated request to refresh the token
        // The API will return a new token in the response
        const response = await api.post('metadata.getById', {
          caseId: '__refresh__' // Special case ID to trigger token refresh
        })

        if (response.token) {
          setAuth(response.token, user.value)
          return true
        }
      } catch (err) {
        console.warn('Token refresh failed:', err)
        clearAuth()
      }
    } else if (timeUntilExpiry <= 0) {
      clearAuth()
      return false
    }

    return false
  }

  // Initialize on store creation
  init()

  return {
    // State
    user,
    token,
    tokenExpiry,
    isLoading,
    error,

    // Computed
    isAuthenticated,
    isTokenValid,
    isAdmin,
    isVerified,

    // Actions
    signup,
    verifyEmail,
    resendVerification,
    login,
    requestPasswordReset,
    verifyOTP,
    resetPassword,
    logout,
    setAuth,
    clearAuth,
    checkAndRefreshToken
  }
})
