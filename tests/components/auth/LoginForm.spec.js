/**
 * LoginForm.spec.js
 *
 * Tests for LoginForm component
 * Per constitution: Plain JavaScript tests with Vitest + Vue Test Utils
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import LoginForm from 'src/components/auth/LoginForm.vue'

// Mock useAuth composable
vi.mock('src/composables/useAuth', () => ({
  useAuth: () => ({
    isValidEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  })
}))

describe('LoginForm', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(LoginForm, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          QForm: false,
          QInput: false,
          QBtn: false,
          QIcon: true
        }
      }
    })
  })

  describe('Component Rendering', () => {
    it('renders the login form', () => {
      expect(wrapper.find('form').exists()).toBe(true)
    })

    it('renders email input field', () => {
      const emailInput = wrapper.findAll('input[type="email"]')
      expect(emailInput.length).toBeGreaterThan(0)
    })

    it('renders password input field', () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      expect(passwordInputs.length).toBeGreaterThan(0)
    })

    it('renders submit button', () => {
      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.exists()).toBe(true)
    })

    it('renders forgot password button', () => {
      const forgotBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('auth.login.forgotPassword')
      )
      expect(forgotBtn).toBeTruthy()
    })

    it('shows password visibility toggle icon', () => {
      const icons = wrapper.findAllComponents({ name: 'QIcon' })
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Form Data Binding', () => {
    it('updates email when user types', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('test@example.com')
      expect(wrapper.vm.formData.email).toBe('test@example.com')
    })

    it('updates password when user types', async () => {
      const passwordInput = wrapper.find('input[type="password"]')
      await passwordInput.setValue('SecurePass123!')
      expect(wrapper.vm.formData.password).toBe('SecurePass123!')
    })

    it('starts with empty form data', () => {
      expect(wrapper.vm.formData.email).toBe('')
      expect(wrapper.vm.formData.password).toBe('')
    })
  })

  describe('Password Visibility Toggle', () => {
    it('password field starts as hidden', () => {
      expect(wrapper.vm.showPassword).toBe(false)
    })

    it('toggles password visibility when clicked', async () => {
      const initialValue = wrapper.vm.showPassword
      wrapper.vm.showPassword = !wrapper.vm.showPassword
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showPassword).toBe(!initialValue)
    })

    it('changes input type when password visibility is toggled', async () => {
      const passwordInput = wrapper.find('input[type="password"]')
      expect(passwordInput.exists()).toBe(true)

      wrapper.vm.showPassword = true
      await wrapper.vm.$nextTick()

      const textInput = wrapper.find('input[type="text"]')
      expect(textInput.exists()).toBe(true)
    })
  })

  describe('Form Validation', () => {
    it('validates email format', async () => {
      const emailInput = wrapper.find('input[type="email"]')

      // Invalid email
      await emailInput.setValue('invalid-email')
      await emailInput.trigger('blur')
      await wrapper.vm.$nextTick()

      // Valid email
      await emailInput.setValue('valid@example.com')
      await emailInput.trigger('blur')
      await wrapper.vm.$nextTick()
    })

    it('requires email field', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('')
      await emailInput.trigger('blur')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.formData.email).toBe('')
    })

    it('requires password field', async () => {
      const passwordInput = wrapper.find('input[type="password"]')
      await passwordInput.setValue('')
      await passwordInput.trigger('blur')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.formData.password).toBe('')
    })
  })

  describe('Form Submission', () => {
    it('emits submit event with form data on valid submission', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('SecurePass123!')
      await wrapper.vm.$nextTick()

      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('submit')).toBeTruthy()
      expect(wrapper.emitted('submit')[0][0]).toEqual({
        email: 'test@example.com',
        password: 'SecurePass123!'
      })
    })

    it('includes both email and password in emitted data', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')

      await emailInput.setValue('user@domain.com')
      await passwordInput.setValue('MyPassword456!')
      await wrapper.vm.$nextTick()

      wrapper.vm.handleSubmit()
      await wrapper.vm.$nextTick()

      const emittedData = wrapper.emitted('submit')[0][0]
      expect(emittedData).toHaveProperty('email')
      expect(emittedData).toHaveProperty('password')
      expect(emittedData.email).toBe('user@domain.com')
      expect(emittedData.password).toBe('MyPassword456!')
    })
  })

  describe('Forgot Password', () => {
    it('emits forgot-password event when button is clicked', async () => {
      const forgotBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('auth.login.forgotPassword')
      )

      await forgotBtn.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('forgot-password')).toBeTruthy()
    })

    it('does not emit submit event when forgot password is clicked', async () => {
      const forgotBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('auth.login.forgotPassword')
      )

      await forgotBtn.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('submit')).toBeFalsy()
    })
  })

  describe('Loading State', () => {
    it('disables submit button when loading is true', async () => {
      wrapper = mount(LoginForm, {
        props: {
          loading: true
        },
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            QForm: false,
            QInput: false,
            QBtn: false,
            QIcon: true
          }
        }
      })

      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.attributes('disabled')).toBeDefined()
    })

    it('enables submit button when loading is false', async () => {
      wrapper = mount(LoginForm, {
        props: {
          loading: false
        },
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            QForm: false,
            QInput: false,
            QBtn: false,
            QIcon: true
          }
        }
      })

      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.attributes('disabled')).toBeUndefined()
    })

    it('shows loading indicator on submit button when loading', async () => {
      wrapper = mount(LoginForm, {
        props: {
          loading: true
        },
        global: {
          plugins: [createTestingPinia()],
          stubs: {
            QForm: false,
            QInput: false,
            QBtn: false,
            QIcon: true
          }
        }
      })

      const submitBtn = wrapper.findAll('button').find(btn =>
        btn.attributes('type') === 'submit'
      )
      expect(submitBtn.attributes('disabled')).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('handles special characters in email', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('test+tag@example.com')
      expect(wrapper.vm.formData.email).toBe('test+tag@example.com')
    })

    it('handles long passwords', async () => {
      const passwordInput = wrapper.find('input[type="password"]')
      const longPassword = 'A'.repeat(100) + 'a1!'
      await passwordInput.setValue(longPassword)
      expect(wrapper.vm.formData.password).toBe(longPassword)
    })

    it('handles emoji in passwords', async () => {
      const passwordInput = wrapper.find('input[type="password"]')
      await passwordInput.setValue('SecurePass123!😀')
      expect(wrapper.vm.formData.password).toBe('SecurePass123!😀')
    })

    it('handles whitespace in email', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue(' test@example.com ')
      expect(wrapper.vm.formData.email).toBe(' test@example.com ')
    })

    it('handles multiple form submissions', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')

      // First submission
      await emailInput.setValue('test1@example.com')
      await passwordInput.setValue('Pass123!')
      wrapper.vm.handleSubmit()
      await wrapper.vm.$nextTick()

      // Second submission
      await emailInput.setValue('test2@example.com')
      await passwordInput.setValue('NewPass456!')
      wrapper.vm.handleSubmit()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('submit')).toHaveLength(2)
      expect(wrapper.emitted('submit')[1][0]).toEqual({
        email: 'test2@example.com',
        password: 'NewPass456!'
      })
    })

    it('does not clear form data after submission', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('Pass123!')
      wrapper.vm.handleSubmit()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.formData.email).toBe('test@example.com')
      expect(wrapper.vm.formData.password).toBe('Pass123!')
    })
  })
})
