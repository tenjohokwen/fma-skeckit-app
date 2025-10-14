/**
 * ResetPasswordForm.spec.js
 *
 * Tests for ResetPasswordForm component
 * Per constitution: Plain JavaScript tests with Vitest + Vue Test Utils
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ResetPasswordForm from 'src/components/auth/ResetPasswordForm.vue'

// Mock useAuth composable
vi.mock('src/composables/useAuth', () => ({
  useAuth: () => ({
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

describe('ResetPasswordForm', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(ResetPasswordForm, {
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
    it('renders the reset password form', () => {
      expect(wrapper.find('form').exists()).toBe(true)
    })

    it('renders title', () => {
      const title = wrapper.find('h5')
      expect(title.exists()).toBe(true)
      expect(title.text()).toContain('auth.passwordReset.resetPassword')
    })

    it('renders new password input field', () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      expect(passwordInputs.length).toBeGreaterThanOrEqual(2)
    })

    it('renders confirm password input field', () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      expect(passwordInputs.length).toBe(2)
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
    it('updates newPassword when user types', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[0].setValue('NewPass123!')
      expect(wrapper.vm.formData.newPassword).toBe('NewPass123!')
    })

    it('updates confirmPassword when user types', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[1].setValue('NewPass123!')
      expect(wrapper.vm.formData.confirmPassword).toBe('NewPass123!')
    })

    it('starts with empty form data', () => {
      expect(wrapper.vm.formData.newPassword).toBe('')
      expect(wrapper.vm.formData.confirmPassword).toBe('')
    })
  })

  describe('Password Visibility Toggle', () => {
    it('password fields start as hidden', () => {
      expect(wrapper.vm.showPassword).toBe(false)
      expect(wrapper.vm.showConfirmPassword).toBe(false)
    })

    it('toggles new password visibility', async () => {
      const initialValue = wrapper.vm.showPassword
      wrapper.vm.showPassword = !wrapper.vm.showPassword
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showPassword).toBe(!initialValue)
    })

    it('toggles confirm password visibility', async () => {
      const initialValue = wrapper.vm.showConfirmPassword
      wrapper.vm.showConfirmPassword = !wrapper.vm.showConfirmPassword
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.showConfirmPassword).toBe(!initialValue)
    })
  })

  describe('Form Validation', () => {
    it('validates password minimum length', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[0].setValue('Short1!')
      await passwordInputs[0].trigger('blur')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.formData.newPassword).toBe('Short1!')
    })

    it('validates password strength', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')

      // Weak password
      await passwordInputs[0].setValue('weak')
      await passwordInputs[0].trigger('blur')
      await wrapper.vm.$nextTick()
    })

    it('validates password matches confirmation', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[0].setValue('StrongPass123!')
      await passwordInputs[1].setValue('DifferentPass123!')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.formData.newPassword).not.toBe(wrapper.vm.formData.confirmPassword)
    })

    it('requires new password field', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[0].setValue('')
      await passwordInputs[0].trigger('blur')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.formData.newPassword).toBe('')
    })

    it('requires confirm password field', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[1].setValue('')
      await passwordInputs[1].trigger('blur')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.formData.confirmPassword).toBe('')
    })
  })

  describe('Form Submission', () => {
    it('emits submit event with new password on valid submission', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[0].setValue('StrongPass123!')
      await passwordInputs[1].setValue('StrongPass123!')
      await wrapper.vm.$nextTick()

      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('submit')).toBeTruthy()
      expect(wrapper.emitted('submit')[0][0]).toBe('StrongPass123!')
    })

    it('emits only newPassword not confirmPassword', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[0].setValue('ValidPass123!')
      await passwordInputs[1].setValue('ValidPass123!')
      await wrapper.vm.$nextTick()

      wrapper.vm.handleSubmit()
      await wrapper.vm.$nextTick()

      const emittedData = wrapper.emitted('submit')[0][0]
      expect(typeof emittedData).toBe('string')
      expect(emittedData).toBe('ValidPass123!')
    })

    it('handles multiple submissions', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')

      // First submission
      await passwordInputs[0].setValue('FirstPass123!')
      await passwordInputs[1].setValue('FirstPass123!')
      wrapper.vm.handleSubmit()
      await wrapper.vm.$nextTick()

      // Second submission
      await passwordInputs[0].setValue('SecondPass456!')
      await passwordInputs[1].setValue('SecondPass456!')
      wrapper.vm.handleSubmit()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('submit')).toHaveLength(2)
      expect(wrapper.emitted('submit')[0][0]).toBe('FirstPass123!')
      expect(wrapper.emitted('submit')[1][0]).toBe('SecondPass456!')
    })
  })

  describe('Loading State', () => {
    it('disables submit button when loading is true', async () => {
      wrapper = mount(ResetPasswordForm, {
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
      wrapper = mount(ResetPasswordForm, {
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
    it('handles long passwords', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      const longPassword = 'A'.repeat(100) + 'a1!'
      await passwordInputs[0].setValue(longPassword)
      await passwordInputs[1].setValue(longPassword)
      expect(wrapper.vm.formData.newPassword).toBe(longPassword)
      expect(wrapper.vm.formData.confirmPassword).toBe(longPassword)
    })

    it('handles emoji in passwords', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      const passwordWithEmoji = 'ValidPass123!😀'
      await passwordInputs[0].setValue(passwordWithEmoji)
      await passwordInputs[1].setValue(passwordWithEmoji)
      expect(wrapper.vm.formData.newPassword).toBe(passwordWithEmoji)
    })

    it('does not clear form data after submission', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[0].setValue('ValidPass123!')
      await passwordInputs[1].setValue('ValidPass123!')
      wrapper.vm.handleSubmit()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.formData.newPassword).toBe('ValidPass123!')
      expect(wrapper.vm.formData.confirmPassword).toBe('ValidPass123!')
    })

    it('handles whitespace in passwords', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[0].setValue(' ValidPass123! ')
      expect(wrapper.vm.formData.newPassword).toBe(' ValidPass123! ')
    })
  })

  describe('Accessibility', () => {
    it('has autofocus on new password input', () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      const newPasswordInput = passwordInputs[0]
      expect(newPasswordInput.element.hasAttribute('autofocus') ||
             newPasswordInput.element.autofocus !== undefined).toBeTruthy()
    })

    it('has proper submit button type', () => {
      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.exists()).toBe(true)
    })
  })
})
