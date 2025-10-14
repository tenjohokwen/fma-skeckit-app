/**
 * useSearch.js
 *
 * Composable for search functionality with debouncing and loading state.
 * Provides search methods for case metadata by name or case ID.
 *
 * Per constitution: Composition API composables for reusable logic
 */

import { ref } from 'vue'
import { metadataApi } from 'src/services/api'
import { useAuthStore } from 'src/stores/authStore'

export function useSearch() {
  const authStore = useAuthStore()

  // State
  const searchResults = ref([])
  const isSearching = ref(false)
  const searchError = ref(null)
  const searchType = ref(null) // 'name' or 'caseId'
  const lastSearch = ref({ firstName: '', lastName: '', caseId: '' })

  // Debounce timer
  let debounceTimer = null

  /**
   * Searches for cases by client name
   * @param {string} firstName - Client first name (optional)
   * @param {string} lastName - Client last name (optional)
   * @param {boolean} immediate - If true, skip debouncing
   * @returns {Promise<void>}
   */
  async function searchByName(firstName = '', lastName = '', immediate = false) {
    // Clear any existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }

    // Store search params
    lastSearch.value = { firstName, lastName, caseId: '' }
    searchType.value = 'name'

    // Skip if both fields are empty
    if (!firstName.trim() && !lastName.trim()) {
      searchResults.value = []
      searchError.value = null
      return
    }

    const executeSearch = async () => {
      isSearching.value = true
      searchError.value = null

      try {
        const response = await metadataApi.searchByName(firstName.trim(), lastName.trim())

        // Update auth token if returned
        if (response.token) {
          authStore.setAuth(response.token, authStore.user)
        }

        searchResults.value = response.data.cases || []
      } catch (error) {
        console.error('Search by name failed:', error)
        searchError.value = error
        searchResults.value = []
      } finally {
        isSearching.value = false
      }
    }

    if (immediate) {
      await executeSearch()
    } else {
      // Debounce: wait 500ms before executing search
      debounceTimer = setTimeout(executeSearch, 500)
    }
  }

  /**
   * Searches for a case by case ID
   * @param {string} caseId - Case ID to search for
   * @param {boolean} immediate - If true, skip debouncing
   * @returns {Promise<void>}
   */
  async function searchByCaseId(caseId = '', immediate = false) {
    // Clear any existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }

    // Store search params
    lastSearch.value = { firstName: '', lastName: '', caseId }
    searchType.value = 'caseId'

    // Skip if empty
    if (!caseId.trim()) {
      searchResults.value = []
      searchError.value = null
      return
    }

    const executeSearch = async () => {
      isSearching.value = true
      searchError.value = null

      try {
        const response = await metadataApi.searchByCaseId(caseId.trim())

        // Update auth token if returned
        if (response.token) {
          authStore.setAuth(response.token, authStore.user)
        }

        // searchByCaseId returns a single case, wrap in array for consistency
        searchResults.value = response.data.case ? [response.data.case] : []
      } catch (error) {
        console.error('Search by case ID failed:', error)
        searchError.value = error
        searchResults.value = []
      } finally {
        isSearching.value = false
      }
    }

    if (immediate) {
      await executeSearch()
    } else {
      // Debounce: wait 500ms before executing search
      debounceTimer = setTimeout(executeSearch, 500)
    }
  }

  /**
   * Clears search results and error state
   */
  function clearSearch() {
    searchResults.value = []
    searchError.value = null
    searchType.value = null
    lastSearch.value = { firstName: '', lastName: '', caseId: '' }

    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }

  /**
   * Re-executes the last search (useful after updates)
   */
  async function refreshSearch() {
    if (searchType.value === 'name') {
      await searchByName(lastSearch.value.firstName, lastSearch.value.lastName, true)
    } else if (searchType.value === 'caseId') {
      await searchByCaseId(lastSearch.value.caseId, true)
    }
  }

  return {
    // State
    searchResults,
    isSearching,
    searchError,
    searchType,

    // Methods
    searchByName,
    searchByCaseId,
    clearSearch,
    refreshSearch,
  }
}
