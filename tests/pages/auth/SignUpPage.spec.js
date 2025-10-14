/**
 * SignUpPage.spec.js
 *
 * Tests for SignUpPage component
 * Per constitution: Plain JavaScript tests with Vitest + Vue Test Utils
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import SignUpPage from 'src/pages/auth/SignUpPage.vue'
import SignUpForm from 'src/components/auth/SignUpForm.vue'
import ErrorDisplay from 'src/components/shared/ErrorDisplay.vue'

// Mock composables
const mockSignup = vi.fn()
const mockIsLoading = { value: false }
const mockAuthError = { value: null }

vi.mock('src/composables/useAuth', () => ({
  useAuth: () => ({
    signup: mockSignup,
    isLoading: mockIsLoading,
    error: mockAuthError
  })
}))

describe('SignUpPage', () => {
  let wrapper
  let router

  beforeEach(() => {
    // Create router for testing
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/signup', name: 'signup', component: SignUpPage },
        { path: '/login', name: 'login', component: { template: '<div>Login</div>' } }
      ]
    })

    // Reset mocks
    mockSignup.mockReset()
    mockIsLoading.value = false
    mockAuthError.value = null

    wrapper = mount(SignUpPage, {
      global: {
        plugins: [createTestingPinia(), router],
        stubs: {
          QPage: false,
          QBanner: false,
          QIcon: true,
          QBtn: false,
          SignUpForm: false,
          ErrorDisplay: false
        }
      }
    })
  })

  describe('Component Rendering', () => {
    it('renders the signup page', () => {
      expect(wrapper.find('.signup-page-container').exists()).toBe(true)
    })

    it('renders page title', () => {
      const title = wrapper.find('h4')
      expect(title.exists()).toBe(true)
    })

    it('renders page subtitle', () => {
      const subtitle = wrapper.find('.text-body2')
      expect(subtitle.exists()).toBe(true)
    })

    it('renders SignUpForm component', () => {
      expect(wrapper.findComponent(SignUpForm).exists()).toBe(true)
    })

    it('renders link to login page', () => {
      const loginLink = wrapper.find('a[href*="login"]')
      expect(loginLink.exists()).toBe(true)
    })

    it('does not show success banner initially', () => {
      const successBanner = wrapper.find('.bg-positive')
      expect(successBanner.exists()).toBe(false)
    })

    it('does not show error display initially', () => {
      expect(wrapper.findComponent(ErrorDisplay).exists()).toBe(false)
    })
  })

  describe('Signup Flow - Success', () => {
    it('calls signup function when form is submitted', async () => {
      mockSignup.mockResolvedValue({})

      const form = wrapper.findComponent(SignUpForm)
      await form.vm.$emit('submit', {
        email: 'test@example.com',
        password: 'TestPass123!'
      })
      await flushPromises()

      expect(mockSignup).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
    })

    it('shows success banner after successful signup', async () => {
      mockSignup.mockResolvedValue({})

      const form = wrapper.findComponent(SignUpForm)
      await form.vm.$emit('submit', {
        email: 'test@example.com',
        password: 'TestPass123!'
      })
      await flushPromises()

      const successBanner = wrapper.find('.bg-positive')
      expect(successBanner.exists()).toBe(true)
    })

    it('hides signup form after successful signup', async () => {
      mockSignup.mockResolvedValue({})

      const form = wrapper.findComponent(SignUpForm)
      await form.vm.$emit('submit', {
        email: 'test@example.com',
        password: 'TestPass123!'
      })
      await flushPromises()

      expect(wrapper.findComponent(SignUpForm).exists()).toBe(false)
    })

    it('shows login button after successful signup', async () => {
      mockSignup.mockResolvedValue({})

      const form = wrapper.findComponent(SignUpForm)
      await form.vm.$emit('submit', {
        email: 'test@example.com',
        password: 'TestPass123!'
      })
      await flushPromises()

      const loginBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('auth.signup.login')
      )
      expect(loginBtn).toBeTruthy()
    })

    it('sets signupSuccess to true on successful signup', async () => {
      mockSignup.mockResolvedValue({})

      await wrapper.vm.handleSignup({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
      await flushPromises()

      expect(wrapper.vm.signupSuccess).toBe(true)
    })

    it('clears error on successful signup', async () => {
      wrapper.vm.error = 'Previous error'
      mockSignup.mockResolvedValue({})

      await wrapper.vm.handleSignup({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
      await flushPromises()

      expect(wrapper.vm.error).toBeNull()
    })
  })

  describe('Signup Flow - Error Handling', () => {
    it('shows error message when signup fails', async () => {
      mockSignup.mockRejectedValue(new Error('Email already exists'))

      const form = wrapper.findComponent(SignUpForm)
      await form.vm.$emit('submit', {
        email: 'test@example.com',
        password: 'TestPass123!'
      })
      await flushPromises()

      expect(wrapper.findComponent(ErrorDisplay).exists()).toBe(true)
    })

    it('sets error message when signup fails', async () => {
      const errorMessage = 'Email already exists'
      mockSignup.mockRejectedValue(new Error(errorMessage))

      await wrapper.vm.handleSignup({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
      await flushPromises()

      expect(wrapper.vm.error).toBe(errorMessage)
    })

    it('does not show success banner when signup fails', async () => {
      mockSignup.mockRejectedValue(new Error('Network error'))

      await wrapper.vm.handleSignup({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
      await flushPromises()

      const successBanner = wrapper.find('.bg-positive')
      expect(successBanner.exists()).toBe(false)
    })

    it('keeps signup form visible when signup fails', async () => {
      mockSignup.mockRejectedValue(new Error('Network error'))

      await wrapper.vm.handleSignup({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
      await flushPromises()

      expect(wrapper.findComponent(SignUpForm).exists()).toBe(true)
    })

    it('shows generic error message for unknown errors', async () => {
      mockSignup.mockRejectedValue({ message: undefined })

      await wrapper.vm.handleSignup({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
      await flushPromises()

      expect(wrapper.vm.error).toBe('error.unknown')
    })

    it('allows dismissing error message', async () => {
      mockSignup.mockRejectedValue(new Error('Network error'))

      await wrapper.vm.handleSignup({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
      await flushPromises()

      expect(wrapper.vm.error).toBeTruthy()

      const errorDisplay = wrapper.findComponent(ErrorDisplay)
      await errorDisplay.vm.$emit('dismiss')
      await flushPromises()

      expect(wrapper.vm.error).toBeNull()
    })
  })

  describe('Loading State', () => {
    it('passes loading state to SignUpForm', async () => {
      mockIsLoading.value = true
      await wrapper.vm.$nextTick()

      const form = wrapper.findComponent(SignUpForm)
      expect(form.props('loading')).toBe(true)
    })

    it('passes non-loading state to SignUpForm', async () => {
      mockIsLoading.value = false
      await wrapper.vm.$nextTick()

      const form = wrapper.findComponent(SignUpForm)
      expect(form.props('loading')).toBe(false)
    })
  })

  describe('Navigation', () => {
    it('has link to login page in text', () => {
      const loginLink = wrapper.find('a')
      expect(loginLink.attributes('href')).toContain('login')
    })

    it('shows login button after successful signup', async () => {
      mockSignup.mockResolvedValue({})

      await wrapper.vm.handleSignup({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
      await flushPromises()

      const buttons = wrapper.findAll('button')
      const hasLoginButton = buttons.some(btn =>
        btn.text().includes('auth.signup.login')
      )
      expect(hasLoginButton).toBe(true)
    })
  })

  describe('Multiple Signup Attempts', () => {
    it('resets success state when submitting again', async () => {
      mockSignup.mockResolvedValue({})

      // First signup
      await wrapper.vm.handleSignup({
        email: 'test1@example.com',
        password: 'TestPass123!'
      })
      await flushPromises()
      expect(wrapper.vm.signupSuccess).toBe(true)

      // Second signup attempt
      mockSignup.mockRejectedValue(new Error('Email already exists'))
      await wrapper.vm.handleSignup({
        email: 'test2@example.com',
        password: 'TestPass123!'
      })
      await flushPromises()

      expect(wrapper.vm.signupSuccess).toBe(false)
    })

    it('clears previous errors when submitting again', async () => {
      mockSignup.mockRejectedValue(new Error('First error'))

      // First attempt
      await wrapper.vm.handleSignup({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
      await flushPromises()
      expect(wrapper.vm.error).toBeTruthy()

      // Second attempt
      mockSignup.mockResolvedValue({})
      await wrapper.vm.handleSignup({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
      await flushPromises()

      expect(wrapper.vm.error).toBeNull()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty error object', async () => {
      mockSignup.mockRejectedValue({})

      await wrapper.vm.handleSignup({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
      await flushPromises()

      expect(wrapper.vm.error).toBe('error.unknown')
    })

    it('handles network timeout error', async () => {
      mockSignup.mockRejectedValue(new Error('Network timeout'))

      await wrapper.vm.handleSignup({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
      await flushPromises()

      expect(wrapper.vm.error).toBe('Network timeout')
    })

    it('does not show error when success banner is visible', async () => {
      mockSignup.mockResolvedValue({})

      await wrapper.vm.handleSignup({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
      await flushPromises()

      wrapper.vm.error = 'Some error'
      await wrapper.vm.$nextTick()

      expect(wrapper.findComponent(ErrorDisplay).exists()).toBe(false)
    })
  })
})
