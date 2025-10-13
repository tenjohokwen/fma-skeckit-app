/**
 * useNotifications.js
 *
 * Composable for displaying notifications using Quasar's Notify plugin.
 * Provides consistent notification styling and behavior across the app.
 *
 * Per constitution: Composition API composables for reusable logic
 */

import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

export function useNotifications() {
  const $q = useQuasar()
  const { t } = useI18n()

  /**
   * Show success notification
   * @param {string} message - Message to display (can be i18n key)
   * @param {Object} options - Additional Quasar notify options
   */
  function notifySuccess(message, options = {}) {
    $q.notify({
      type: 'positive',
      message: t(message) || message,
      icon: 'check_circle',
      position: 'top',
      timeout: 3000,
      ...options
    })
  }

  /**
   * Show error notification
   * @param {string} message - Message to display (can be i18n key)
   * @param {Object} options - Additional Quasar notify options
   */
  function notifyError(message, options = {}) {
    $q.notify({
      type: 'negative',
      message: t(message) || message,
      icon: 'error',
      position: 'top',
      timeout: 5000,
      ...options
    })
  }

  /**
   * Show warning notification
   * @param {string} message - Message to display (can be i18n key)
   * @param {Object} options - Additional Quasar notify options
   */
  function notifyWarning(message, options = {}) {
    $q.notify({
      type: 'warning',
      message: t(message) || message,
      icon: 'warning',
      position: 'top',
      timeout: 4000,
      textColor: 'dark',
      ...options
    })
  }

  /**
   * Show info notification
   * @param {string} message - Message to display (can be i18n key)
   * @param {Object} options - Additional Quasar notify options
   */
  function notifyInfo(message, options = {}) {
    $q.notify({
      type: 'info',
      message: t(message) || message,
      icon: 'info',
      position: 'top',
      timeout: 3000,
      ...options
    })
  }

  /**
   * Show loading notification
   * Returns a function to dismiss the notification
   * @param {string} message - Message to display
   * @returns {Function} Dismiss function
   */
  function notifyLoading(message = 'common.loading') {
    const dismiss = $q.notify({
      type: 'ongoing',
      message: t(message) || message,
      spinner: true,
      position: 'top',
      timeout: 0 // Don't auto-dismiss
    })

    return dismiss
  }

  /**
   * Show notification from API error response
   * Extracts message from ApiError or shows generic error
   * @param {Error|ApiError} error - Error object
   */
  function notifyApiError(error) {
    const message = error.msgKey || error.message || 'error.unknown'
    notifyError(message)
  }

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyLoading,
    notifyApiError
  }
}
