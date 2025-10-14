/**
 * useAuth-US2.spec.js
 *
 * Tests for useAuth composable - US2 Login & Password Reset
 * Per constitution: Plain JavaScript tests with Vitest + Vue Test Utils
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from 'src/composables/useAuth'
import { useAuthStore } from 'src/stores/authStore'
import { createPinia, setActivePinia } from 'pinia'

// Mock router
const mockPush = vi.fn()
const mockCurrentRoute = {
  value: {
    query: {}
  }
}
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
    currentRoute: mockCurrentRoute
  })
}))

// Mock notifications
const mockNotifySuccess = vi.fn()
const mockNotifyError = vi.fn()
const mockNotifyApiError = vi.fn()
vi.mock('src/composables/useNotifications', () => ({
  useNotifications: () => ({
    notifySuccess: mockNotifySuccess,
    notifyError: mockNotifyError,
    notifyApiError: mockNotifyApiError
  })
}))

describe('useAuth - US2 Login & Password Reset', () => {
  let authStore

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()

    // Reset mocks
    mockPush.mockReset()
    mockNotifySuccess.mockReset()
    mockNotifyError.mockReset()
    mockNotifyApiError.mockReset()
    mockCurrentRoute.value.query = {}
  })

  describe('Login Function', () => {
    beforeEach(() => {
      authStore.login = vi.fn().mockResolvedValue({})
    })

    it('calls authStore.login with credentials', async () => {
      const { login } = useAuth()
      const credentials = {
        email: 'test@example.com',
        password: 'ValidPass123!'
      }

      await login(credentials)

      expect(authStore.login).toHaveBeenCalledWith(credentials)
    })

    it('sets isLoading to true during login', async () => {
      const { login, isLoading } = useAuth()

      const loginPromise = login({
        email: 'test@example.com',
        password: 'ValidPass123!'
      })

      expect(isLoading.value).toBe(true)
      await loginPromise
    })

    it('sets isLoading to false after successful login', async () => {
      const { login, isLoading } = useAuth()

      await login({
        email: 'test@example.com',
        password: 'ValidPass123!'
      })

      expect(isLoading.value).toBe(false)
    })

    it('shows success notification on successful login', async () => {
      const { login } = useAuth()

      await login({
        email: 'test@example.com',
        password: 'ValidPass123!'
      })

      expect(mockNotifySuccess).toHaveBeenCalledWith('auth.login.success')
    })

    it('navigates to dashboard after successful login', async () => {
      const { login } = useAuth()

      await login({
        email: 'test@example.com',
        password: 'ValidPass123!'
      })

      expect(mockPush).toHaveBeenCalledWith({ name: 'dashboard' })
    })

    it('navigates to redirect URL if present in query', async () => {
      mockCurrentRoute.value.query = { redirect: '/app/search' }
      const { login } = useAuth()

      await login({
        email: 'test@example.com',
        password: 'ValidPass123!'
      })

      expect(mockPush).toHaveBeenCalledWith('/app/search')
    })

    it('handles login failure', async () => {
      authStore.login = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
      const { login } = useAuth()

      await expect(login({
        email: 'test@example.com',
        password: 'wrongpass'
      })).rejects.toThrow('Invalid credentials')
    })

    it('shows error notification on login failure', async () => {
      authStore.login = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
      const { login } = useAuth()

      try {
        await login({
          email: 'test@example.com',
          password: 'wrongpass'
        })
      } catch (err) {
        expect(mockNotifyApiError).toHaveBeenCalled()
      }
    })

    it('sets error message on login failure', async () => {
      const errorMessage = 'Account locked'
      authStore.login = vi.fn().mockRejectedValue(new Error(errorMessage))
      const { login, error } = useAuth()

      try {
        await login({
          email: 'test@example.com',
          password: 'ValidPass123!'
        })
      } catch (err) {
        expect(error.value).toBe(errorMessage)
      }
    })

    it('sets isLoading to false after login failure', async () => {
      authStore.login = vi.fn().mockRejectedValue(new Error('Network error'))
      const { login, isLoading } = useAuth()

      try {
        await login({
          email: 'test@example.com',
          password: 'ValidPass123!'
        })
      } catch (err) {
        expect(isLoading.value).toBe(false)
      }
    })

    it('clears previous error before login', async () => {
      const { login, error } = useAuth()

      error.value = 'Previous error'

      await login({
        email: 'test@example.com',
        password: 'ValidPass123!'
      })

      expect(error.value).toBeNull()
    })
  })

  describe('Request Password Reset Function', () => {
    beforeEach(() => {
      authStore.requestPasswordReset = vi.fn().mockResolvedValue({})
    })

    it('calls authStore.requestPasswordReset with email', async () => {
      const { requestPasswordReset } = useAuth()

      await requestPasswordReset('test@example.com')

      expect(authStore.requestPasswordReset).toHaveBeenCalledWith('test@example.com')
    })

    it('sets isLoading to true during request', async () => {
      const { requestPasswordReset, isLoading } = useAuth()

      const resetPromise = requestPasswordReset('test@example.com')
      expect(isLoading.value).toBe(true)
      await resetPromise
    })

    it('sets isLoading to false after successful request', async () => {
      const { requestPasswordReset, isLoading } = useAuth()

      await requestPasswordReset('test@example.com')

      expect(isLoading.value).toBe(false)
    })

    it('shows success notification on successful request', async () => {
      const { requestPasswordReset } = useAuth()

      await requestPasswordReset('test@example.com')

      expect(mockNotifySuccess).toHaveBeenCalledWith('auth.passwordReset.otpSent')
    })

    it('handles request failure', async () => {
      authStore.requestPasswordReset = vi.fn().mockRejectedValue(new Error('User not found'))
      const { requestPasswordReset } = useAuth()

      await expect(requestPasswordReset('test@example.com')).rejects.toThrow('User not found')
    })

    it('sets error message on request failure', async () => {
      const errorMessage = 'Rate limit exceeded'
      authStore.requestPasswordReset = vi.fn().mockRejectedValue(new Error(errorMessage))
      const { requestPasswordReset, error } = useAuth()

      try {
        await requestPasswordReset('test@example.com')
      } catch (err) {
        expect(error.value).toBe(errorMessage)
      }
    })
  })

  describe('Verify OTP Function', () => {
    beforeEach(() => {
      authStore.verifyOTP = vi.fn().mockResolvedValue({})
    })

    it('calls authStore.verifyOTP with email and OTP', async () => {
      const { verifyOTP } = useAuth()

      await verifyOTP('test@example.com', '123456')

      expect(authStore.verifyOTP).toHaveBeenCalledWith('test@example.com', '123456')
    })

    it('sets isLoading to true during verification', async () => {
      const { verifyOTP, isLoading } = useAuth()

      const verifyPromise = verifyOTP('test@example.com', '123456')
      expect(isLoading.value).toBe(true)
      await verifyPromise
    })

    it('sets isLoading to false after successful verification', async () => {
      const { verifyOTP, isLoading } = useAuth()

      await verifyOTP('test@example.com', '123456')

      expect(isLoading.value).toBe(false)
    })

    it('shows success notification on successful verification', async () => {
      const { verifyOTP } = useAuth()

      await verifyOTP('test@example.com', '123456')

      expect(mockNotifySuccess).toHaveBeenCalledWith('auth.passwordReset.verified')
    })

    it('handles verification failure', async () => {
      authStore.verifyOTP = vi.fn().mockRejectedValue(new Error('Invalid OTP'))
      const { verifyOTP } = useAuth()

      await expect(verifyOTP('test@example.com', 'wrong')).rejects.toThrow('Invalid OTP')
    })

    it('sets error message on verification failure', async () => {
      const errorMessage = 'OTP expired'
      authStore.verifyOTP = vi.fn().mockRejectedValue(new Error(errorMessage))
      const { verifyOTP, error } = useAuth()

      try {
        await verifyOTP('test@example.com', '123456')
      } catch (err) {
        expect(error.value).toBe(errorMessage)
      }
    })
  })

  describe('Reset Password Function', () => {
    beforeEach(() => {
      authStore.resetPassword = vi.fn().mockResolvedValue({})
    })

    it('calls authStore.resetPassword with email, OTP, and new password', async () => {
      const { resetPassword } = useAuth()

      await resetPassword('test@example.com', '123456', 'NewValidPass123!')

      expect(authStore.resetPassword).toHaveBeenCalledWith('test@example.com', '123456', 'NewValidPass123!')
    })

    it('validates password strength before reset', async () => {
      const { resetPassword } = useAuth()

      await expect(resetPassword('test@example.com', '123456', 'weak')).rejects.toThrow()
    })

    it('sets isLoading to true during reset', async () => {
      const { resetPassword, isLoading } = useAuth()

      const resetPromise = resetPassword('test@example.com', '123456', 'StrongPass123!')
      expect(isLoading.value).toBe(true)
      await resetPromise
    })

    it('sets isLoading to false after successful reset', async () => {
      const { resetPassword, isLoading } = useAuth()

      await resetPassword('test@example.com', '123456', 'StrongPass123!')

      expect(isLoading.value).toBe(false)
    })

    it('shows success notification on successful reset', async () => {
      const { resetPassword } = useAuth()

      await resetPassword('test@example.com', '123456', 'StrongPass123!')

      expect(mockNotifySuccess).toHaveBeenCalledWith('auth.passwordReset.success')
    })

    it('navigates to login after successful reset', async () => {
      const { resetPassword } = useAuth()

      await resetPassword('test@example.com', '123456', 'StrongPass123!')

      expect(mockPush).toHaveBeenCalledWith({ name: 'login' })
    })

    it('handles reset failure', async () => {
      authStore.resetPassword = vi.fn().mockRejectedValue(new Error('OTP invalid'))
      const { resetPassword } = useAuth()

      await expect(resetPassword('test@example.com', '123456', 'StrongPass123!')).rejects.toThrow('OTP invalid')
    })

    it('sets error message on reset failure', async () => {
      const errorMessage = 'Token expired'
      authStore.resetPassword = vi.fn().mockRejectedValue(new Error(errorMessage))
      const { resetPassword, error } = useAuth()

      try {
        await resetPassword('test@example.com', '123456', 'StrongPass123!')
      } catch (err) {
        expect(error.value).toBe(errorMessage)
      }
    })

    it('rejects weak passwords', async () => {
      const { resetPassword } = useAuth()

      const weakPasswords = ['short', 'nouppercase123!', 'NOLOWERCASE123!', 'NoNumber!', 'NoSpecial123']

      for (const weakPass of weakPasswords) {
        await expect(resetPassword('test@example.com', '123456', weakPass)).rejects.toThrow()
      }
    })
  })

  describe('Logout Function', () => {
    it('calls authStore.logout', () => {
      authStore.logout = vi.fn()
      const { logout } = useAuth()

      logout()

      expect(authStore.logout).toHaveBeenCalled()
    })

    it('navigates to login after logout', () => {
      authStore.logout = vi.fn()
      const { logout } = useAuth()

      logout()

      expect(mockPush).toHaveBeenCalledWith({ name: 'login' })
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('handles network timeout during login', async () => {
      authStore.login = vi.fn().mockRejectedValue(new Error('Network timeout'))
      const { login } = useAuth()

      await expect(login({
        email: 'test@example.com',
        password: 'ValidPass123!'
      })).rejects.toThrow('Network timeout')
    })

    it('handles empty email in password reset request', async () => {
      authStore.requestPasswordReset = vi.fn().mockRejectedValue(new Error('Email required'))
      const { requestPasswordReset } = useAuth()

      await expect(requestPasswordReset('')).rejects.toThrow('Email required')
    })

    it('handles invalid OTP format', async () => {
      authStore.verifyOTP = vi.fn().mockRejectedValue(new Error('Invalid OTP format'))
      const { verifyOTP } = useAuth()

      await expect(verifyOTP('test@example.com', '12')).rejects.toThrow('Invalid OTP format')
    })

    it('handles password with only spaces', async () => {
      const { resetPassword } = useAuth()

      await expect(resetPassword('test@example.com', '123456', '        ')).rejects.toThrow()
    })
  })

  describe('Complete Password Reset Flow', () => {
    beforeEach(() => {
      authStore.requestPasswordReset = vi.fn().mockResolvedValue({})
      authStore.verifyOTP = vi.fn().mockResolvedValue({})
      authStore.resetPassword = vi.fn().mockResolvedValue({})
    })

    it('completes full password reset flow', async () => {
      const { requestPasswordReset, verifyOTP, resetPassword } = useAuth()

      // Step 1: Request OTP
      await requestPasswordReset('test@example.com')
      expect(mockNotifySuccess).toHaveBeenCalledWith('auth.passwordReset.otpSent')

      // Step 2: Verify OTP
      await verifyOTP('test@example.com', '123456')
      expect(mockNotifySuccess).toHaveBeenCalledWith('auth.passwordReset.verified')

      // Step 3: Reset password
      await resetPassword('test@example.com', '123456', 'NewStrongPass123!')
      expect(mockNotifySuccess).toHaveBeenCalledWith('auth.passwordReset.success')
      expect(mockPush).toHaveBeenCalledWith({ name: 'login' })
    })
  })
})
