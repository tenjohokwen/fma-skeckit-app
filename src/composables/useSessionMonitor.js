/**
 * useSessionMonitor.js
 *
 * Monitors authentication token expiration and triggers warnings/logout.
 * Handles session extension and multi-tab synchronization.
 *
 * Feature 005: Session Extension with Token Refresh Warning
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import { useRouter } from 'vue-router'
import { api } from 'src/services/api'

const WARNING_THRESHOLD = 60 // seconds before expiration to show warning
const UPDATE_INTERVAL = 1000 // 1 second

export function useSessionMonitor() {
  const authStore = useAuthStore()
  const router = useRouter()

  // State
  const isWarningVisible = ref(false)
  const timeRemaining = ref(0) // seconds
  const isExtending = ref(false)

  // Timers
  let updateTimerId = null
  let warningTimerId = null
  let logoutTimerId = null

  /**
   * Calculate seconds until token expires
   */
  function calculateTimeRemaining() {
    const ttl = authStore.tokenTTL
    if (!ttl) return 0

    const now = Date.now()
    const remaining = Math.max(0, Math.floor((ttl - now) / 1000))
    return remaining
  }

  /**
   * Update countdown every second
   */
  function updateCountdown() {
    timeRemaining.value = calculateTimeRemaining()

    if (timeRemaining.value === 0 && authStore.isAuthenticated) {
      handleExpiration()
    }
  }

  /**
   * Show warning dialog
   */
  function showWarning() {
    if (!authStore.isAuthenticated) return
    if (isWarningVisible.value) return // Already showing

    console.log('[SessionMonitor] Showing expiration warning')
    isWarningVisible.value = true
  }

  /**
   * Handle token expiration - auto logout
   */
  function handleExpiration() {
    console.log('[SessionMonitor] Token expired - logging out')

    stopMonitoring()
    authStore.logout()
    router.push({
      name: 'login',
      query: { expired: 'true' }
    })
  }

  /**
   * Extend session by calling ping endpoint
   */
  async function extendSession() {
    if (isExtending.value) return // Prevent duplicate requests

    isExtending.value = true

    try {
      console.log('[SessionMonitor] Extending session...')

      await api.post('auth.ping', {})

      // Token automatically updated by api.js
      // Reset timers will be triggered by token-refreshed event

      isWarningVisible.value = false
      console.log('[SessionMonitor] Session extended successfully')

      return { success: true }
    } catch (error) {
      console.error('[SessionMonitor] Failed to extend session:', error)
      return {
        success: false,
        error: error.message || 'Failed to extend session'
      }
    } finally {
      isExtending.value = false
    }
  }

  /**
   * Start monitoring token expiration
   */
  function startMonitoring() {
    if (!authStore.isAuthenticated) {
      console.log('[SessionMonitor] Not authenticated, skipping monitor')
      return
    }

    stopMonitoring() // Clear existing timers

    const remaining = calculateTimeRemaining()
    console.log(`[SessionMonitor] Starting monitor. Token expires in ${remaining}s`)

    if (remaining <= 0) {
      handleExpiration()
      return
    }

    // Update countdown every second
    updateTimerId = setInterval(updateCountdown, UPDATE_INTERVAL)

    // Schedule warning
    const warningDelay = Math.max(0, (remaining - WARNING_THRESHOLD) * 1000)
    warningTimerId = setTimeout(showWarning, warningDelay)

    // Schedule auto-logout
    const logoutDelay = remaining * 1000
    logoutTimerId = setTimeout(handleExpiration, logoutDelay)

    // Initial update
    updateCountdown()
  }

  /**
   * Stop monitoring
   * @param {boolean} clearWarning - Whether to close the warning dialog (default: true)
   */
  function stopMonitoring(clearWarning = true) {
    // Clear all timers
    if (updateTimerId) {
      clearInterval(updateTimerId)
      updateTimerId = null
    }
    if (warningTimerId) {
      clearTimeout(warningTimerId)
      warningTimerId = null
    }
    if (logoutTimerId) {
      clearTimeout(logoutTimerId)
      logoutTimerId = null
    }

    // Only close warning if requested (allows timer reset without closing dialog)
    if (clearWarning) {
      isWarningVisible.value = false
    }

    timeRemaining.value = 0
  }

  /**
   * Handle token refresh from other sources (API calls, other tabs)
   */
  function handleTokenRefresh(event) {
    const newTTL = event.detail?.ttl
    const newToken = event.detail?.value

    if (!newTTL || !newToken) {
      console.warn('[SessionMonitor] Token refresh event missing ttl or value')
      return
    }

    console.log('[SessionMonitor] Token refreshed, restarting monitor')
    console.log('[SessionMonitor] New TTL:', new Date(newTTL))
    console.log('[SessionMonitor] Time until expiration:', Math.floor((newTTL - Date.now()) / 1000), 'seconds')

    // Update the authStore with the new token and TTL
    // This ensures authStore.tokenTTL and authStore.token are in sync with localStorage
    authStore.updateToken({
      value: newToken,
      ttl: newTTL
    })

    // Close warning if open (session successfully extended)
    isWarningVisible.value = false

    // IMPORTANT: Stop all existing timers before starting new ones
    // This ensures old timers don't interfere with new schedule
    // Don't clear the warning flag since we already handled it above
    stopMonitoring(false)

    // Restart monitoring with new TTL from authStore
    // calculateTimeRemaining() will now use the updated authStore.tokenTTL
    startMonitoring()
  }

  /**
   * Handle logout from other tabs
   */
  function handleStorageChange(event) {
    if (event.key === 'auth_token' && !event.newValue) {
      // Token removed in another tab - logout this tab too
      console.log('[SessionMonitor] Token removed in another tab, logging out')
      stopMonitoring()
      authStore.logout()
      router.push({ name: 'login' })
    }
  }

  /**
   * Format time remaining as MM:SS
   */
  const formattedTimeRemaining = computed(() => {
    const minutes = Math.floor(timeRemaining.value / 60)
    const seconds = timeRemaining.value % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  })

  // Lifecycle
  onMounted(() => {
    // Listen for token refresh events
    window.addEventListener('token-refreshed', handleTokenRefresh)
    window.addEventListener('storage', handleStorageChange)

    // Start monitoring if authenticated
    if (authStore.isAuthenticated) {
      startMonitoring()
    }
  })

  onUnmounted(() => {
    window.removeEventListener('token-refreshed', handleTokenRefresh)
    window.removeEventListener('storage', handleStorageChange)
    stopMonitoring()
  })

  // Watch for authentication changes
  watch(() => authStore.isAuthenticated, (isAuth) => {
    if (isAuth) {
      startMonitoring()
    } else {
      stopMonitoring()
    }
  })

  return {
    // State
    isWarningVisible,
    timeRemaining,
    formattedTimeRemaining,
    isExtending,

    // Methods
    startMonitoring,
    stopMonitoring,
    extendSession,
    handleExpiration
  }
}
