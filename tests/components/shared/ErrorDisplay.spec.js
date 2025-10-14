/**
 * ErrorDisplay.spec.js
 *
 * Tests for ErrorDisplay component
 * Per constitution: Plain JavaScript tests with Vitest + Vue Test Utils
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ErrorDisplay from 'src/components/shared/ErrorDisplay.vue'

describe('ErrorDisplay', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(ErrorDisplay, {
      props: {
        message: 'Test error message'
      },
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          QBanner: { template: '<div class="q-banner"><slot name="avatar" /><slot /><slot name="action" /></div>' },
          QIcon: { template: '<i class="q-icon"></i>', props: ['name', 'size'] },
          QBtn: { template: '<button class="q-btn" @click="$emit(\'click\')"></button>', props: ['flat', 'round', 'dense', 'icon', 'color'] }
        }
      }
    })
  })

  describe('Component Rendering', () => {
    it('renders the error display', () => {
      expect(wrapper.find('.error-display').exists()).toBe(true)
    })

    it('renders banner', () => {
      expect(wrapper.find('.q-banner').exists()).toBe(true)
    })

    it('renders icon', () => {
      expect(wrapper.find('.q-icon').exists()).toBe(true)
    })

    it('renders error message', () => {
      expect(wrapper.find('.error-message').exists()).toBe(true)
      expect(wrapper.find('.error-message').text()).toBe('Test error message')
    })

    it('does not render title by default', () => {
      expect(wrapper.find('.error-title').exists()).toBe(false)
    })

    it('does not render details by default', () => {
      expect(wrapper.find('.error-details').exists()).toBe(false)
    })

    it('renders dismiss button by default', () => {
      expect(wrapper.find('.q-btn').exists()).toBe(true)
    })
  })

  describe('Required Props', () => {
    it('requires message prop', () => {
      const messageProp = ErrorDisplay.props.message
      expect(messageProp.required).toBe(true)
    })
  })

  describe('Default Props', () => {
    it('uses default type error', () => {
      expect(wrapper.props('type')).toBe('error')
    })

    it('uses default empty title', () => {
      expect(wrapper.props('title')).toBe('')
    })

    it('uses default empty details', () => {
      expect(wrapper.props('details')).toBe('')
    })

    it('is dismissible by default', () => {
      expect(wrapper.props('dismissible')).toBe(true)
    })
  })

  describe('Error Type: error', () => {
    it('uses negative color for error type', () => {
      expect(wrapper.vm.color).toBe('negative')
    })

    it('uses error icon for error type', () => {
      expect(wrapper.vm.icon).toBe('error')
    })

    it('applies error class', () => {
      expect(wrapper.find('.error-display').classes()).toContain('error-error')
    })
  })

  describe('Error Type: warning', () => {
    beforeEach(async () => {
      await wrapper.setProps({ type: 'warning' })
    })

    it('uses warning color for warning type', () => {
      expect(wrapper.vm.color).toBe('warning')
    })

    it('uses warning icon for warning type', () => {
      expect(wrapper.vm.icon).toBe('warning')
    })

    it('applies warning class', () => {
      expect(wrapper.find('.error-display').classes()).toContain('error-warning')
    })
  })

  describe('Error Type: info', () => {
    beforeEach(async () => {
      await wrapper.setProps({ type: 'info' })
    })

    it('uses info color for info type', () => {
      expect(wrapper.vm.color).toBe('info')
    })

    it('uses info icon for info type', () => {
      expect(wrapper.vm.icon).toBe('info')
    })

    it('applies info class', () => {
      expect(wrapper.find('.error-display').classes()).toContain('error-info')
    })
  })

  describe('Title Display', () => {
    it('shows title when provided', async () => {
      await wrapper.setProps({ title: 'Error Title' })

      const title = wrapper.find('.error-title')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('Error Title')
    })

    it('hides title when not provided', () => {
      expect(wrapper.find('.error-title').exists()).toBe(false)
    })

    it('hides title when empty string', async () => {
      await wrapper.setProps({ title: '' })
      expect(wrapper.find('.error-title').exists()).toBe(false)
    })
  })

  describe('Details Display', () => {
    it('shows details when provided', async () => {
      await wrapper.setProps({ details: 'Additional error information' })

      const details = wrapper.find('.error-details')
      expect(details.exists()).toBe(true)
      expect(details.text()).toBe('Additional error information')
    })

    it('hides details when not provided', () => {
      expect(wrapper.find('.error-details').exists()).toBe(false)
    })

    it('hides details when empty string', async () => {
      await wrapper.setProps({ details: '' })
      expect(wrapper.find('.error-details').exists()).toBe(false)
    })
  })

  describe('Dismissible Functionality', () => {
    it('shows dismiss button when dismissible is true', () => {
      expect(wrapper.find('.q-btn').exists()).toBe(true)
    })

    it('hides dismiss button when dismissible is false', async () => {
      await wrapper.setProps({ dismissible: false })

      expect(wrapper.find('.q-btn').exists()).toBe(false)
    })

    it('applies dismissible class when dismissible is true', () => {
      expect(wrapper.find('.error-display').classes()).toContain('dismissible')
    })

    it('does not apply dismissible class when dismissible is false', async () => {
      await wrapper.setProps({ dismissible: false })

      expect(wrapper.find('.error-display').classes()).not.toContain('dismissible')
    })

    it('emits dismiss event when dismiss button is clicked', async () => {
      const dismissBtn = wrapper.find('.q-btn')
      await dismissBtn.trigger('click')

      expect(wrapper.emitted('dismiss')).toBeTruthy()
      expect(wrapper.emitted('dismiss').length).toBe(1)
    })

    it('emits dismiss event multiple times', async () => {
      const dismissBtn = wrapper.find('.q-btn')

      await dismissBtn.trigger('click')
      await dismissBtn.trigger('click')
      await dismissBtn.trigger('click')

      expect(wrapper.emitted('dismiss').length).toBe(3)
    })
  })

  describe('Complete Error Display', () => {
    it('displays all information when provided', async () => {
      await wrapper.setProps({
        type: 'warning',
        title: 'Warning Title',
        message: 'Warning message text',
        details: 'Additional warning details',
        dismissible: true
      })

      expect(wrapper.find('.error-title').text()).toBe('Warning Title')
      expect(wrapper.find('.error-message').text()).toBe('Warning message text')
      expect(wrapper.find('.error-details').text()).toBe('Additional warning details')
      expect(wrapper.find('.q-btn').exists()).toBe(true)
      expect(wrapper.vm.color).toBe('warning')
      expect(wrapper.vm.icon).toBe('warning')
    })
  })

  describe('Type Validation', () => {
    it('accepts valid type error', () => {
      const typeValidator = ErrorDisplay.props.type.validator
      expect(typeValidator('error')).toBe(true)
    })

    it('accepts valid type warning', () => {
      const typeValidator = ErrorDisplay.props.type.validator
      expect(typeValidator('warning')).toBe(true)
    })

    it('accepts valid type info', () => {
      const typeValidator = ErrorDisplay.props.type.validator
      expect(typeValidator('info')).toBe(true)
    })

    it('rejects invalid type', () => {
      const typeValidator = ErrorDisplay.props.type.validator
      expect(typeValidator('invalid')).toBe(false)
    })

    it('rejects empty type', () => {
      const typeValidator = ErrorDisplay.props.type.validator
      expect(typeValidator('')).toBe(false)
    })
  })

  describe('Message Variations', () => {
    it('displays short messages', async () => {
      await wrapper.setProps({ message: 'Error' })
      expect(wrapper.find('.error-message').text()).toBe('Error')
    })

    it('displays long messages', async () => {
      const longMessage = 'This is a very long error message that contains lots of information about what went wrong and how to fix it'
      await wrapper.setProps({ message: longMessage })
      expect(wrapper.find('.error-message').text()).toBe(longMessage)
    })

    it('displays multi-line messages', async () => {
      const multiLineMessage = 'Line 1\nLine 2\nLine 3'
      await wrapper.setProps({ message: multiLineMessage })
      expect(wrapper.find('.error-message').text()).toBe(multiLineMessage)
    })

    it('displays messages with special characters', async () => {
      const specialMessage = 'Error: <script>alert("xss")</script>'
      await wrapper.setProps({ message: specialMessage })
      expect(wrapper.find('.error-message').text()).toBe(specialMessage)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty title gracefully', async () => {
      await wrapper.setProps({ title: '' })
      expect(wrapper.find('.error-title').exists()).toBe(false)
    })

    it('handles empty details gracefully', async () => {
      await wrapper.setProps({ details: '' })
      expect(wrapper.find('.error-details').exists()).toBe(false)
    })

    it('handles null title', async () => {
      await wrapper.setProps({ title: null })
      expect(wrapper.find('.error-title').exists()).toBe(false)
    })

    it('handles null details', async () => {
      await wrapper.setProps({ details: null })
      expect(wrapper.find('.error-details').exists()).toBe(false)
    })

    it('handles type change', async () => {
      expect(wrapper.vm.color).toBe('negative')

      await wrapper.setProps({ type: 'info' })
      expect(wrapper.vm.color).toBe('info')

      await wrapper.setProps({ type: 'warning' })
      expect(wrapper.vm.color).toBe('warning')

      await wrapper.setProps({ type: 'error' })
      expect(wrapper.vm.color).toBe('negative')
    })

    it('handles dismissible toggle', async () => {
      expect(wrapper.find('.q-btn').exists()).toBe(true)

      await wrapper.setProps({ dismissible: false })
      expect(wrapper.find('.q-btn').exists()).toBe(false)

      await wrapper.setProps({ dismissible: true })
      expect(wrapper.find('.q-btn').exists()).toBe(true)
    })
  })
})
