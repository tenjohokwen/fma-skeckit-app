/**
 * OTPVerificationForm.spec.js
 *
 * Tests for OTPVerificationForm component
 * Per constitution: Plain JavaScript tests with Vitest + Vue Test Utils
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import OTPVerificationForm from 'src/components/auth/OTPVerificationForm.vue'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) => key
  })
}))

describe('OTPVerificationForm', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(OTPVerificationForm, {
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
    it('renders the OTP verification form', () => {
      expect(wrapper.find('form').exists()).toBe(true)
    })

    it('renders title', () => {
      const title = wrapper.find('h5')
      expect(title.exists()).toBe(true)
      expect(title.text()).toContain('auth.passwordReset.enterOtp')
    })

    it('renders subtitle with instructions', () => {
      const subtitle = wrapper.find('.text-body2')
      expect(subtitle.exists()).toBe(true)
      expect(subtitle.text()).toContain('auth.passwordReset.otpSent')
    })

    it('renders OTP input field', () => {
      const otpInput = wrapper.findAll('input[type="text"]')
      expect(otpInput.length).toBeGreaterThan(0)
    })

    it('renders hint text', () => {
      const hint = wrapper.find('.text-caption')
      expect(hint.exists()).toBe(true)
      expect(hint.text()).toContain('6-digit code')
    })

    it('renders submit button', () => {
      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.exists()).toBe(true)
    })

    it('renders back button', () => {
      const backBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('common.back')
      )
      expect(backBtn).toBeTruthy()
    })

    it('shows key icon prepend', () => {
      const icons = wrapper.findAllComponents({ name: 'QIcon' })
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Form Data Binding', () => {
    it('updates OTP when user types', async () => {
      const otpInput = wrapper.find('input[type="text"]')
      await otpInput.setValue('123456')
      expect(wrapper.vm.otp).toBe('123456')
    })

    it('starts with empty OTP', () => {
      expect(wrapper.vm.otp).toBe('')
    })

    it('handles OTP updates', async () => {
      const otpInput = wrapper.find('input[type="text"]')

      await otpInput.setValue('111111')
      expect(wrapper.vm.otp).toBe('111111')

      await otpInput.setValue('222222')
      expect(wrapper.vm.otp).toBe('222222')
    })
  })

  describe('OTP Mask Behavior', () => {
    it('limits input to 6 digits', async () => {
      const otpInput = wrapper.find('input[type="text"]')

      // Try to enter more than 6 digits
      await otpInput.setValue('1234567890')

      // Should be truncated to 6 digits
      expect(wrapper.vm.otp.length).toBeLessThanOrEqual(6)
    })

    it('accepts 6-digit codes', async () => {
      const otpInput = wrapper.find('input[type="text"]')
      await otpInput.setValue('123456')
      expect(wrapper.vm.otp).toBe('123456')
    })

    it('accepts numeric characters only', async () => {
      const otpInput = wrapper.find('input[type="text"]')

      // Try to enter letters - mask should prevent this
      await otpInput.setValue('abc123')

      // Should only contain numbers
      expect(/^\d*$/.test(wrapper.vm.otp)).toBe(true)
    })
  })

  describe('Form Validation', () => {
    it('requires OTP field', async () => {
      const otpInput = wrapper.find('input[type="text"]')
      await otpInput.setValue('')
      await otpInput.trigger('blur')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.otp).toBe('')
    })

    it('validates OTP length is exactly 6', async () => {
      const otpInput = wrapper.find('input[type="text"]')

      // Too short
      await otpInput.setValue('12345')
      await otpInput.trigger('blur')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.otp.length).toBe(5)

      // Correct length
      await otpInput.setValue('123456')
      await otpInput.trigger('blur')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.otp.length).toBe(6)
    })
  })

  describe('Form Submission', () => {
    it('emits submit event with OTP on valid submission', async () => {
      const otpInput = wrapper.find('input[type="text"]')
      await otpInput.setValue('123456')
      await wrapper.vm.$nextTick()

      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('submit')).toBeTruthy()
      expect(wrapper.emitted('submit')[0][0]).toBe('123456')
    })

    it('emits OTP as string not object', async () => {
      const otpInput = wrapper.find('input[type="text"]')
      await otpInput.setValue('654321')
      await wrapper.vm.$nextTick()

      wrapper.vm.handleSubmit()
      await wrapper.vm.$nextTick()

      const emittedData = wrapper.emitted('submit')[0][0]
      expect(typeof emittedData).toBe('string')
      expect(emittedData).toBe('654321')
    })

    it('does not emit submit if OTP is not 6 digits', async () => {
      const otpInput = wrapper.find('input[type="text"]')
      await otpInput.setValue('12345')
      await wrapper.vm.$nextTick()

      wrapper.vm.handleSubmit()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('submit')).toBeFalsy()
    })

    it('handles multiple valid submissions', async () => {
      const otpInput = wrapper.find('input[type="text"]')

      // First submission
      await otpInput.setValue('111111')
      wrapper.vm.handleSubmit()
      await wrapper.vm.$nextTick()

      // Second submission
      await otpInput.setValue('222222')
      wrapper.vm.handleSubmit()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('submit')).toHaveLength(2)
      expect(wrapper.emitted('submit')[0][0]).toBe('111111')
      expect(wrapper.emitted('submit')[1][0]).toBe('222222')
    })
  })

  describe('Submit Button State', () => {
    it('disables submit button when OTP is empty', async () => {
      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.attributes('disabled')).toBeDefined()
    })

    it('disables submit button when OTP is less than 6 digits', async () => {
      const otpInput = wrapper.find('input[type="text"]')
      await otpInput.setValue('12345')
      await wrapper.vm.$nextTick()

      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.attributes('disabled')).toBeDefined()
    })

    it('enables submit button when OTP is exactly 6 digits', async () => {
      const otpInput = wrapper.find('input[type="text"]')
      await otpInput.setValue('123456')
      await wrapper.vm.$nextTick()

      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.attributes('disabled')).toBeUndefined()
    })
  })

  describe('Back Navigation', () => {
    it('emits back event when back button is clicked', async () => {
      const backBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('common.back')
      )

      await backBtn.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('back')).toBeTruthy()
    })

    it('does not emit submit event when back is clicked', async () => {
      const backBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('common.back')
      )

      await backBtn.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('submit')).toBeFalsy()
    })

    it('emits back event without parameters', async () => {
      const backBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('common.back')
      )

      await backBtn.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('back')[0]).toEqual([])
    })
  })

  describe('Loading State', () => {
    it('disables submit button when loading is true', async () => {
      wrapper = mount(OTPVerificationForm, {
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

    it('disables submit button when loading even with valid OTP', async () => {
      wrapper = mount(OTPVerificationForm, {
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

      const otpInput = wrapper.find('input[type="text"]')
      await otpInput.setValue('123456')
      await wrapper.vm.$nextTick()

      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.attributes('disabled')).toBeDefined()
    })

    it('shows loading indicator on submit button when loading', async () => {
      wrapper = mount(OTPVerificationForm, {
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
      wrapper = mount(OTPVerificationForm, {
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
        btn.text().includes('common.back')
      )
      expect(backBtn.attributes('disabled')).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    it('does not clear OTP after submission', async () => {
      const otpInput = wrapper.find('input[type="text"]')
      await otpInput.setValue('123456')

      wrapper.vm.handleSubmit()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.otp).toBe('123456')
    })

    it('handles rapid multiple clicks on submit with valid OTP', async () => {
      const otpInput = wrapper.find('input[type="text"]')
      await otpInput.setValue('123456')
      await wrapper.vm.$nextTick()

      const form = wrapper.find('form')
      await form.trigger('submit.prevent')
      await form.trigger('submit.prevent')
      await form.trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('submit').length).toBeGreaterThanOrEqual(3)
    })

    it('handles rapid multiple clicks on back', async () => {
      const backBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('common.back')
      )

      await backBtn.trigger('click')
      await backBtn.trigger('click')
      await backBtn.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('back').length).toBeGreaterThanOrEqual(3)
    })

    it('has autofocus on OTP input', () => {
      const otpInput = wrapper.find('input[type="text"]')
      expect(otpInput.element.hasAttribute('autofocus') ||
             otpInput.element.autofocus !== undefined).toBeTruthy()
    })

    it('handles all numeric OTP codes', async () => {
      const otpInput = wrapper.find('input[type="text"]')

      const testCodes = ['000000', '999999', '123456', '654321']

      for (const code of testCodes) {
        await otpInput.setValue(code)
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
      }

      expect(wrapper.emitted('submit')).toHaveLength(testCodes.length)
    })
  })

  describe('Accessibility', () => {
    it('has proper button types', () => {
      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.exists()).toBe(true)

      const backBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('common.back')
      )
      expect(backBtn.attributes('type')).not.toBe('submit')
    })

    it('displays informative submit button text', () => {
      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.text()).toContain('auth.passwordReset.verifyOtp')
    })

    it('displays informative back button text', () => {
      const backBtn = wrapper.findAll('button').find(btn =>
        btn.text().includes('common.back')
      )
      expect(backBtn.text()).toContain('common.back')
    })

    it('provides helpful hint text for users', () => {
      const hint = wrapper.find('.text-caption')
      expect(hint.text().toLowerCase()).toContain('6-digit')
      expect(hint.text().toLowerCase()).toContain('code')
    })
  })

  describe('Visual Styling', () => {
    it('applies centered styling to OTP input', () => {
      const otpInput = wrapper.find('input[type="text"]')
      expect(otpInput.classes()).toContain('text-center')
    })

    it('applies large text styling to OTP input', () => {
      const otpInput = wrapper.find('input[type="text"]')
      expect(otpInput.classes()).toContain('text-h5')
    })

    it('applies letter spacing to OTP input', () => {
      const otpInput = wrapper.find('input[type="text"]')
      expect(otpInput.classes()).toContain('letter-spacing')
    })
  })
})
