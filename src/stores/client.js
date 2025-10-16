/**
 * Client Store
 *
 * Manages client data, search functionality, and client operations.
 * Per constitution: Pinia store for client state management.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from 'src/services/api'

export const useClientStore = defineStore('client', () => {
  // State
  const clients = ref([])
  const selectedClient = ref(null)
  const searchQuery = ref({
    firstName: '',
    lastName: '',
    nationalId: ''
  })
  const searchResults = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const hasSearchResults = computed(() => searchResults.value.length > 0)
  const searchResultCount = computed(() => searchResults.value.length)

  /**
   * Search for clients by name and/or national ID
   * @param {Object} query - Search parameters
   * @param {string} query.firstName - First name (optional)
   * @param {string} query.lastName - Last name (optional)
   * @param {string} query.nationalId - National ID (optional)
   * @returns {Promise<Array>} Array of matching clients
   */
  async function searchClients(query) {
    loading.value = true
    error.value = null

    try {
      // Validate at least one search criterion
      if (!query.firstName && !query.lastName && !query.nationalId) {
        throw new Error('At least one search criterion is required')
      }

      // Store query for reference
      searchQuery.value = { ...query }

      // Call API
      const response = await api.post('client.search', query)

      // Store results
      searchResults.value = response.data.clients || []

      return searchResults.value
    } catch (err) {
      error.value = err.message
      searchResults.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new client
   * @param {Object} clientData - Client information
   * @param {string} clientData.firstName - First name (required)
   * @param {string} clientData.lastName - Last name (required)
   * @param {string} clientData.nationalId - National ID (required)
   * @param {string} clientData.telephone - Telephone (optional)
   * @param {string} clientData.email - Email (optional)
   * @returns {Promise<Object>} Created client object
   */
  async function createClient(clientData) {
    loading.value = true
    error.value = null

    try {
      // Validate required fields
      if (!clientData.firstName || !clientData.lastName || !clientData.nationalId) {
        throw new Error('First name, last name, and national ID are required')
      }

      // Call API
      const response = await api.post('client.create', clientData)

      const newClient = response.data.client

      // Add to clients array
      clients.value.push(newClient)

      // Set as selected client
      selectedClient.value = newClient

      return newClient
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get client details by ID
   * @param {string} clientId - Client ID
   * @returns {Promise<Object>} Object with client and cases
   */
  async function getClientDetails(clientId) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('client.get', { clientId })

      const client = response.data.client
      const cases = response.data.cases || []

      // Store as selected client
      selectedClient.value = client

      return {
        client,
        cases
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Select a client from search results
   * @param {Object} client - Client object
   */
  function selectClient(client) {
    selectedClient.value = client
  }

  /**
   * Clear search results and query
   */
  function clearSearch() {
    searchResults.value = []
    searchQuery.value = {
      firstName: '',
      lastName: '',
      nationalId: ''
    }
    error.value = null
  }

  /**
   * Clear selected client
   */
  function clearSelectedClient() {
    selectedClient.value = null
  }

  /**
   * Reset store to initial state
   */
  function $reset() {
    clients.value = []
    selectedClient.value = null
    searchQuery.value = {
      firstName: '',
      lastName: '',
      nationalId: ''
    }
    searchResults.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    clients,
    selectedClient,
    searchQuery,
    searchResults,
    loading,
    error,

    // Computed
    hasSearchResults,
    searchResultCount,

    // Actions
    searchClients,
    createClient,
    getClientDetails,
    selectClient,
    clearSearch,
    clearSelectedClient,
    $reset
  }
})
