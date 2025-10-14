/**
 * useFileOperations.js
 *
 * Composable for file and folder operations.
 * Provides methods to search for and create client folders.
 *
 * Per constitution: Composition API composables for reusable logic
 */

import { ref } from 'vue'
import { fileApi } from 'src/services/api'
import { useAuthStore } from 'src/stores/authStore'

export function useFileOperations() {
  const authStore = useAuthStore()

  // State
  const folderData = ref(null)
  const searchResults = ref(null)
  const isLoading = ref(false)
  const isCreating = ref(false)
  const isSearching = ref(false)
  const error = ref(null)
  const folderExists = ref(false)

  /**
   * Searches for a client folder by name
   * @param {string} firstName - Client's first name
   * @param {string} lastName - Client's last name
   * @param {string} idCardNo - Client's ID card number
   * @returns {Promise<Object|null>} Folder data or null if not found
   */
  async function searchClientFolder(firstName, lastName, idCardNo) {
    isSearching.value = true
    error.value = null
    folderExists.value = false
    searchResults.value = null

    try {
      const response = await fileApi.searchClientFolder(firstName, lastName, idCardNo)

      // Update auth token if returned
      if (response.token) {
        authStore.setAuth(response.token, authStore.user)
      }

      searchResults.value = response.data

      if (response.data) {
        folderExists.value = true
      }

      return response.data
    } catch (err) {
      console.error('Search client folder failed:', err)
      error.value = err
      searchResults.value = null
      throw err
    } finally {
      isSearching.value = false
    }
  }

  /**
   * Creates a new client folder
   * @param {Object} clientData - Client information
   * @param {string} clientData.firstName - Client's first name
   * @param {string} clientData.lastName - Client's last name
   * @param {string} clientData.idCardNo - Client's ID card number
   * @param {string} [clientData.telephone] - Client's telephone (optional)
   * @param {string} [clientData.email] - Client's email (optional)
   * @returns {Promise<Object>} Created folder data
   */
  async function createClientFolder(clientData) {
    isCreating.value = true
    error.value = null
    folderExists.value = false

    try {
      const { firstName, lastName, idCardNo, telephone, email } = clientData

      const response = await fileApi.createClientFolder(
        firstName,
        lastName,
        idCardNo,
        telephone,
        email
      )

      // Update auth token if returned
      if (response.token) {
        authStore.setAuth(response.token, authStore.user)
      }

      folderData.value = response.data
      return response.data
    } catch (err) {
      console.error('Create client folder failed:', err)

      // Check for folder already exists error (400)
      if (err.status === 400 && err.msgKey === 'file.folder.create.error.exists') {
        folderExists.value = true
      }

      error.value = err
      throw err
    } finally {
      isCreating.value = false
    }
  }

  /**
   * Creates a case folder within a client folder
   * @param {string} clientFolderId - Parent client folder ID
   * @param {string} caseId - Case identifier
   * @returns {Promise<Object>} Created folder data
   */
  async function createCaseFolder(clientFolderId, caseId) {
    isCreating.value = true
    error.value = null

    try {
      const response = await fileApi.createCaseFolder(clientFolderId, caseId)

      // Update auth token if returned
      if (response.token) {
        authStore.setAuth(response.token, authStore.user)
      }

      folderData.value = response.data
      return response.data
    } catch (err) {
      console.error('Create case folder failed:', err)
      error.value = err
      throw err
    } finally {
      isCreating.value = false
    }
  }

  /**
   * Lists all folders within a given folder
   * @param {string} folderId - Folder ID to list contents
   * @returns {Promise<Array>} Array of folder objects
   */
  async function listFolders(folderId) {
    isLoading.value = true
    error.value = null

    try {
      const response = await fileApi.listFolders(folderId)

      // Update auth token if returned
      if (response.token) {
        authStore.setAuth(response.token, authStore.user)
      }

      return response.data.folders
    } catch (err) {
      console.error('List folders failed:', err)
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Uploads a file to a folder with conflict detection
   * @param {string} folderId - Target folder ID
   * @param {File} file - File object to upload
   * @returns {Promise<Object>} Upload result with conflict indicator
   */
  async function uploadFile(folderId, file) {
    isLoading.value = true
    error.value = null

    try {
      const response = await fileApi.uploadFile(folderId, file.name, file)

      // Update auth token if returned
      if (response.token) {
        authStore.setAuth(response.token, authStore.user)
      }

      // Check if conflict detected
      if (response.data.conflict) {
        return {
          conflict: true,
          existingFileId: response.data.existingFileId,
          fileName: response.data.fileName
        }
      }

      // No conflict - file uploaded successfully
      return {
        conflict: false,
        file: response.data.file
      }
    } catch (err) {
      console.error('Upload file failed:', err)
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Resolves a file upload conflict
   * @param {string} folderId - Target folder ID
   * @param {File} file - File object to upload
   * @param {string} resolution - Resolution type: "overwrite", "rename", or "cancel"
   * @returns {Promise<Object>} Resolution result
   */
  async function resolveFileConflict(folderId, file, resolution) {
    isLoading.value = true
    error.value = null

    try {
      const response = await fileApi.resolveFileConflict(
        folderId,
        file.name,
        file,
        resolution
      )

      // Update auth token if returned
      if (response.token) {
        authStore.setAuth(response.token, authStore.user)
      }

      return response.data
    } catch (err) {
      console.error('Resolve file conflict failed:', err)
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Lists files in a folder
   * @param {string} folderId - Folder ID
   * @returns {Promise<Array>} Array of file objects
   */
  async function listFiles(folderId) {
    isLoading.value = true
    error.value = null

    try {
      const response = await fileApi.listFiles(folderId)

      // Update auth token if returned
      if (response.token) {
        authStore.setAuth(response.token, authStore.user)
      }

      return response.data.files
    } catch (err) {
      console.error('List files failed:', err)
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Deletes a file
   * @param {string} fileId - File ID to delete
   * @returns {Promise<Object>} Deletion result
   */
  async function deleteFile(fileId) {
    isLoading.value = true
    error.value = null

    try {
      const response = await fileApi.deleteFile(fileId)

      // Update auth token if returned
      if (response.token) {
        authStore.setAuth(response.token, authStore.user)
      }

      return response.data
    } catch (err) {
      console.error('Delete file failed:', err)
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Lists both folders and files in a folder (for navigation)
   * @param {string} folderId - Folder ID
   * @returns {Promise<Object>} Object with folders and files arrays
   */
  async function listFolderContents(folderId) {
    isLoading.value = true
    error.value = null

    try {
      const response = await fileApi.listFolderContents(folderId)

      // Update auth token if returned
      if (response.token) {
        authStore.setAuth(response.token, authStore.user)
      }

      return {
        folders: response.data.folders,
        files: response.data.files,
        folderCount: response.data.folderCount,
        fileCount: response.data.fileCount
      }
    } catch (err) {
      console.error('List folder contents failed:', err)
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Gets download URL for a file
   * @param {string} fileId - File ID
   * @returns {Promise<Object>} Download URL and file info
   */
  async function getDownloadUrl(fileId) {
    isLoading.value = true
    error.value = null

    try {
      const response = await fileApi.downloadFile(fileId)

      // Update auth token if returned
      if (response.token) {
        authStore.setAuth(response.token, authStore.user)
      }

      return response.data
    } catch (err) {
      console.error('Get download URL failed:', err)
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Resets all state
   */
  function reset() {
    folderData.value = null
    searchResults.value = null
    isLoading.value = false
    isCreating.value = false
    isSearching.value = false
    error.value = null
    folderExists.value = false
  }

  return {
    // State
    folderData,
    searchResults,
    isLoading,
    isCreating,
    isSearching,
    error,
    folderExists,

    // Methods
    searchClientFolder,
    createClientFolder,
    createCaseFolder,
    listFolders,
    uploadFile,
    resolveFileConflict,
    listFiles,
    deleteFile,
    listFolderContents,
    getDownloadUrl,
    reset
  }
}
