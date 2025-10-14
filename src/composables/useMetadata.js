/**
 * useMetadata.js
 *
 * Composable for case metadata editing with version conflict handling.
 * Provides methods to fetch, update, and create case metadata.
 *
 * Per constitution: Composition API composables for reusable logic
 */

import { ref } from 'vue'
import { metadataApi } from 'src/services/api'
import { useAuthStore } from 'src/stores/authStore'

export function useMetadata() {
  const authStore = useAuthStore()

  // State
  const caseData = ref(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref(null)
  const versionConflict = ref(false)

  /**
   * Fetches a case for editing (admin only)
   * @param {string} caseId - Case ID to fetch
   * @returns {Promise<Object>} Case data with version
   */
  async function fetchCaseForEdit(caseId) {
    isLoading.value = true
    error.value = null
    versionConflict.value = false

    try {
      const response = await metadataApi.getCaseForEdit(caseId)

      // Update auth token if returned
      if (response.token) {
        authStore.setAuth(response.token, authStore.user)
      }

      caseData.value = response.data.case
      return caseData.value
    } catch (err) {
      console.error('Fetch case for edit failed:', err)
      error.value = err
      caseData.value = null
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Updates case metadata with optimistic locking
   * @param {string} caseId - Case ID to update
   * @param {Object} updates - Fields to update
   * @param {number} version - Current version number
   * @returns {Promise<Object>} Updated case data
   */
  async function updateCase(caseId, updates, version) {
    isSaving.value = true
    error.value = null
    versionConflict.value = false

    try {
      const response = await metadataApi.updateCase(caseId, updates, version)

      // Update auth token if returned
      if (response.token) {
        authStore.setAuth(response.token, authStore.user)
      }

      caseData.value = response.data.case
      return caseData.value
    } catch (err) {
      console.error('Update case failed:', err)

      // Check for version conflict (409)
      if (err.status === 409) {
        versionConflict.value = true
        error.value = {
          ...err,
          isVersionConflict: true,
          currentVersion: err.data?.currentVersion,
          expectedVersion: err.data?.expectedVersion
        }
      } else {
        error.value = err
      }

      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Creates a new case metadata entry (admin only)
   * @param {Object} newCaseData - Case data to create
   * @returns {Promise<Object>} Created case data
   */
  async function createCase(newCaseData) {
    isSaving.value = true
    error.value = null

    try {
      const response = await metadataApi.createCase(newCaseData)

      // Update auth token if returned
      if (response.token) {
        authStore.setAuth(response.token, authStore.user)
      }

      caseData.value = response.data.case
      return caseData.value
    } catch (err) {
      console.error('Create case failed:', err)
      error.value = err
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Clears current case data and error state
   */
  function clearCase() {
    caseData.value = null
    error.value = null
    versionConflict.value = false
    isLoading.value = false
    isSaving.value = false
  }

  /**
   * Retries fetching case after version conflict resolution
   * @param {string} caseId - Case ID to re-fetch
   * @returns {Promise<Object>} Fresh case data
   */
  async function refreshCase(caseId) {
    versionConflict.value = false
    return await fetchCaseForEdit(caseId)
  }

  return {
    // State
    caseData,
    isLoading,
    isSaving,
    error,
    versionConflict,

    // Methods
    fetchCaseForEdit,
    updateCase,
    createCase,
    clearCase,
    refreshCase
  }
}
