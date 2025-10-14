/**
 * useAuth-US1.spec.js
 *
 * Tests for useAuth composable - US1 Registration & Email Verification
 * Per constitution: Plain JavaScript tests with Vitest + Vue Test Utils
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAuth } from 'src/composables/useAuth'
import { useAuthStore } from 'src/stores/authStore'
import { useNotifications } from 'src/composables/useNotifications'
import { createPinia, setActivePinia } from 'pinia'

// Mock router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
    currentRoute: {
      value: {
        query: {}
      }
    }
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

describe('useAuth - US1 Registration & Email Verification', () => {
  let authStore

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()

    // Reset mocks
    mockPush.mockReset()
    mockNotifySuccess.mockReset()
    mockNotifyError.mockReset()
    mockNotifyApiError.mockReset()
  })

  describe('Email Validation', () => {
    it('validates correct email format', () => {
      const { isValidEmail } = useAuth()

      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('test+tag@example.com')).toBe(true)
    })

    it('rejects invalid email format', () => {
      const { isValidEmail } = useAuth()

      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test @example.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })

    it('handles edge case emails', () => {
      const { isValidEmail } = useAuth()

      expect(isValidEmail('a@b.c')).toBe(true)
      expect(isValidEmail('test.@example.com')).toBe(true)
      expect(isValidEmail('.test@example.com')).toBe(true)
    })
  })

  describe('Password Strength Validation', () => {
    it('validates strong password', () => {
      const { validatePasswordStrength } = useAuth()
      const result = validatePasswordStrength('StrongPass123!')

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('rejects password shorter than 8 characters', () => {
      const { validatePasswordStrength } = useAuth()
      const result = validatePasswordStrength('Short1!')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('validation.password.minLength')
    })

    it('rejects password without uppercase letter', () => {
      const { validatePasswordStrength } = useAuth()
      const result = validatePasswordStrength('lowercase123!')

      expect(result.isValid).toBe(false)
      expect(result.errors.some(err => err.includes('uppercase'))).toBe(true)
    })

    it('rejects password without lowercase letter', () => {
      const { validatePasswordStrength } = useAuth()
      const result = validatePasswordStrength('UPPERCASE123!')

      expect(result.isValid).toBe(false)
      expect(result.errors.some(err => err.includes('lowercase'))).toBe(true)
    })

    it('rejects password without number', () => {
      const { validatePasswordStrength } = useAuth()
      const result = validatePasswordStrength('NoNumber!')

      expect(result.isValid).toBe(false)
      expect(result.errors.some(err => err.includes('number'))).toBe(true)
    })

    it('rejects password without special character', () => {
      const { validatePasswordStrength } = useAuth()
      const result = validatePasswordStrength('NoSpecial123')

      expect(result.isValid).toBe(false)
      expect(result.errors.some(err => err.includes('special'))).toBe(true)
    })

    it('returns all validation errors for weak password', () => {
      const { validatePasswordStrength } = useAuth()
      const result = validatePasswordStrength('weak')

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })

    it('handles empty password', () => {
      const { validatePasswordStrength } = useAuth()
      const result = validatePasswordStrength('')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('validation.password.minLength')
    })

    it('accepts various special characters', () => {
      const { validatePasswordStrength } = useAuth()

      expect(validatePasswordStrength('Password1!').isValid).toBe(true)
      expect(validatePasswordStrength('Password1@').isValid).toBe(true)
      expect(validatePasswordStrength('Password1#').isValid).toBe(true)
      expect(validatePasswordStrength('Password1$').isValid).toBe(true)
      expect(validatePasswordStrength('Password1%').isValid).toBe(true)
    })
  })

  describe('Signup Function', () => {
    beforeEach(() => {
      authStore.signup = vi.fn().mockResolvedValue({})
    })

    it('calls authStore.signup with credentials', async () => {
      const { signup } = useAuth()
      const credentials = {
        email: 'test@example.com',
        password: 'ValidPass123!'
      }

      await signup(credentials)

      expect(authStore.signup).toHaveBeenCalledWith(credentials)
    })

    it('sets isLoading to true during signup', async () => {
      const { signup, isLoading } = useAuth()

      const signupPromise = signup({
        email: 'test@example.com',
        password: 'ValidPass123!'
      })

      expect(isLoading.value).toBe(true)
      await signupPromise
    })

    it('sets isLoading to false after successful signup', async () => {
      const { signup, isLoading } = useAuth()

      await signup({
        email: 'test@example.com',
        password: 'ValidPass123!'
      })

      expect(isLoading.value).toBe(false)
    })

    it('shows success notification on successful signup', async () => {
      const { signup } = useAuth()

      await signup({
        email: 'test@example.com',
        password: 'ValidPass123!'
      })

      expect(mockNotifySuccess).toHaveBeenCalledWith('auth.signup.success')
    })

    it('throws error for invalid email', async () => {
      const { signup } = useAuth()

      await expect(signup({
        email: 'invalid-email',
        password: 'ValidPass123!'
      })).rejects.toThrow('validation.email.invalid')
    })

    it('throws error for weak password', async () => {
      const { signup } = useAuth()

      await expect(signup({
        email: 'test@example.com',
        password: 'weak'
      })).rejects.toThrow()
    })

    it('sets error message on validation failure', async () => {
      const { signup, error } = useAuth()

      try {
        await signup({
          email: 'invalid-email',
          password: 'ValidPass123!'
        })
      } catch (err) {
        expect(error.value).toBe('validation.email.invalid')
      }
    })

    it('shows error notification on signup failure', async () => {
      authStore.signup = vi.fn().mockRejectedValue(new Error('Email already exists'))
      const { signup } = useAuth()

      try {
        await signup({
          email: 'test@example.com',
          password: 'ValidPass123!'
        })
      } catch (err) {
        expect(mockNotifyApiError).toHaveBeenCalled()
      }
    })

    it('sets isLoading to false after signup failure', async () => {
      authStore.signup = vi.fn().mockRejectedValue(new Error('Network error'))
      const { signup, isLoading } = useAuth()

      try {
        await signup({
          email: 'test@example.com',
          password: 'ValidPass123!'
        })
      } catch (err) {
        expect(isLoading.value).toBe(false)
      }
    })

    it('clears previous error before new signup', async () => {
      const { signup, error } = useAuth()

      error.value = 'Previous error'

      await signup({
        email: 'test@example.com',
        password: 'ValidPass123!'
      })

      expect(error.value).toBeNull()
    })
  })

  describe('Email Verification Function', () => {
    beforeEach(() => {
      authStore.verifyEmail = vi.fn().mockResolvedValue({})
    })

    it('calls authStore.verifyEmail with email and token', async () => {
      const { verifyEmail } = useAuth()

      await verifyEmail('test@example.com', 'valid-token-123')

      expect(authStore.verifyEmail).toHaveBeenCalledWith('test@example.com', 'valid-token-123')
    })

    it('sets isLoading to true during verification', async () => {
      const { verifyEmail, isLoading } = useAuth()

      const verifyPromise = verifyEmail('test@example.com', 'valid-token')
      expect(isLoading.value).toBe(true)
      await verifyPromise
    })

    it('sets isLoading to false after successful verification', async () => {
      const { verifyEmail, isLoading } = useAuth()

      await verifyEmail('test@example.com', 'valid-token')

      expect(isLoading.value).toBe(false)
    })

    it('shows success notification on successful verification', async () => {
      const { verifyEmail } = useAuth()

      await verifyEmail('test@example.com', 'valid-token')

      expect(mockNotifySuccess).toHaveBeenCalledWith('auth.verify.success')
    })

    it('handles verification failure', async () => {
      authStore.verifyEmail = vi.fn().mockRejectedValue(new Error('Invalid token'))
      const { verifyEmail } = useAuth()

      await expect(verifyEmail('test@example.com', 'invalid-token')).rejects.toThrow('Invalid token')
    })

    it('shows error notification on verification failure', async () => {
      authStore.verifyEmail = vi.fn().mockRejectedValue(new Error('Token expired'))
      const { verifyEmail } = useAuth()

      try {
        await verifyEmail('test@example.com', 'expired-token')
      } catch (err) {
        expect(mockNotifyError).toHaveBeenCalled()
      }
    })

    it('sets error message on verification failure', async () => {
      const errorMessage = 'Token has expired'
      authStore.verifyEmail = vi.fn().mockRejectedValue(new Error(errorMessage))
      const { verifyEmail, error } = useAuth()

      try {
        await verifyEmail('test@example.com', 'expired-token')
      } catch (err) {
        expect(error.value).toBe(errorMessage)
      }
    })

    it('sets isLoading to false after verification failure', async () => {
      authStore.verifyEmail = vi.fn().mockRejectedValue(new Error('Network error'))
      const { verifyEmail, isLoading } = useAuth()

      try {
        await verifyEmail('test@example.com', 'valid-token')
      } catch (err) {
        expect(isLoading.value).toBe(false)
      }
    })

    it('clears previous error before verification', async () => {
      const { verifyEmail, error } = useAuth()

      error.value = 'Previous error'

      await verifyEmail('test@example.com', 'valid-token')

      expect(error.value).toBeNull()
    })
  })

  describe('Resend Verification Function', () => {
    beforeEach(() => {
      authStore.resendVerification = vi.fn().mockResolvedValue({})
    })

    it('calls authStore.resendVerification with email', async () => {
      const { resendVerification } = useAuth()

      await resendVerification('test@example.com')

      expect(authStore.resendVerification).toHaveBeenCalledWith('test@example.com')
    })

    it('sets isLoading to true during resend', async () => {
      const { resendVerification, isLoading } = useAuth()

      const resendPromise = resendVerification('test@example.com')
      expect(isLoading.value).toBe(true)
      await resendPromise
    })

    it('sets isLoading to false after successful resend', async () => {
      const { resendVerification, isLoading } = useAuth()

      await resendVerification('test@example.com')

      expect(isLoading.value).toBe(false)
    })

    it('shows success notification on successful resend', async () => {
      const { resendVerification } = useAuth()

      await resendVerification('test@example.com')

      expect(mockNotifySuccess).toHaveBeenCalledWith('auth.verify.resendSuccess')
    })

    it('handles resend failure', async () => {
      authStore.resendVerification = vi.fn().mockRejectedValue(new Error('User not found'))
      const { resendVerification } = useAuth()

      await expect(resendVerification('test@example.com')).rejects.toThrow('User not found')
    })

    it('shows error notification on resend failure', async () => {
      authStore.resendVerification = vi.fn().mockRejectedValue(new Error('Failed to send email'))
      const { resendVerification } = useAuth()

      try {
        await resendVerification('test@example.com')
      } catch (err) {
        expect(mockNotifyApiError).toHaveBeenCalled()
      }
    })

    it('sets error message on resend failure', async () => {
      const errorMessage = 'Rate limit exceeded'
      authStore.resendVerification = vi.fn().mockRejectedValue(new Error(errorMessage))
      const { resendVerification, error } = useAuth()

      try {
        await resendVerification('test@example.com')
      } catch (err) {
        expect(error.value).toBe(errorMessage)
      }
    })

    it('sets isLoading to false after resend failure', async () => {
      authStore.resendVerification = vi.fn().mockRejectedValue(new Error('Network error'))
      const { resendVerification, isLoading } = useAuth()

      try {
        await resendVerification('test@example.com')
      } catch (err) {
        expect(isLoading.value).toBe(false)
      }
    })

    it('clears previous error before resend', async () => {
      const { resendVerification, error } = useAuth()

      error.value = 'Previous error'

      await resendVerification('test@example.com')

      expect(error.value).toBeNull()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('handles null email in signup', async () => {
      const { signup } = useAuth()

      await expect(signup({
        email: null,
        password: 'ValidPass123!'
      })).rejects.toThrow()
    })

    it('handles undefined password in signup', async () => {
      const { signup } = useAuth()

      await expect(signup({
        email: 'test@example.com',
        password: undefined
      })).rejects.toThrow()
    })

    it('handles very long passwords', async () => {
      const { validatePasswordStrength } = useAuth()
      const longPassword = 'A'.repeat(500) + 'a1!'

      const result = validatePasswordStrength(longPassword)
      expect(result.isValid).toBe(true)
    })

    it('handles passwords with emoji', async () => {
      const { validatePasswordStrength } = useAuth()

      const result = validatePasswordStrength('ValidPass123!😀')
      // Should still be valid as it meets all requirements
      expect(result.isValid).toBe(true)
    })

    it('handles network timeout during signup', async () => {
      authStore.signup = vi.fn().mockRejectedValue(new Error('Network timeout'))
      const { signup } = useAuth()

      await expect(signup({
        email: 'test@example.com',
        password: 'ValidPass123!'
      })).rejects.toThrow('Network timeout')
    })

    it('handles special characters in email during verification', async () => {
      authStore.verifyEmail = vi.fn().mockResolvedValue({})
      const { verifyEmail } = useAuth()

      await verifyEmail('test+tag@example.com', 'valid-token')

      expect(authStore.verifyEmail).toHaveBeenCalledWith('test+tag@example.com', 'valid-token')
    })
  })
})
