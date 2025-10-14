/**
 * useSearch.spec.js
 *
 * Tests for useSearch composable (US3).
 * Tests search functionality, debouncing, and loading states.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSearch } from 'src/composables/useSearch'
import { metadataApi } from 'src/services/api'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from 'src/stores/authStore'

// Mock the API
vi.mock('src/services/api', () => ({
  metadataApi: {
    searchByName: vi.fn(),
    searchByCaseId: vi.fn()
  }
}))

describe('useSearch', () => {
  let authStore

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Initial State', () => {
    it('initializes with empty search results', () => {
      const { searchResults, isSearching, searchError, searchType } = useSearch()

      expect(searchResults.value).toEqual([])
      expect(isSearching.value).toBe(false)
      expect(searchError.value).toBe(null)
      expect(searchType.value).toBe(null)
    })
  })

  describe('Search by Name', () => {
    it('searches by first name only', async () => {
      const mockCases = [
        { caseId: 'CASE-001', clientFirstName: 'John', clientLastName: 'Doe' },
        { caseId: 'CASE-002', clientFirstName: 'John', clientLastName: 'Smith' }
      ]

      metadataApi.searchByName.mockResolvedValue({
        status: 200,
        data: { cases: mockCases, count: 2 }
      })

      const { searchByName, searchResults, isSearching } = useSearch()

      const promise = searchByName('John', '', true)
      expect(isSearching.value).toBe(true)

      await promise

      expect(metadataApi.searchByName).toHaveBeenCalledWith('John', '')
      expect(searchResults.value).toEqual(mockCases)
      expect(isSearching.value).toBe(false)
    })

    it('searches by last name only', async () => {
      const mockCases = [
        { caseId: 'CASE-001', clientFirstName: 'John', clientLastName: 'Doe' },
        { caseId: 'CASE-003', clientFirstName: 'Jane', clientLastName: 'Doe' }
      ]

      metadataApi.searchByName.mockResolvedValue({
        status: 200,
        data: { cases: mockCases, count: 2 }
      })

      const { searchByName, searchResults } = useSearch()

      await searchByName('', 'Doe', true)

      expect(metadataApi.searchByName).toHaveBeenCalledWith('', 'Doe')
      expect(searchResults.value).toEqual(mockCases)
    })

    it('searches by both first and last name', async () => {
      const mockCases = [
        { caseId: 'CASE-001', clientFirstName: 'John', clientLastName: 'Doe' }
      ]

      metadataApi.searchByName.mockResolvedValue({
        status: 200,
        data: { cases: mockCases, count: 1 }
      })

      const { searchByName, searchResults } = useSearch()

      await searchByName('John', 'Doe', true)

      expect(metadataApi.searchByName).toHaveBeenCalledWith('John', 'Doe')
      expect(searchResults.value).toEqual(mockCases)
    })

    it('trims whitespace from search terms', async () => {
      metadataApi.searchByName.mockResolvedValue({
        status: 200,
        data: { cases: [], count: 0 }
      })

      const { searchByName } = useSearch()

      await searchByName('  John  ', '  Doe  ', true)

      expect(metadataApi.searchByName).toHaveBeenCalledWith('John', 'Doe')
    })

    it('clears results when both fields are empty', async () => {
      const { searchByName, searchResults, searchError } = useSearch()

      await searchByName('', '', false)

      expect(searchResults.value).toEqual([])
      expect(searchError.value).toBe(null)
      expect(metadataApi.searchByName).not.toHaveBeenCalled()
    })

    it('debounces search when immediate is false', async () => {
      metadataApi.searchByName.mockResolvedValue({
        status: 200,
        data: { cases: [], count: 0 }
      })

      const { searchByName } = useSearch()

      searchByName('John', '', false)

      // Should not call API immediately
      expect(metadataApi.searchByName).not.toHaveBeenCalled()

      // Fast-forward 500ms
      vi.advanceTimersByTime(500)
      await vi.runAllTimersAsync()

      // Should call API after debounce
      expect(metadataApi.searchByName).toHaveBeenCalledWith('John', '')
    })

    it('cancels previous debounced search when new search starts', async () => {
      metadataApi.searchByName.mockResolvedValue({
        status: 200,
        data: { cases: [], count: 0 }
      })

      const { searchByName } = useSearch()

      // Start first search
      searchByName('John', '', false)

      // Start second search before first completes
      vi.advanceTimersByTime(300)
      searchByName('Jane', '', false)

      // Fast-forward to complete debounce
      vi.advanceTimersByTime(500)
      await vi.runAllTimersAsync()

      // Should only call API once with latest search
      expect(metadataApi.searchByName).toHaveBeenCalledTimes(1)
      expect(metadataApi.searchByName).toHaveBeenCalledWith('Jane', '')
    })

    it('handles API errors', async () => {
      const error = new Error('Network error')
      metadataApi.searchByName.mockRejectedValue(error)

      const { searchByName, searchError, searchResults, isSearching } = useSearch()

      const promise = searchByName('John', 'Doe', true)
      expect(isSearching.value).toBe(true)

      await promise

      expect(searchError.value).toBe(error)
      expect(searchResults.value).toEqual([])
      expect(isSearching.value).toBe(false)
    })

    it('updates auth token if returned', async () => {
      const mockToken = {
        value: 'new-token',
        ttl: Date.now() + 900000
      }

      metadataApi.searchByName.mockResolvedValue({
        status: 200,
        data: { cases: [], count: 0 },
        token: mockToken
      })

      authStore.user = { email: 'test@example.com' }
      const setAuthSpy = vi.spyOn(authStore, 'setAuth')

      const { searchByName } = useSearch()

      await searchByName('John', '', true)

      expect(setAuthSpy).toHaveBeenCalledWith(mockToken, authStore.user)
    })
  })

  describe('Search by Case ID', () => {
    it('searches by case ID', async () => {
      const mockCase = {
        caseId: 'CASE-001',
        clientFirstName: 'John',
        clientLastName: 'Doe'
      }

      metadataApi.searchByCaseId.mockResolvedValue({
        status: 200,
        data: { case: mockCase }
      })

      const { searchByCaseId, searchResults, isSearching } = useSearch()

      const promise = searchByCaseId('CASE-001', true)
      expect(isSearching.value).toBe(true)

      await promise

      expect(metadataApi.searchByCaseId).toHaveBeenCalledWith('CASE-001')
      expect(searchResults.value).toEqual([mockCase])
      expect(isSearching.value).toBe(false)
    })

    it('trims whitespace from case ID', async () => {
      metadataApi.searchByCaseId.mockResolvedValue({
        status: 200,
        data: { case: null }
      })

      const { searchByCaseId } = useSearch()

      await searchByCaseId('  CASE-001  ', true)

      expect(metadataApi.searchByCaseId).toHaveBeenCalledWith('CASE-001')
    })

    it('clears results when case ID is empty', async () => {
      const { searchByCaseId, searchResults, searchError } = useSearch()

      await searchByCaseId('', false)

      expect(searchResults.value).toEqual([])
      expect(searchError.value).toBe(null)
      expect(metadataApi.searchByCaseId).not.toHaveBeenCalled()
    })

    it('debounces search when immediate is false', async () => {
      metadataApi.searchByCaseId.mockResolvedValue({
        status: 200,
        data: { case: null }
      })

      const { searchByCaseId } = useSearch()

      searchByCaseId('CASE-001', false)

      // Should not call API immediately
      expect(metadataApi.searchByCaseId).not.toHaveBeenCalled()

      // Fast-forward 500ms
      vi.advanceTimersByTime(500)
      await vi.runAllTimersAsync()

      // Should call API after debounce
      expect(metadataApi.searchByCaseId).toHaveBeenCalledWith('CASE-001')
    })

    it('handles case not found (returns empty array)', async () => {
      metadataApi.searchByCaseId.mockResolvedValue({
        status: 200,
        data: { case: null }
      })

      const { searchByCaseId, searchResults } = useSearch()

      await searchByCaseId('INVALID-ID', true)

      expect(searchResults.value).toEqual([])
    })

    it('handles API errors', async () => {
      const error = new Error('Network error')
      metadataApi.searchByCaseId.mockRejectedValue(error)

      const { searchByCaseId, searchError, searchResults, isSearching } = useSearch()

      const promise = searchByCaseId('CASE-001', true)
      expect(isSearching.value).toBe(true)

      await promise

      expect(searchError.value).toBe(error)
      expect(searchResults.value).toEqual([])
      expect(isSearching.value).toBe(false)
    })
  })

  describe('Clear Search', () => {
    it('clears all search state', async () => {
      const mockCases = [
        { caseId: 'CASE-001', clientFirstName: 'John', clientLastName: 'Doe' }
      ]

      metadataApi.searchByName.mockResolvedValue({
        status: 200,
        data: { cases: mockCases, count: 1 }
      })

      const { searchByName, clearSearch, searchResults, searchError, searchType } = useSearch()

      await searchByName('John', 'Doe', true)
      expect(searchResults.value).toEqual(mockCases)

      clearSearch()

      expect(searchResults.value).toEqual([])
      expect(searchError.value).toBe(null)
      expect(searchType.value).toBe(null)
    })

    it('cancels pending debounced search', () => {
      metadataApi.searchByName.mockResolvedValue({
        status: 200,
        data: { cases: [], count: 0 }
      })

      const { searchByName, clearSearch } = useSearch()

      searchByName('John', '', false)
      clearSearch()

      // Fast-forward timers
      vi.advanceTimersByTime(500)

      // API should not be called
      expect(metadataApi.searchByName).not.toHaveBeenCalled()
    })
  })

  describe('Refresh Search', () => {
    it('refreshes last name search', async () => {
      metadataApi.searchByName.mockResolvedValue({
        status: 200,
        data: { cases: [], count: 0 }
      })

      const { searchByName, refreshSearch } = useSearch()

      await searchByName('John', 'Doe', true)
      vi.clearAllMocks()

      await refreshSearch()

      expect(metadataApi.searchByName).toHaveBeenCalledWith('John', 'Doe')
    })

    it('refreshes last case ID search', async () => {
      metadataApi.searchByCaseId.mockResolvedValue({
        status: 200,
        data: { case: null }
      })

      const { searchByCaseId, refreshSearch } = useSearch()

      await searchByCaseId('CASE-001', true)
      vi.clearAllMocks()

      await refreshSearch()

      expect(metadataApi.searchByCaseId).toHaveBeenCalledWith('CASE-001')
    })

    it('does nothing if no previous search', async () => {
      const { refreshSearch } = useSearch()

      await refreshSearch()

      expect(metadataApi.searchByName).not.toHaveBeenCalled()
      expect(metadataApi.searchByCaseId).not.toHaveBeenCalled()
    })
  })

  describe('Search Type Tracking', () => {
    it('sets searchType to "name" for name searches', async () => {
      metadataApi.searchByName.mockResolvedValue({
        status: 200,
        data: { cases: [], count: 0 }
      })

      const { searchByName, searchType } = useSearch()

      await searchByName('John', '', true)

      expect(searchType.value).toBe('name')
    })

    it('sets searchType to "caseId" for case ID searches', async () => {
      metadataApi.searchByCaseId.mockResolvedValue({
        status: 200,
        data: { case: null }
      })

      const { searchByCaseId, searchType } = useSearch()

      await searchByCaseId('CASE-001', true)

      expect(searchType.value).toBe('caseId')
    })
  })
})
