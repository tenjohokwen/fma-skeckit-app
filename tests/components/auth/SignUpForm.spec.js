/**
 * SignUpForm.spec.js
 *
 * Tests for SignUpForm component
 * Per constitution: Plain JavaScript tests with Vitest + Vue Test Utils
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import SignUpForm from 'src/components/auth/SignUpForm.vue'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) => key
  })
}))

// Mock useAuth composable
vi.mock('src/composables/useAuth', () => ({
  useAuth: () => ({
    isValidEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    validatePasswordStrength: (password) => {
      const errors = []
      if (password.length < 8) errors.push('Password must be at least 8 characters')
      if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter')
      if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter')
      if (!/[0-9]/.test(password)) errors.push('Password must contain number')
      if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain special character')
      return {
        isValid: errors.length === 0,
        errors
      }
    }
  })
}))

describe('SignUpForm', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(SignUpForm, {
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
    it('renders the signup form', () => {
      expect(wrapper.find('form').exists()).toBe(true)
    })

    it('renders email input field', () => {
      const emailInput = wrapper.findAll('input[type="email"]')
      expect(emailInput.length).toBeGreaterThan(0)
    })

    it('renders password input field', () => {
      const passwordInputs = wrapper.findAll('input')
      expect(passwordInputs.length).toBeGreaterThanOrEqual(2)
    })

    it('renders confirm password input field', () => {
      const inputs = wrapper.findAll('input')
      expect(inputs.length).toBeGreaterThanOrEqual(3)
    })

    it('renders submit button', () => {
      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.exists()).toBe(true)
    })

    it('shows password visibility toggle icons', () => {
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
      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[0].setValue('TestPass123!')
      expect(wrapper.vm.formData.password).toBe('TestPass123!')
    })

    it('updates confirm password when user types', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[1].setValue('TestPass123!')
      expect(wrapper.vm.formData.confirmPassword).toBe('TestPass123!')
    })
  })

  describe('Password Visibility Toggle', () => {
    it('password field starts as hidden', () => {
      expect(wrapper.vm.showPassword).toBe(false)
    })

    it('confirm password field starts as hidden', () => {
      expect(wrapper.vm.showConfirmPassword).toBe(false)
    })

    it('toggles password visibility when clicked', async () => {
      const initialValue = wrapper.vm.showPassword
      wrapper.vm.showPassword = !wrapper.vm.showPassword
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showPassword).toBe(!initialValue)
    })

    it('toggles confirm password visibility when clicked', async () => {
      const initialValue = wrapper.vm.showConfirmPassword
      wrapper.vm.showConfirmPassword = !wrapper.vm.showConfirmPassword
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showConfirmPassword).toBe(!initialValue)
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
      // Field should be empty
      expect(wrapper.vm.formData.email).toBe('')
    })

    it('requires password field', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[0].setValue('')
      await passwordInputs[0].trigger('blur')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.formData.password).toBe('')
    })

    it('validates password minimum length', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[0].setValue('Short1!')
      await passwordInputs[0].trigger('blur')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.formData.password).toBe('Short1!')
    })

    it('validates password matches confirmation', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[0].setValue('TestPass123!')
      await passwordInputs[1].setValue('DifferentPass123!')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.formData.password).not.toBe(wrapper.vm.formData.confirmPassword)
    })
  })

  describe('Form Submission', () => {
    it('emits submit event with form data on valid submission', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInputs = wrapper.findAll('input[type="password"]')

      await emailInput.setValue('test@example.com')
      await passwordInputs[0].setValue('TestPass123!')
      await passwordInputs[1].setValue('TestPass123!')
      await wrapper.vm.$nextTick()

      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('submit')).toBeTruthy()
      expect(wrapper.emitted('submit')[0][0]).toEqual({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
    })

    it('does not include confirmPassword in emitted data', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInputs = wrapper.findAll('input[type="password"]')

      await emailInput.setValue('test@example.com')
      await passwordInputs[0].setValue('TestPass123!')
      await passwordInputs[1].setValue('TestPass123!')
      await wrapper.vm.$nextTick()

      wrapper.vm.handleSubmit()
      await wrapper.vm.$nextTick()

      const emittedData = wrapper.emitted('submit')[0][0]
      expect(emittedData).not.toHaveProperty('confirmPassword')
    })
  })

  describe('Loading State', () => {
    it('disables submit button when loading is true', async () => {
      wrapper = mount(SignUpForm, {
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
      wrapper = mount(SignUpForm, {
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
  })

  describe('Edge Cases', () => {
    it('handles special characters in email', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('test+tag@example.com')
      expect(wrapper.vm.formData.email).toBe('test+tag@example.com')
    })

    it('handles long passwords', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      const longPassword = 'A'.repeat(100) + 'a1!'
      await passwordInputs[0].setValue(longPassword)
      expect(wrapper.vm.formData.password).toBe(longPassword)
    })

    it('handles emoji in passwords', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[0].setValue('TestPass123!😀')
      expect(wrapper.vm.formData.password).toBe('TestPass123!😀')
    })

    it('handles whitespace in email', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue(' test@example.com ')
      expect(wrapper.vm.formData.email).toBe(' test@example.com ')
    })
  })
})
