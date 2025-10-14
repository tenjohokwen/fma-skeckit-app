/**
 * useNotifications.spec.js
 *
 * Tests for useNotifications composable
 * Per constitution: Plain JavaScript tests with Vitest
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useNotifications } from 'src/composables/useNotifications'

// Mock Quasar
const mockNotify = vi.fn()
vi.mock('quasar', () => ({
  useQuasar: () => ({
    notify: mockNotify
  })
}))

// Mock vue-i18n
const mockT = vi.fn((key) => key)
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: mockT
  })
}))

describe('useNotifications', () => {
  beforeEach(() => {
    mockNotify.mockClear()
    mockT.mockClear()
  })

  describe('notifySuccess', () => {
    it('calls Quasar notify with success configuration', () => {
      const { notifySuccess } = useNotifications()

      notifySuccess('Success message')

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'positive',
        message: 'Success message',
        icon: 'check_circle',
        position: 'top',
        timeout: 3000
      })
    })

    it('translates i18n keys', () => {
      mockT.mockReturnValue('Translated success message')
      const { notifySuccess } = useNotifications()

      notifySuccess('success.key')

      expect(mockT).toHaveBeenCalledWith('success.key')
      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Translated success message'
        })
      )
    })

    it('accepts additional options', () => {
      const { notifySuccess } = useNotifications()

      notifySuccess('Success', { timeout: 5000, position: 'bottom' })

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'positive',
        message: 'Success',
        icon: 'check_circle',
        position: 'bottom',
        timeout: 5000
      })
    })

    it('uses default timeout of 3000ms', () => {
      const { notifySuccess } = useNotifications()

      notifySuccess('Success')

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 3000
        })
      )
    })
  })

  describe('notifyError', () => {
    it('calls Quasar notify with error configuration', () => {
      const { notifyError } = useNotifications()

      notifyError('Error message')

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'Error message',
        icon: 'error',
        position: 'top',
        timeout: 5000
      })
    })

    it('translates i18n keys', () => {
      mockT.mockReturnValue('Translated error message')
      const { notifyError } = useNotifications()

      notifyError('error.key')

      expect(mockT).toHaveBeenCalledWith('error.key')
      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Translated error message'
        })
      )
    })

    it('accepts additional options', () => {
      const { notifyError } = useNotifications()

      notifyError('Error', { timeout: 10000, position: 'bottom-right' })

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'Error',
        icon: 'error',
        position: 'bottom-right',
        timeout: 10000
      })
    })

    it('uses default timeout of 5000ms', () => {
      const { notifyError } = useNotifications()

      notifyError('Error')

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 5000
        })
      )
    })
  })

  describe('notifyWarning', () => {
    it('calls Quasar notify with warning configuration', () => {
      const { notifyWarning } = useNotifications()

      notifyWarning('Warning message')

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'warning',
        message: 'Warning message',
        icon: 'warning',
        position: 'top',
        timeout: 4000,
        textColor: 'dark'
      })
    })

    it('translates i18n keys', () => {
      mockT.mockReturnValue('Translated warning message')
      const { notifyWarning } = useNotifications()

      notifyWarning('warning.key')

      expect(mockT).toHaveBeenCalledWith('warning.key')
      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Translated warning message'
        })
      )
    })

    it('uses dark text color', () => {
      const { notifyWarning } = useNotifications()

      notifyWarning('Warning')

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          textColor: 'dark'
        })
      )
    })

    it('uses default timeout of 4000ms', () => {
      const { notifyWarning } = useNotifications()

      notifyWarning('Warning')

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 4000
        })
      )
    })
  })

  describe('notifyInfo', () => {
    it('calls Quasar notify with info configuration', () => {
      const { notifyInfo } = useNotifications()

      notifyInfo('Info message')

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'info',
        message: 'Info message',
        icon: 'info',
        position: 'top',
        timeout: 3000
      })
    })

    it('translates i18n keys', () => {
      mockT.mockReturnValue('Translated info message')
      const { notifyInfo } = useNotifications()

      notifyInfo('info.key')

      expect(mockT).toHaveBeenCalledWith('info.key')
      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Translated info message'
        })
      )
    })

    it('uses default timeout of 3000ms', () => {
      const { notifyInfo } = useNotifications()

      notifyInfo('Info')

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 3000
        })
      )
    })
  })

  describe('notifyLoading', () => {
    it('calls Quasar notify with loading configuration', () => {
      const { notifyLoading } = useNotifications()

      notifyLoading('Loading message')

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'ongoing',
        message: 'Loading message',
        spinner: true,
        position: 'top',
        timeout: 0
      })
    })

    it('uses default message when not provided', () => {
      const { notifyLoading } = useNotifications()

      notifyLoading()

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'common.loading'
        })
      )
    })

    it('returns dismiss function', () => {
      const mockDismiss = vi.fn()
      mockNotify.mockReturnValue(mockDismiss)

      const { notifyLoading } = useNotifications()
      const dismiss = notifyLoading('Loading')

      expect(dismiss).toBe(mockDismiss)
    })

    it('has zero timeout for ongoing notification', () => {
      const { notifyLoading } = useNotifications()

      notifyLoading('Loading')

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 0
        })
      )
    })

    it('shows spinner', () => {
      const { notifyLoading } = useNotifications()

      notifyLoading('Loading')

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          spinner: true
        })
      )
    })
  })

  describe('notifyApiError', () => {
    it('extracts message from error object', () => {
      const { notifyApiError } = useNotifications()
      const error = new Error('API Error')

      notifyApiError(error)

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'negative',
          message: 'API Error'
        })
      )
    })

    it('uses msgKey if available', () => {
      const { notifyApiError } = useNotifications()
      const error = { msgKey: 'error.validation', message: 'Validation failed' }

      notifyApiError(error)

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'error.validation'
        })
      )
    })

    it('falls back to generic error message', () => {
      const { notifyApiError } = useNotifications()
      const error = {}

      notifyApiError(error)

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'error.unknown'
        })
      )
    })

    it('prefers msgKey over message', () => {
      const { notifyApiError } = useNotifications()
      const error = { msgKey: 'error.specific', message: 'Generic message' }

      notifyApiError(error)

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'error.specific'
        })
      )
    })
  })

  describe('Translation Fallback', () => {
    it('uses original message if translation returns empty', () => {
      mockT.mockReturnValue('')
      const { notifySuccess } = useNotifications()

      notifySuccess('Fallback message')

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Fallback message'
        })
      )
    })

    it('uses original message if translation returns undefined', () => {
      mockT.mockReturnValue(undefined)
      const { notifyError } = useNotifications()

      notifyError('Fallback error')

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Fallback error'
        })
      )
    })
  })

  describe('Options Override', () => {
    it('allows overriding default icon', () => {
      const { notifySuccess } = useNotifications()

      notifySuccess('Success', { icon: 'thumb_up' })

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'thumb_up'
        })
      )
    })

    it('allows overriding default position', () => {
      const { notifyError } = useNotifications()

      notifyError('Error', { position: 'bottom-right' })

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          position: 'bottom-right'
        })
      )
    })

    it('allows adding additional properties', () => {
      const { notifyInfo } = useNotifications()

      notifyInfo('Info', { actions: [{ label: 'Dismiss' }] })

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          actions: [{ label: 'Dismiss' }]
        })
      )
    })
  })

  describe('Multiple Notifications', () => {
    it('can show multiple notifications', () => {
      const { notifySuccess, notifyError, notifyWarning } = useNotifications()

      notifySuccess('Success 1')
      notifyError('Error 1')
      notifyWarning('Warning 1')

      expect(mockNotify).toHaveBeenCalledTimes(3)
    })

    it('maintains separate configurations for each notification type', () => {
      const { notifySuccess, notifyError } = useNotifications()

      notifySuccess('Success')
      notifyError('Error')

      expect(mockNotify).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ type: 'positive' })
      )
      expect(mockNotify).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ type: 'negative' })
      )
    })
  })

  describe('Edge Cases', () => {
    it('handles empty message', () => {
      const { notifySuccess } = useNotifications()

      notifySuccess('')

      expect(mockNotify).toHaveBeenCalled()
    })

    it('handles null message', () => {
      const { notifyError } = useNotifications()

      notifyError(null)

      expect(mockNotify).toHaveBeenCalled()
    })

    it('handles undefined message', () => {
      const { notifyWarning } = useNotifications()

      notifyWarning(undefined)

      expect(mockNotify).toHaveBeenCalled()
    })
  })
})
