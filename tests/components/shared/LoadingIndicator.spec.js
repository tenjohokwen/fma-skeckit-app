/**
 * LoadingIndicator.spec.js
 *
 * Tests for LoadingIndicator component
 * Per constitution: Plain JavaScript tests with Vitest + Vue Test Utils
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue'

describe('LoadingIndicator', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(LoadingIndicator, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          QSpinner: {
            template: '<div class="q-spinner"></div>',
            props: ['color', 'size', 'thickness']
          }
        }
      }
    })
  })

  describe('Component Rendering', () => {
    it('renders the loading indicator', () => {
      expect(wrapper.find('.loading-indicator').exists()).toBe(true)
    })

    it('renders spinner', () => {
      expect(wrapper.findComponent({ name: 'QSpinner' }).exists()).toBe(true)
    })

    it('does not render message by default', () => {
      expect(wrapper.find('.loading-message').exists()).toBe(false)
    })

    it('renders message when provided', async () => {
      await wrapper.setProps({ message: 'Loading data...' })

      expect(wrapper.find('.loading-message').exists()).toBe(true)
      expect(wrapper.find('.loading-message').text()).toBe('Loading data...')
    })
  })

  describe('Default Props', () => {
    it('uses default color primary', () => {
      const spinner = wrapper.findComponent({ name: 'QSpinner' })
      expect(spinner.props('color')).toBe('primary')
    })

    it('uses default size 50px', () => {
      const spinner = wrapper.findComponent({ name: 'QSpinner' })
      expect(spinner.props('size')).toBe('50px')
    })

    it('uses default thickness 5', () => {
      const spinner = wrapper.findComponent({ name: 'QSpinner' })
      expect(spinner.props('thickness')).toBe(5)
    })

    it('is not full-screen by default', () => {
      expect(wrapper.find('.loading-indicator').classes()).not.toContain('full-screen')
    })

    it('has empty message by default', () => {
      expect(wrapper.props('message')).toBe('')
    })
  })

  describe('Custom Props', () => {
    it('accepts custom color', async () => {
      await wrapper.setProps({ color: 'secondary' })

      const spinner = wrapper.findComponent({ name: 'QSpinner' })
      expect(spinner.props('color')).toBe('secondary')
    })

    it('accepts custom size', async () => {
      await wrapper.setProps({ size: '100px' })

      const spinner = wrapper.findComponent({ name: 'QSpinner' })
      expect(spinner.props('size')).toBe('100px')
    })

    it('accepts custom thickness', async () => {
      await wrapper.setProps({ thickness: 10 })

      const spinner = wrapper.findComponent({ name: 'QSpinner' })
      expect(spinner.props('thickness')).toBe(10)
    })

    it('accepts custom message', async () => {
      await wrapper.setProps({ message: 'Please wait...' })

      expect(wrapper.find('.loading-message').text()).toBe('Please wait...')
    })
  })

  describe('Full-Screen Mode', () => {
    it('applies full-screen class when fullScreen is true', async () => {
      await wrapper.setProps({ fullScreen: true })

      expect(wrapper.find('.loading-indicator').classes()).toContain('full-screen')
    })

    it('does not apply full-screen class when fullScreen is false', () => {
      expect(wrapper.find('.loading-indicator').classes()).not.toContain('full-screen')
    })

    it('can toggle full-screen mode', async () => {
      expect(wrapper.find('.loading-indicator').classes()).not.toContain('full-screen')

      await wrapper.setProps({ fullScreen: true })
      expect(wrapper.find('.loading-indicator').classes()).toContain('full-screen')

      await wrapper.setProps({ fullScreen: false })
      expect(wrapper.find('.loading-indicator').classes()).not.toContain('full-screen')
    })
  })

  describe('Message Display', () => {
    it('shows message when provided', async () => {
      await wrapper.setProps({ message: 'Loading...' })

      const message = wrapper.find('.loading-message')
      expect(message.exists()).toBe(true)
      expect(message.text()).toBe('Loading...')
    })

    it('hides message when empty string', async () => {
      await wrapper.setProps({ message: 'Loading...' })
      expect(wrapper.find('.loading-message').exists()).toBe(true)

      await wrapper.setProps({ message: '' })
      expect(wrapper.find('.loading-message').exists()).toBe(false)
    })

    it('displays multi-line messages', async () => {
      const multiLineMessage = 'Loading data...\nPlease wait'
      await wrapper.setProps({ message: multiLineMessage })

      expect(wrapper.find('.loading-message').text()).toBe(multiLineMessage)
    })

    it('displays long messages', async () => {
      const longMessage = 'This is a very long loading message that provides detailed information about what is being loaded'
      await wrapper.setProps({ message: longMessage })

      expect(wrapper.find('.loading-message').text()).toBe(longMessage)
    })
  })

  describe('Color Variations', () => {
    it('accepts Quasar color names', async () => {
      const colors = ['primary', 'secondary', 'accent', 'positive', 'negative', 'info', 'warning']

      for (const color of colors) {
        await wrapper.setProps({ color })
        const spinner = wrapper.findComponent({ name: 'QSpinner' })
        expect(spinner.props('color')).toBe(color)
      }
    })

    it('accepts custom color values', async () => {
      await wrapper.setProps({ color: '#FF5722' })

      const spinner = wrapper.findComponent({ name: 'QSpinner' })
      expect(spinner.props('color')).toBe('#FF5722')
    })
  })

  describe('Size Variations', () => {
    it('accepts different size units', async () => {
      const sizes = ['25px', '50px', '100px', '2rem', '3em']

      for (const size of sizes) {
        await wrapper.setProps({ size })
        const spinner = wrapper.findComponent({ name: 'QSpinner' })
        expect(spinner.props('size')).toBe(size)
      }
    })
  })

  describe('Thickness Variations', () => {
    it('accepts thickness values from 1 to 10', async () => {
      for (let thickness = 1; thickness <= 10; thickness++) {
        await wrapper.setProps({ thickness })
        const spinner = wrapper.findComponent({ name: 'QSpinner' })
        expect(spinner.props('thickness')).toBe(thickness)
      }
    })
  })

  describe('Combined Props', () => {
    it('handles all props simultaneously', async () => {
      await wrapper.setProps({
        fullScreen: true,
        color: 'accent',
        size: '75px',
        thickness: 7,
        message: 'Processing your request...'
      })

      expect(wrapper.find('.loading-indicator').classes()).toContain('full-screen')

      const spinner = wrapper.findComponent({ name: 'QSpinner' })
      expect(spinner.props('color')).toBe('accent')
      expect(spinner.props('size')).toBe('75px')
      expect(spinner.props('thickness')).toBe(7)

      const message = wrapper.find('.loading-message')
      expect(message.exists()).toBe(true)
      expect(message.text()).toBe('Processing your request...')
    })
  })

  describe('Edge Cases', () => {
    it('handles null message', async () => {
      await wrapper.setProps({ message: null })
      expect(wrapper.find('.loading-message').exists()).toBe(false)
    })

    it('handles undefined message', async () => {
      await wrapper.setProps({ message: undefined })
      expect(wrapper.find('.loading-message').exists()).toBe(false)
    })

    it('handles zero thickness', async () => {
      await wrapper.setProps({ thickness: 0 })
      const spinner = wrapper.findComponent({ name: 'QSpinner' })
      expect(spinner.props('thickness')).toBe(0)
    })

    it('handles very small size', async () => {
      await wrapper.setProps({ size: '10px' })
      const spinner = wrapper.findComponent({ name: 'QSpinner' })
      expect(spinner.props('size')).toBe('10px')
    })

    it('handles very large size', async () => {
      await wrapper.setProps({ size: '500px' })
      const spinner = wrapper.findComponent({ name: 'QSpinner' })
      expect(spinner.props('size')).toBe('500px')
    })
  })
})
