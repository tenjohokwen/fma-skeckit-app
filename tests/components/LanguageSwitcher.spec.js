/**
 * LanguageSwitcher.spec.js
 *
 * Tests for LanguageSwitcher component
 * Per constitution: Plain JavaScript tests with Vitest + Vue Test Utils
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import LanguageSwitcher from 'src/components/LanguageSwitcher.vue'

describe('LanguageSwitcher', () => {
  let wrapper
  let mockLocale

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear()

    // Create mock locale ref
    mockLocale = { value: 'en' }

    wrapper = mount(LanguageSwitcher, {
      global: {
        plugins: [createTestingPinia()],
        mocks: {
          $t: (key) => key
        },
        stubs: {
          QBtnDropdown: {
            template: '<div class="q-btn-dropdown"><slot /></div>',
            props: ['label', 'icon']
          },
          QList: { template: '<div class="q-list"><slot /></div>' },
          QItem: {
            template: '<div class="q-item" @click="$emit(\'click\')"><slot /></div>',
            props: ['clickable', 'active']
          },
          QItemSection: { template: '<div class="q-item-section"><slot /></div>' },
          QItemLabel: { template: '<div class="q-item-label"><slot /></div>' }
        }
      }
    })
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Component Rendering', () => {
    it('renders the language switcher', () => {
      expect(wrapper.find('.q-btn-dropdown').exists()).toBe(true)
    })

    it('renders language list', () => {
      expect(wrapper.find('.q-list').exists()).toBe(true)
    })

    it('renders both language options', () => {
      const items = wrapper.findAll('.q-item')
      expect(items.length).toBe(2)
    })

    it('displays English option', () => {
      const labels = wrapper.findAll('.q-item-label')
      const englishLabel = labels.find(label => label.text() === 'English')
      expect(englishLabel).toBeTruthy()
    })

    it('displays French option', () => {
      const labels = wrapper.findAll('.q-item-label')
      const frenchLabel = labels.find(label => label.text() === 'Français')
      expect(frenchLabel).toBeTruthy()
    })
  })

  describe('Current Language Display', () => {
    it('shows current language label', () => {
      // The currentLanguage computed should return the label
      expect(wrapper.vm.currentLanguage).toBeTruthy()
    })

    it('displays English when locale is en', () => {
      expect(wrapper.vm.locale).toBe('en')
      expect(wrapper.vm.currentLanguage).toBe('English')
    })
  })

  describe('Language Selection', () => {
    it('has language options array with correct structure', () => {
      expect(wrapper.vm.languages).toEqual([
        { value: 'en', label: 'English' },
        { value: 'fr', label: 'Français' }
      ])
    })

    it('calls changeLanguage when language item is clicked', async () => {
      const changeSpy = vi.spyOn(wrapper.vm, 'changeLanguage')

      const items = wrapper.findAll('.q-item')
      await items[1].trigger('click') // Click French

      expect(changeSpy).toHaveBeenCalled()
    })

    it('persists language selection to localStorage', () => {
      wrapper.vm.changeLanguage('fr')

      expect(localStorage.getItem('user-language')).toBe('fr')
    })

    it('updates locale when changeLanguage is called', () => {
      wrapper.vm.changeLanguage('fr')

      expect(wrapper.vm.locale).toBe('fr')
    })

    it('can switch from English to French', () => {
      expect(wrapper.vm.locale).toBe('en')

      wrapper.vm.changeLanguage('fr')

      expect(wrapper.vm.locale).toBe('fr')
      expect(localStorage.getItem('user-language')).toBe('fr')
    })

    it('can switch from French to English', () => {
      wrapper.vm.locale = 'fr'

      wrapper.vm.changeLanguage('en')

      expect(wrapper.vm.locale).toBe('en')
      expect(localStorage.getItem('user-language')).toBe('en')
    })
  })

  describe('LocalStorage Integration', () => {
    it('stores language in localStorage on change', () => {
      wrapper.vm.changeLanguage('fr')

      expect(localStorage.getItem('user-language')).toBe('fr')
    })

    it('overwrites existing language in localStorage', () => {
      localStorage.setItem('user-language', 'en')

      wrapper.vm.changeLanguage('fr')

      expect(localStorage.getItem('user-language')).toBe('fr')
    })

    it('persists multiple language changes', () => {
      wrapper.vm.changeLanguage('fr')
      expect(localStorage.getItem('user-language')).toBe('fr')

      wrapper.vm.changeLanguage('en')
      expect(localStorage.getItem('user-language')).toBe('en')

      wrapper.vm.changeLanguage('fr')
      expect(localStorage.getItem('user-language')).toBe('fr')
    })
  })

  describe('Computed Properties', () => {
    it('currentLanguage returns correct label for en', () => {
      wrapper.vm.locale = 'en'
      expect(wrapper.vm.currentLanguage).toBe('English')
    })

    it('currentLanguage returns correct label for fr', () => {
      wrapper.vm.locale = 'fr'
      expect(wrapper.vm.currentLanguage).toBe('Français')
    })

    it('currentLanguage returns fallback for unknown locale', () => {
      wrapper.vm.locale = 'unknown'
      expect(wrapper.vm.currentLanguage).toBe('EN')
    })
  })

  describe('Accessibility', () => {
    it('has clickable items', () => {
      const items = wrapper.findAll('.q-item')
      items.forEach(item => {
        expect(item.props('clickable')).toBeTruthy()
      })
    })

    it('marks current language as active', () => {
      const items = wrapper.findAll('.q-item')
      // First item (English) should be active when locale is 'en'
      expect(items[0].props('active')).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid language switches', () => {
      wrapper.vm.changeLanguage('fr')
      wrapper.vm.changeLanguage('en')
      wrapper.vm.changeLanguage('fr')
      wrapper.vm.changeLanguage('en')

      expect(wrapper.vm.locale).toBe('en')
      expect(localStorage.getItem('user-language')).toBe('en')
    })

    it('handles same language selection', () => {
      wrapper.vm.changeLanguage('en')
      wrapper.vm.changeLanguage('en')

      expect(wrapper.vm.locale).toBe('en')
      expect(localStorage.getItem('user-language')).toBe('en')
    })
  })
})
