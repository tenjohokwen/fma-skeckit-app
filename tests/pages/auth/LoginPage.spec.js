/**
 * LoginPage.spec.js
 *
 * Tests for LoginPage component with multi-step password reset flow
 * Per constitution: Plain JavaScript tests with Vitest + Vue Test Utils
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import LoginPage from 'src/pages/auth/LoginPage.vue'

// Mock composables
const mockLogin = vi.fn()
const mockRequestPasswordReset = vi.fn()
const mockVerifyOTP = vi.fn()
const mockResetPassword = vi.fn()
const mockIsLoading = { value: false }

vi.mock('src/composables/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    requestPasswordReset: mockRequestPasswordReset,
    verifyOTP: mockVerifyOTP,
    resetPassword: mockResetPassword,
    isLoading: mockIsLoading
  })
}))

describe('LoginPage', () => {
  let wrapper
  let router

  beforeEach(() => {
    // Create router for testing
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/login', name: 'login', component: LoginPage },
        { path: '/signup', name: 'signup', component: { template: '<div>Signup</div>' } }
      ]
    })

    // Reset mocks
    mockLogin.mockReset()
    mockRequestPasswordReset.mockReset()
    mockVerifyOTP.mockReset()
    mockResetPassword.mockReset()
    mockIsLoading.value = false

    wrapper = mount(LoginPage, {
      global: {
        plugins: [createTestingPinia(), router],
        stubs: {
          QPage: false,
          QBanner: false,
          QIcon: true,
          LoginForm: true,
          ForgotPasswordForm: true,
          OTPVerificationForm: true,
          ResetPasswordForm: true,
          ErrorDisplay: true
        }
      }
    })
  })

  describe('Component Rendering', () => {
    it('renders the login page', () => {
      expect(wrapper.find('.login-page-container').exists()).toBe(true)
    })

    it('starts with login view by default', () => {
      expect(wrapper.vm.currentView).toBe('login')
    })

    it('renders LoginForm in login view', () => {
      expect(wrapper.findComponent({ name: 'LoginForm' }).exists()).toBe(true)
    })

    it('does not show expired message by default', () => {
      expect(wrapper.vm.showExpiredMessage).toBe(false)
    })
  })

  describe('Login Flow', () => {
    it('calls login function when form is submitted', async () => {
      mockLogin.mockResolvedValue({})

      const loginForm = wrapper.findComponent({ name: 'LoginForm' })
      await loginForm.vm.$emit('submit', {
        email: 'test@example.com',
        password: 'ValidPass123!'
      })
      await flushPromises()

      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'ValidPass123!'
      })
    })

    it('handles login error', async () => {
      mockLogin.mockRejectedValue(new Error('Invalid credentials'))

      await wrapper.vm.handleLogin({
        email: 'test@example.com',
        password: 'wrongpass'
      })
      await flushPromises()

      expect(wrapper.vm.error).toBe('Invalid credentials')
    })

    it('clears error before login attempt', async () => {
      wrapper.vm.error = 'Previous error'
      mockLogin.mockResolvedValue({})

      await wrapper.vm.handleLogin({
        email: 'test@example.com',
        password: 'ValidPass123!'
      })
      await flushPromises()

      expect(wrapper.vm.error).toBeNull()
    })

    it('clears expired message on login attempt', async () => {
      wrapper.vm.showExpiredMessage = true
      mockLogin.mockResolvedValue({})

      await wrapper.vm.handleLogin({
        email: 'test@example.com',
        password: 'ValidPass123!'
      })
      await flushPromises()

      expect(wrapper.vm.showExpiredMessage).toBe(false)
    })
  })

  describe('Forgot Password Flow - Step 1: Request OTP', () => {
    it('switches to forgot-password view when forgot password is clicked', async () => {
      const loginForm = wrapper.findComponent({ name: 'LoginForm' })
      await loginForm.vm.$emit('forgot-password')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.currentView).toBe('forgot-password')
    })

    it('renders ForgotPasswordForm in forgot-password view', async () => {
      wrapper.vm.currentView = 'forgot-password'
      await wrapper.vm.$nextTick()

      expect(wrapper.findComponent({ name: 'ForgotPasswordForm' }).exists()).toBe(true)
    })

    it('calls requestPasswordReset and stores email', async () => {
      mockRequestPasswordReset.mockResolvedValue({})
      wrapper.vm.currentView = 'forgot-password'
      await wrapper.vm.$nextTick()

      await wrapper.vm.handleRequestPasswordReset('test@example.com')
      await flushPromises()

      expect(mockRequestPasswordReset).toHaveBeenCalledWith('test@example.com')
      expect(wrapper.vm.resetEmail).toBe('test@example.com')
    })

    it('switches to verify-otp view after successful OTP request', async () => {
      mockRequestPasswordReset.mockResolvedValue({})

      await wrapper.vm.handleRequestPasswordReset('test@example.com')
      await flushPromises()

      expect(wrapper.vm.currentView).toBe('verify-otp')
    })

    it('handles OTP request error', async () => {
      mockRequestPasswordReset.mockRejectedValue(new Error('User not found'))

      await wrapper.vm.handleRequestPasswordReset('test@example.com')
      await flushPromises()

      expect(wrapper.vm.error).toBe('User not found')
      expect(wrapper.vm.currentView).toBe('login')
    })
  })

  describe('Forgot Password Flow - Step 2: Verify OTP', () => {
    beforeEach(async () => {
      wrapper.vm.currentView = 'verify-otp'
      wrapper.vm.resetEmail = 'test@example.com'
      await wrapper.vm.$nextTick()
    })

    it('renders OTPVerificationForm in verify-otp view', () => {
      expect(wrapper.findComponent({ name: 'OTPVerificationForm' }).exists()).toBe(true)
    })

    it('calls verifyOTP with email and OTP', async () => {
      mockVerifyOTP.mockResolvedValue({})

      await wrapper.vm.handleVerifyOTP('123456')
      await flushPromises()

      expect(mockVerifyOTP).toHaveBeenCalledWith('test@example.com', '123456')
    })

    it('stores OTP after successful verification', async () => {
      mockVerifyOTP.mockResolvedValue({})

      await wrapper.vm.handleVerifyOTP('123456')
      await flushPromises()

      expect(wrapper.vm.resetOTP).toBe('123456')
    })

    it('switches to reset-password view after successful OTP verification', async () => {
      mockVerifyOTP.mockResolvedValue({})

      await wrapper.vm.handleVerifyOTP('123456')
      await flushPromises()

      expect(wrapper.vm.currentView).toBe('reset-password')
    })

    it('handles OTP verification error', async () => {
      mockVerifyOTP.mockRejectedValue(new Error('Invalid OTP'))

      await wrapper.vm.handleVerifyOTP('wrong')
      await flushPromises()

      expect(wrapper.vm.error).toBe('Invalid OTP')
    })

    it('can go back to forgot-password view', async () => {
      const otpForm = wrapper.findComponent({ name: 'OTPVerificationForm' })
      await otpForm.vm.$emit('back')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.currentView).toBe('forgot-password')
    })
  })

  describe('Forgot Password Flow - Step 3: Reset Password', () => {
    beforeEach(async () => {
      wrapper.vm.currentView = 'reset-password'
      wrapper.vm.resetEmail = 'test@example.com'
      wrapper.vm.resetOTP = '123456'
      await wrapper.vm.$nextTick()
    })

    it('renders ResetPasswordForm in reset-password view', () => {
      expect(wrapper.findComponent({ name: 'ResetPasswordForm' }).exists()).toBe(true)
    })

    it('calls resetPassword with email, OTP, and new password', async () => {
      mockResetPassword.mockResolvedValue({})

      await wrapper.vm.handleResetPassword('NewValidPass123!')
      await flushPromises()

      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com', '123456', 'NewValidPass123!')
    })

    it('handles password reset error', async () => {
      mockResetPassword.mockRejectedValue(new Error('OTP expired'))

      await wrapper.vm.handleResetPassword('NewValidPass123!')
      await flushPromises()

      expect(wrapper.vm.error).toBe('OTP expired')
    })
  })

  describe('View State Machine', () => {
    it('maintains state data across view changes', async () => {
      mockRequestPasswordReset.mockResolvedValue({})
      mockVerifyOTP.mockResolvedValue({})

      // Step 1: Request OTP
      await wrapper.vm.handleRequestPasswordReset('test@example.com')
      await flushPromises()
      expect(wrapper.vm.resetEmail).toBe('test@example.com')

      // Step 2: Verify OTP
      await wrapper.vm.handleVerifyOTP('123456')
      await flushPromises()
      expect(wrapper.vm.resetEmail).toBe('test@example.com')
      expect(wrapper.vm.resetOTP).toBe('123456')

      // Both values should be preserved
      expect(wrapper.vm.currentView).toBe('reset-password')
    })

    it('clears error when changing views', async () => {
      wrapper.vm.error = 'Some error'

      wrapper.vm.currentView = 'forgot-password'
      await wrapper.vm.$nextTick()

      mockRequestPasswordReset.mockResolvedValue({})
      await wrapper.vm.handleRequestPasswordReset('test@example.com')
      await flushPromises()

      expect(wrapper.vm.error).toBeNull()
    })
  })

  describe('Token Expiry Warning', () => {
    it('shows expired message when query param is set', async () => {
      await router.push({ path: '/login', query: { expired: 'true' } })
      await wrapper.vm.$nextTick()

      wrapper = mount(LoginPage, {
        global: {
          plugins: [createTestingPinia(), router],
          stubs: {
            QPage: false,
            QBanner: false,
            QIcon: true,
            LoginForm: true,
            ErrorDisplay: true
          }
        }
      })

      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showExpiredMessage).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('shows error display when error exists', async () => {
      wrapper.vm.error = 'Some error'
      await wrapper.vm.$nextTick()

      expect(wrapper.findComponent({ name: 'ErrorDisplay' }).exists()).toBe(true)
    })

    it('dismisses error when ErrorDisplay emits dismiss', async () => {
      wrapper.vm.error = 'Some error'
      await wrapper.vm.$nextTick()

      const errorDisplay = wrapper.findComponent({ name: 'ErrorDisplay' })
      await errorDisplay.vm.$emit('dismiss')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.error).toBeNull()
    })

    it('shows generic error for unknown errors', async () => {
      mockLogin.mockRejectedValue({ message: undefined })

      await wrapper.vm.handleLogin({
        email: 'test@example.com',
        password: 'ValidPass123!'
      })
      await flushPromises()

      expect(wrapper.vm.error).toBe('error.login.invalid')
    })
  })

  describe('Loading State', () => {
    it('passes loading state to forms', async () => {
      mockIsLoading.value = true
      await wrapper.vm.$nextTick()

      const loginForm = wrapper.findComponent({ name: 'LoginForm' })
      expect(loginForm.props('loading')).toBe(true)
    })
  })

  describe('Complete Password Reset Flow', () => {
    it('completes full password reset flow', async () => {
      mockRequestPasswordReset.mockResolvedValue({})
      mockVerifyOTP.mockResolvedValue({})
      mockResetPassword.mockResolvedValue({})

      // Start from login view
      expect(wrapper.vm.currentView).toBe('login')

      // Navigate to forgot password
      wrapper.vm.currentView = 'forgot-password'
      await wrapper.vm.$nextTick()

      // Request OTP
      await wrapper.vm.handleRequestPasswordReset('test@example.com')
      await flushPromises()
      expect(wrapper.vm.currentView).toBe('verify-otp')

      // Verify OTP
      await wrapper.vm.handleVerifyOTP('123456')
      await flushPromises()
      expect(wrapper.vm.currentView).toBe('reset-password')

      // Reset password
      await wrapper.vm.handleResetPassword('NewStrongPass123!')
      await flushPromises()

      // Verify all functions were called correctly
      expect(mockRequestPasswordReset).toHaveBeenCalledWith('test@example.com')
      expect(mockVerifyOTP).toHaveBeenCalledWith('test@example.com', '123456')
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com', '123456', 'NewStrongPass123!')
    })
  })
})
