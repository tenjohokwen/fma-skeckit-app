/**
 * useSearch.js
 *
 * Composable for search functionality with debouncing, loading state, and fuzzy search.
 * Provides search methods for case metadata by name or case ID, and client fuzzy search.
 *
 * Per constitution: Composition API composables for reusable logic
 */

import { ref } from 'vue'
import { metadataApi } from 'src/services/api'
import { useAuthStore } from 'src/stores/authStore'
import Fuse from 'fuse.js'

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

    // Ensure params are strings (handle null from clearable inputs)
    const firstNameStr = String(firstName || '')
    const lastNameStr = String(lastName || '')

    // Store search params
    lastSearch.value = { firstName: firstNameStr, lastName: lastNameStr, caseId: '' }
    searchType.value = 'name'

    // Skip if both fields are empty
    if (!firstNameStr.trim() && !lastNameStr.trim()) {
      searchResults.value = []
      searchError.value = null
      return
    }

    const executeSearch = async () => {
      isSearching.value = true
      searchError.value = null

      try {
        const response = await metadataApi.searchByName(firstNameStr.trim(), lastNameStr.trim())

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

    // Ensure param is a string (handle null from clearable inputs)
    const caseIdStr = String(caseId || '')

    // Store search params
    lastSearch.value = { firstName: '', lastName: '', caseId: caseIdStr }
    searchType.value = 'caseId'

    // Skip if empty
    if (!caseIdStr.trim()) {
      searchResults.value = []
      searchError.value = null
      return
    }

    const executeSearch = async () => {
      isSearching.value = true
      searchError.value = null

      try {
        const response = await metadataApi.searchByCaseId(caseIdStr.trim())

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

  // ==================== FUZZY SEARCH FOR CLIENTS ====================

  const fuseInstance = ref(null)
  const fuzzySearchResults = ref([])

  /**
   * Initialize Fuse.js with client data for fuzzy search
   * @param {Array} clientList - Array of client objects to search
   */
  function initializeFuzzySearch(clientList) {
    const fuseOptions = {
      // Which keys to search
      keys: [
        { name: 'firstName', weight: 2 },
        { name: 'lastName', weight: 2 },
        { name: 'nationalId', weight: 1.5 }
      ],
      // Threshold for fuzzy matching (0.0 = perfect match, 1.0 = match anything)
      // 0.4 allows for ~2 character typos
      threshold: 0.4,
      // Search in entire string, not just from beginning
      ignoreLocation: true,
      // Minimum character length for matching
      minMatchCharLength: 2,
      // Include score in results for sorting
      includeScore: true
    }

    fuseInstance.value = new Fuse(clientList, fuseOptions)
  }

  /**
   * Perform fuzzy search on clients
   * @param {string} query - Search query string
   * @returns {Array} Array of matching client objects
   */
  function fuzzySearchClients(query) {
    if (!query || query.trim().length < 2) {
      fuzzySearchResults.value = []
      return []
    }

    if (!fuseInstance.value) {
      fuzzySearchResults.value = []
      return []
    }

    // Perform fuzzy search
    const results = fuseInstance.value.search(query.trim())

    // Extract items from Fuse.js results
    fuzzySearchResults.value = results.map(result => result.item)

    return fuzzySearchResults.value
  }

  /**
   * Clear fuzzy search results
   */
  function clearFuzzySearch() {
    fuzzySearchResults.value = []
  }

  return {
    // State
    searchResults,
    isSearching,
    searchError,
    searchType,
    fuzzySearchResults,

    // Case search methods
    searchByName,
    searchByCaseId,
    clearSearch,
    refreshSearch,

    // Fuzzy search methods for clients
    initializeFuzzySearch,
    fuzzySearchClients,
    clearFuzzySearch
  }
}
