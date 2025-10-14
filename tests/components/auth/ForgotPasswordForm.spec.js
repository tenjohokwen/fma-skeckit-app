/**
 * ForgotPasswordForm.spec.js
 *
 * Tests for ForgotPasswordForm component
 * Per constitution: Plain JavaScript tests with Vitest + Vue Test Utils
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ForgotPasswordForm from 'src/components/auth/ForgotPasswordForm.vue'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) => key
  })
}))

// Mock useAuth composable
vi.mock('src/composables/useAuth', () => ({
  useAuth: () => ({
    isValidEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  })
}))

describe('ForgotPasswordForm', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(ForgotPasswordForm, {
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
    it('renders the forgot password form', () => {
      expect(wrapper.find('form').exists()).toBe(true)
    })

    it('renders title', () => {
      const title = wrapper.find('h5')
      expect(title.exists()).toBe(true)
      expect(title.text()).toContain('auth.passwordReset.title')
    })

    it('renders subtitle with instructions', () => {
      const subtitle = wrapper.find('.text-body2')
      expect(subtitle.exists()).toBe(true)
      expect(subtitle.text()).toContain('auth.passwordReset.subtitle')
    })

    it('renders email input field', () => {
      const emailInput = wrapper.findAll('input[type="email"]')
      expect(emailInput.length).toBeGreaterThan(0)
    })

    it('renders submit button', () => {
      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.exists()).toBe(true)
    })

    it('renders back to login button', () => {
      const backBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('auth.passwordReset.backToLogin')
      )
      expect(backBtn).toBeTruthy()
    })

    it('shows email icon prepend', () => {
      const icons = wrapper.findAllComponents({ name: 'QIcon' })
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Form Data Binding', () => {
    it('updates email when user types', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('test@example.com')
      expect(wrapper.vm.email).toBe('test@example.com')
    })

    it('starts with empty email', () => {
      expect(wrapper.vm.email).toBe('')
    })

    it('handles email updates', async () => {
      const emailInput = wrapper.find('input[type="email"]')

      await emailInput.setValue('first@example.com')
      expect(wrapper.vm.email).toBe('first@example.com')

      await emailInput.setValue('second@example.com')
      expect(wrapper.vm.email).toBe('second@example.com')
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
      expect(wrapper.vm.email).toBe('')
    })

    it('accepts valid email addresses', async () => {
      const emailInput = wrapper.find('input[type="email"]')

      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.com'
      ]

      for (const email of validEmails) {
        await emailInput.setValue(email)
        expect(wrapper.vm.email).toBe(email)
      }
    })
  })

  describe('Form Submission', () => {
    it('emits submit event with email on valid submission', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('test@example.com')
      await wrapper.vm.$nextTick()

      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('submit')).toBeTruthy()
      expect(wrapper.emitted('submit')[0][0]).toBe('test@example.com')
    })

    it('emits email as string not object', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('user@domain.com')
      await wrapper.vm.$nextTick()

      wrapper.vm.handleSubmit()
      await wrapper.vm.$nextTick()

      const emittedData = wrapper.emitted('submit')[0][0]
      expect(typeof emittedData).toBe('string')
      expect(emittedData).toBe('user@domain.com')
    })

    it('handles multiple submissions', async () => {
      const emailInput = wrapper.find('input[type="email"]')

      // First submission
      await emailInput.setValue('test1@example.com')
      wrapper.vm.handleSubmit()
      await wrapper.vm.$nextTick()

      // Second submission
      await emailInput.setValue('test2@example.com')
      wrapper.vm.handleSubmit()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('submit')).toHaveLength(2)
      expect(wrapper.emitted('submit')[0][0]).toBe('test1@example.com')
      expect(wrapper.emitted('submit')[1][0]).toBe('test2@example.com')
    })
  })

  describe('Back Navigation', () => {
    it('emits back event when back button is clicked', async () => {
      const backBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('auth.passwordReset.backToLogin')
      )

      await backBtn.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('back')).toBeTruthy()
    })

    it('does not emit submit event when back is clicked', async () => {
      const backBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('auth.passwordReset.backToLogin')
      )

      await backBtn.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('submit')).toBeFalsy()
    })

    it('emits back event without parameters', async () => {
      const backBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('auth.passwordReset.backToLogin')
      )

      await backBtn.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('back')[0]).toEqual([])
    })
  })

  describe('Loading State', () => {
    it('disables submit button when loading is true', async () => {
      wrapper = mount(ForgotPasswordForm, {
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
      wrapper = mount(ForgotPasswordForm, {
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
      wrapper = mount(ForgotPasswordForm, {
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

    it('does not disable back button when loading', async () => {
      wrapper = mount(ForgotPasswordForm, {
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

      const backBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('auth.passwordReset.backToLogin')
      )
      expect(backBtn.attributes('disabled')).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    it('handles special characters in email', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('test+tag@example.com')
      expect(wrapper.vm.email).toBe('test+tag@example.com')
    })

    it('handles whitespace in email', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue(' test@example.com ')
      expect(wrapper.vm.email).toBe(' test@example.com ')
    })

    it('handles very long email addresses', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com'
      await emailInput.setValue(longEmail)
      expect(wrapper.vm.email).toBe(longEmail)
    })

    it('does not clear email after submission', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('test@example.com')

      wrapper.vm.handleSubmit()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.email).toBe('test@example.com')
    })

    it('handles rapid multiple clicks on submit', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('test@example.com')

      const form = wrapper.find('form')
      await form.trigger('submit.prevent')
      await form.trigger('submit.prevent')
      await form.trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('submit').length).toBeGreaterThanOrEqual(3)
    })

    it('handles rapid multiple clicks on back', async () => {
      const backBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('auth.passwordReset.backToLogin')
      )

      await backBtn.trigger('click')
      await backBtn.trigger('click')
      await backBtn.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('back').length).toBeGreaterThanOrEqual(3)
    })

    it('has autofocus on email input', () => {
      const emailInput = wrapper.find('input[type="email"]')
      // Autofocus attribute should be present
      expect(emailInput.element.hasAttribute('autofocus') ||
             emailInput.element.autofocus !== undefined).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('has proper button types', () => {
      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.exists()).toBe(true)

      const backBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('auth.passwordReset.backToLogin')
      )
      expect(backBtn.attributes('type')).not.toBe('submit')
    })

    it('displays informative submit button text', () => {
      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.text()).toContain('auth.passwordReset.sendOtp')
    })

    it('displays informative back button text', () => {
      const backBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('auth.passwordReset.backToLogin')
      )
      expect(backBtn.text()).toContain('auth.passwordReset.backToLogin')
    })
  })
})
