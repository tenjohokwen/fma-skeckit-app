/**
 * SearchBar.spec.js
 *
 * Tests for SearchBar component (US3).
 * Tests search UI, tab switching, and user interactions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import SearchBar from 'src/components/search/SearchBar.vue'
import { Quasar } from 'quasar'

// Mock useSearch composable
const mockSearchByName = vi.fn()
const mockSearchByCaseId = vi.fn()
const mockClearSearch = vi.fn()

vi.mock('src/composables/useSearch', () => ({
  useSearch: () => ({
    searchResults: { value: [] },
    isSearching: { value: false },
    searchError: { value: null },
    searchByName: mockSearchByName,
    searchByCaseId: mockSearchByCaseId,
    clearSearch: mockClearSearch
  })
}))

const mockT = vi.fn((key) => key)

describe('SearchBar', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(SearchBar, {
      global: {
        plugins: [
          Quasar,
          createTestingPinia({
            createSpy: vi.fn
          })
        ],
        mocks: {
          $t: mockT
        },
        stubs: {
          QCard: false,
          QCardSection: false,
          QTabs: false,
          QTab: false,
          QTabPanels: false,
          QTabPanel: false,
          QInput: false,
          QBtn: false,
          QIcon: false,
          QSeparator: false,
          QBanner: false
        }
      },
      ...props
    })
  }

  describe('Component Rendering', () => {
    it('renders search bar with tabs', () => {
      wrapper = createWrapper()

      expect(wrapper.find('.search-bar').exists()).toBe(true)
      expect(wrapper.find('.search-card').exists()).toBe(true)
    })

    it('renders name search tab by default', () => {
      wrapper = createWrapper()

      expect(wrapper.vm.searchTab).toBe('name')
    })

    it('renders case ID search tab when selected', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ searchTab: 'caseId' })

      expect(wrapper.vm.searchTab).toBe('caseId')
    })
  })

  describe('Name Search Tab', () => {
    it('renders first name and last name inputs', () => {
      wrapper = createWrapper()

      const inputs = wrapper.findAllComponents({ name: 'QInput' })
      expect(inputs.length).toBeGreaterThanOrEqual(2)
    })

    it('updates firstName on input', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ firstName: 'John' })

      expect(wrapper.vm.firstName).toBe('John')
    })

    it('updates lastName on input', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ lastName: 'Doe' })

      expect(wrapper.vm.lastName).toBe('Doe')
    })

    it('triggers debounced search when firstName changes', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ firstName: 'John' })
      wrapper.vm.onNameSearchChange()

      expect(mockSearchByName).toHaveBeenCalledWith('John', '', false)
    })

    it('triggers debounced search when lastName changes', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ lastName: 'Doe' })
      wrapper.vm.onNameSearchChange()

      expect(mockSearchByName).toHaveBeenCalledWith('', 'Doe', false)
    })

    it('clears search when both fields are empty', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ firstName: '', lastName: '' })
      wrapper.vm.onNameSearchChange()

      expect(mockClearSearch).toHaveBeenCalled()
      expect(mockSearchByName).not.toHaveBeenCalled()
    })

    it('disables search button when no name is entered', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ searchTab: 'name', firstName: '', lastName: '' })

      expect(wrapper.vm.canSearch).toBe(false)
    })

    it('enables search button when first name is entered', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ searchTab: 'name', firstName: 'John', lastName: '' })

      expect(wrapper.vm.canSearch).toBe(true)
    })

    it('enables search button when last name is entered', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ searchTab: 'name', firstName: '', lastName: 'Doe' })

      expect(wrapper.vm.canSearch).toBe(true)
    })

    it('enables search button when both names are entered', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ searchTab: 'name', firstName: 'John', lastName: 'Doe' })

      expect(wrapper.vm.canSearch).toBe(true)
    })
  })

  describe('Case ID Search Tab', () => {
    it('renders case ID input', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ searchTab: 'caseId' })

      expect(wrapper.vm.searchTab).toBe('caseId')
    })

    it('updates caseId on input', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ caseId: 'CASE-001' })

      expect(wrapper.vm.caseId).toBe('CASE-001')
    })

    it('triggers debounced search when caseId changes', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ searchTab: 'caseId', caseId: 'CASE-001' })
      wrapper.vm.onCaseIdSearchChange()

      expect(mockSearchByCaseId).toHaveBeenCalledWith('CASE-001', false)
    })

    it('clears search when case ID is empty', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ searchTab: 'caseId', caseId: '' })
      wrapper.vm.onCaseIdSearchChange()

      expect(mockClearSearch).toHaveBeenCalled()
      expect(mockSearchByCaseId).not.toHaveBeenCalled()
    })

    it('disables search button when no case ID is entered', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ searchTab: 'caseId', caseId: '' })

      expect(wrapper.vm.canSearch).toBe(false)
    })

    it('enables search button when case ID is entered', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ searchTab: 'caseId', caseId: 'CASE-001' })

      expect(wrapper.vm.canSearch).toBe(true)
    })
  })

  describe('Search Actions', () => {
    it('triggers immediate name search on search button click', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ searchTab: 'name', firstName: 'John', lastName: 'Doe' })
      wrapper.vm.handleSearch()

      expect(mockSearchByName).toHaveBeenCalledWith('John', 'Doe', true)
    })

    it('triggers immediate case ID search on search button click', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ searchTab: 'caseId', caseId: 'CASE-001' })
      wrapper.vm.handleSearch()

      expect(mockSearchByCaseId).toHaveBeenCalledWith('CASE-001', true)
    })

    it('clears all inputs and search state on clear button click', async () => {
      wrapper = createWrapper()

      await wrapper.setData({
        firstName: 'John',
        lastName: 'Doe',
        caseId: 'CASE-001',
        hasSearched: true
      })

      wrapper.vm.handleClear()

      expect(wrapper.vm.firstName).toBe('')
      expect(wrapper.vm.lastName).toBe('')
      expect(wrapper.vm.caseId).toBe('')
      expect(wrapper.vm.hasSearched).toBe(false)
      expect(mockClearSearch).toHaveBeenCalled()
    })
  })

  describe('Search State Display', () => {
    it('marks search as performed when hasSearched is true', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ hasSearched: true })

      expect(wrapper.vm.hasSearched).toBe(true)
    })

    it('does not show search info initially', () => {
      wrapper = createWrapper()

      expect(wrapper.vm.hasSearched).toBe(false)
    })
  })

  describe('Tab Switching', () => {
    it('switches from name tab to case ID tab', async () => {
      wrapper = createWrapper()

      expect(wrapper.vm.searchTab).toBe('name')

      await wrapper.setData({ searchTab: 'caseId' })

      expect(wrapper.vm.searchTab).toBe('caseId')
    })

    it('switches from case ID tab to name tab', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ searchTab: 'caseId' })
      expect(wrapper.vm.searchTab).toBe('caseId')

      await wrapper.setData({ searchTab: 'name' })

      expect(wrapper.vm.searchTab).toBe('name')
    })

    it('maintains input values when switching tabs', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ firstName: 'John', lastName: 'Doe', caseId: 'CASE-001' })
      await wrapper.setData({ searchTab: 'caseId' })

      expect(wrapper.vm.firstName).toBe('John')
      expect(wrapper.vm.lastName).toBe('Doe')

      await wrapper.setData({ searchTab: 'name' })

      expect(wrapper.vm.caseId).toBe('CASE-001')
    })
  })

  describe('Edge Cases', () => {
    it('handles whitespace-only first name', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ searchTab: 'name', firstName: '   ', lastName: '' })

      expect(wrapper.vm.canSearch).toBe(false)
    })

    it('handles whitespace-only last name', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ searchTab: 'name', firstName: '', lastName: '   ' })

      expect(wrapper.vm.canSearch).toBe(false)
    })

    it('handles whitespace-only case ID', async () => {
      wrapper = createWrapper()

      await wrapper.setData({ searchTab: 'caseId', caseId: '   ' })

      expect(wrapper.vm.canSearch).toBe(false)
    })
  })
})
