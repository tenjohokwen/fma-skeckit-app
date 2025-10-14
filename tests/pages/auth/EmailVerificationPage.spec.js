/**
 * EmailVerificationPage.spec.js
 *
 * Tests for EmailVerificationPage component
 * Per constitution: Plain JavaScript tests with Vitest + Vue Test Utils
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import EmailVerificationPage from 'src/pages/auth/EmailVerificationPage.vue'
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue'

// Mock composables
const mockVerifyEmail = vi.fn()
const mockResendVerification = vi.fn()

vi.mock('src/composables/useAuth', () => ({
  useAuth: () => ({
    verifyEmail: mockVerifyEmail,
    resendVerification: mockResendVerification
  })
}))

describe('EmailVerificationPage', () => {
  let wrapper
  let router

  const createWrapper = async (queryParams = {}) => {
    // Create router for testing
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/verify-email',
          name: 'verify-email',
          component: EmailVerificationPage
        },
        { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
        { path: '/signup', name: 'signup', component: { template: '<div>Signup</div>' } }
      ]
    })

    // Navigate with query params
    await router.push({
      path: '/verify-email',
      query: queryParams
    })

    return mount(EmailVerificationPage, {
      global: {
        plugins: [createTestingPinia(), router],
        stubs: {
          QPage: false,
          QIcon: true,
          QBtn: false,
          LoadingIndicator: false
        }
      }
    })
  }

  beforeEach(() => {
    // Reset mocks
    mockVerifyEmail.mockReset()
    mockResendVerification.mockReset()
  })

  describe('Component Rendering', () => {
    it('renders the verification page', async () => {
      mockVerifyEmail.mockResolvedValue({})
      wrapper = await createWrapper({
        email: 'test@example.com',
        token: 'valid-token'
      })
      await flushPromises()

      expect(wrapper.find('.verification-page-container').exists()).toBe(true)
    })

    it('shows loading indicator initially', async () => {
      mockVerifyEmail.mockImplementation(() => new Promise(() => {})) // Never resolves

      wrapper = await createWrapper({
        email: 'test@example.com',
        token: 'valid-token'
      })

      expect(wrapper.findComponent(LoadingIndicator).exists()).toBe(true)
      expect(wrapper.vm.isVerifying).toBe(true)
    })
  })

  describe('Successful Verification', () => {
    it('calls verifyEmail with email and token from URL', async () => {
      mockVerifyEmail.mockResolvedValue({})

      wrapper = await createWrapper({
        email: 'test@example.com',
        token: 'valid-token-123'
      })
      await flushPromises()

      expect(mockVerifyEmail).toHaveBeenCalledWith('test@example.com', 'valid-token-123')
    })

    it('shows success state after verification', async () => {
      mockVerifyEmail.mockResolvedValue({})

      wrapper = await createWrapper({
        email: 'test@example.com',
        token: 'valid-token'
      })
      await flushPromises()

      expect(wrapper.vm.verificationSuccess).toBe(true)
      expect(wrapper.vm.isVerifying).toBe(false)
    })

    it('displays success icon on successful verification', async () => {
      mockVerifyEmail.mockResolvedValue({})

      wrapper = await createWrapper({
        email: 'test@example.com',
        token: 'valid-token'
      })
      await flushPromises()

      const successIcon = wrapper.findAllComponents({ name: 'QIcon' })
        .find(icon => icon.props('name') === 'check_circle')
      expect(successIcon).toBeTruthy()
    })

    it('shows login button after successful verification', async () => {
      mockVerifyEmail.mockResolvedValue({})

      wrapper = await createWrapper({
        email: 'test@example.com',
        token: 'valid-token'
      })
      await flushPromises()

      const loginBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('auth.signup.login')
      )
      expect(loginBtn).toBeTruthy()
    })

    it('hides loading indicator after successful verification', async () => {
      mockVerifyEmail.mockResolvedValue({})

      wrapper = await createWrapper({
        email: 'test@example.com',
        token: 'valid-token'
      })
      await flushPromises()

      expect(wrapper.findComponent(LoadingIndicator).exists()).toBe(false)
    })
  })

  describe('Failed Verification', () => {
    it('shows error state when verification fails', async () => {
      mockVerifyEmail.mockRejectedValue(new Error('Invalid token'))

      wrapper = await createWrapper({
        email: 'test@example.com',
        token: 'invalid-token'
      })
      await flushPromises()

      expect(wrapper.vm.verificationSuccess).toBe(false)
      expect(wrapper.vm.errorMessage).toBeTruthy()
    })

    it('displays error icon on failed verification', async () => {
      mockVerifyEmail.mockRejectedValue(new Error('Invalid token'))

      wrapper = await createWrapper({
        email: 'test@example.com',
        token: 'invalid-token'
      })
      await flushPromises()

      const errorIcon = wrapper.findAllComponents({ name: 'QIcon' })
        .find(icon => icon.props('name') === 'error')
      expect(errorIcon).toBeTruthy()
    })

    it('shows error message from exception', async () => {
      const errorMessage = 'Token has expired'
      mockVerifyEmail.mockRejectedValue(new Error(errorMessage))

      wrapper = await createWrapper({
        email: 'test@example.com',
        token: 'expired-token'
      })
      await flushPromises()

      expect(wrapper.vm.errorMessage).toBe(errorMessage)
    })

    it('shows resend button when verification fails', async () => {
      mockVerifyEmail.mockRejectedValue(new Error('Invalid token'))

      wrapper = await createWrapper({
        email: 'test@example.com',
        token: 'invalid-token'
      })
      await flushPromises()

      const resendBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('auth.verify.resend')
      )
      expect(resendBtn).toBeTruthy()
    })

    it('shows back to login button when verification fails', async () => {
      mockVerifyEmail.mockRejectedValue(new Error('Invalid token'))

      wrapper = await createWrapper({
        email: 'test@example.com',
        token: 'invalid-token'
      })
      await flushPromises()

      const backBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('auth.verify.backToLogin')
      )
      expect(backBtn).toBeTruthy()
    })
  })

  describe('Missing Parameters', () => {
    it('shows error when email is missing', async () => {
      wrapper = await createWrapper({
        token: 'valid-token'
      })
      await flushPromises()

      expect(wrapper.vm.errorMessage).toBe('Missing email or verification token')
      expect(wrapper.vm.isVerifying).toBe(false)
      expect(mockVerifyEmail).not.toHaveBeenCalled()
    })

    it('shows error when token is missing', async () => {
      wrapper = await createWrapper({
        email: 'test@example.com'
      })
      await flushPromises()

      expect(wrapper.vm.errorMessage).toBe('Missing email or verification token')
      expect(wrapper.vm.isVerifying).toBe(false)
      expect(mockVerifyEmail).not.toHaveBeenCalled()
    })

    it('shows error when both parameters are missing', async () => {
      wrapper = await createWrapper({})
      await flushPromises()

      expect(wrapper.vm.errorMessage).toBe('Missing email or verification token')
      expect(wrapper.vm.isVerifying).toBe(false)
      expect(mockVerifyEmail).not.toHaveBeenCalled()
    })

    it('shows signup button when no email in query params', async () => {
      wrapper = await createWrapper({})
      await flushPromises()

      const signupBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('auth.signup.title')
      )
      expect(signupBtn).toBeTruthy()
    })
  })

  describe('Resend Verification', () => {
    it('calls resendVerification when resend button is clicked', async () => {
      mockVerifyEmail.mockRejectedValue(new Error('Token expired'))
      mockResendVerification.mockResolvedValue({})

      wrapper = await createWrapper({
        email: 'test@example.com',
        token: 'expired-token'
      })
      await flushPromises()

      await wrapper.vm.handleResendVerification()
      await flushPromises()

      expect(mockResendVerification).toHaveBeenCalledWith('test@example.com')
    })

    it('sets isResending to true during resend', async () => {
      mockVerifyEmail.mockRejectedValue(new Error('Token expired'))
      mockResendVerification.mockImplementation(() => new Promise(() => {})) // Never resolves

      wrapper = await createWrapper({
        email: 'test@example.com',
        token: 'expired-token'
      })
      await flushPromises()

      wrapper.vm.handleResendVerification()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isResending).toBe(true)
    })

    it('clears error message before resending', async () => {
      mockVerifyEmail.mockRejectedValue(new Error('Token expired'))
      mockResendVerification.mockResolvedValue({})

      wrapper = await createWrapper({
        email: 'test@example.com',
        token: 'expired-token'
      })
      await flushPromises()

      expect(wrapper.vm.errorMessage).toBeTruthy()

      await wrapper.vm.handleResendVerification()
      await flushPromises()

      expect(wrapper.vm.errorMessage).toBeNull()
    })

    it('handles resend failure', async () => {
      mockVerifyEmail.mockRejectedValue(new Error('Token expired'))
      mockResendVerification.mockRejectedValue(new Error('Failed to send email'))

      wrapper = await createWrapper({
        email: 'test@example.com',
        token: 'expired-token'
      })
      await flushPromises()

      await wrapper.vm.handleResendVerification()
      await flushPromises()

      expect(wrapper.vm.errorMessage).toBeTruthy()
      expect(wrapper.vm.isResending).toBe(false)
    })

    it('does not resend if email is missing', async () => {
      wrapper = await createWrapper({})
      await flushPromises()

      await wrapper.vm.handleResendVerification()
      await flushPromises()

      expect(mockResendVerification).not.toHaveBeenCalled()
    })

    it('disables resend button while resending', async () => {
      mockVerifyEmail.mockRejectedValue(new Error('Token expired'))
      mockResendVerification.mockImplementation(() => new Promise(() => {}))

      wrapper = await createWrapper({
        email: 'test@example.com',
        token: 'expired-token'
      })
      await flushPromises()

      wrapper.vm.handleResendVerification()
      await wrapper.vm.$nextTick()

      const resendBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('auth.verify.resend')
      )
      expect(resendBtn.attributes('disabled')).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty error object', async () => {
      mockVerifyEmail.mockRejectedValue({})

      wrapper = await createWrapper({
        email: 'test@example.com',
        token: 'valid-token'
      })
      await flushPromises()

      expect(wrapper.vm.errorMessage).toBe('auth.verify.error')
    })

    it('handles network timeout error', async () => {
      mockVerifyEmail.mockRejectedValue(new Error('Network timeout'))

      wrapper = await createWrapper({
        email: 'test@example.com',
        token: 'valid-token'
      })
      await flushPromises()

      expect(wrapper.vm.errorMessage).toBe('Network timeout')
    })

    it('handles special characters in email', async () => {
      mockVerifyEmail.mockResolvedValue({})

      wrapper = await createWrapper({
        email: 'test+tag@example.com',
        token: 'valid-token'
      })
      await flushPromises()

      expect(mockVerifyEmail).toHaveBeenCalledWith('test+tag@example.com', 'valid-token')
    })

    it('handles long token strings', async () => {
      mockVerifyEmail.mockResolvedValue({})
      const longToken = 'a'.repeat(500)

      wrapper = await createWrapper({
        email: 'test@example.com',
        token: longToken
      })
      await flushPromises()

      expect(mockVerifyEmail).toHaveBeenCalledWith('test@example.com', longToken)
    })
  })
})
