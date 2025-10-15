/**
 * files.js
 *
 * Pinia store for file and folder management operations.
 * Handles upload progress tracking, folder contents, and file operations.
 *
 * Per constitution: Pinia store with Vue 3 Composition API.
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/services/api'

export const useFilesStore = defineStore('files', () => {
  // State
  const currentFolderContents = ref({
    files: [],
    folders: []
  })
  const uploadProgress = ref({}) // Map of fileName -> percentage
  const loading = ref(false)
  const error = ref(null)

  // Actions

  /**
   * Upload multiple files to a case folder
   * @param {string} caseFolderId - Target case folder ID
   * @param {Array} files - Array of file objects with fileName, content, mimeType, displayName
   * @returns {Promise<Object>} Upload results
   */
  async function uploadFiles(caseFolderId, files) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post({
        action: 'file.uploadBatch',
        caseFolderId,
        files
      })

      return response
    } catch (err) {
      error.value = err.message || 'Failed to upload files'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * List contents (files and folders) of a folder
   * @param {string} folderId - Folder ID to list
   * @returns {Promise<Object>} Folder contents
   */
  async function listFolderContents(folderId) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post({
        action: 'file.listFolderContents',
        folderId
      })

      // Update current folder contents
      currentFolderContents.value = {
        files: response.files || [],
        folders: response.folders || []
      }

      return response
    } catch (err) {
      error.value = err.message || 'Failed to list folder contents'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Download a file
   * @param {string} fileId - File ID to download
   * @returns {Promise<Object>} Download URL and file info
   */
  async function downloadFile(fileId) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post({
        action: 'file.downloadFile',
        fileId
      })

      // Trigger download in browser
      if (response.downloadUrl) {
        window.open(response.downloadUrl, '_blank')
      }

      return response
    } catch (err) {
      error.value = err.message || 'Failed to download file'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a file
   * @param {string} fileId - File ID to delete
   * @returns {Promise<Object>} Deletion result
   */
  async function deleteFile(fileId) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post({
        action: 'file.deleteFile',
        fileId
      })

      // Remove file from current folder contents
      currentFolderContents.value.files = currentFolderContents.value.files.filter(
        file => file.fileId !== fileId
      )

      return response
    } catch (err) {
      error.value = err.message || 'Failed to delete file'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Rename a file (placeholder for future implementation)
   * @param {string} fileId - File ID to rename
   * @param {string} newName - New file name
   * @returns {Promise<Object>} Rename result
   */
  async function renameFile(fileId, newName) {
    loading.value = true
    error.value = null

    try {
      // This will be implemented in Phase 13 (User Story 11)
      throw new Error('File rename not yet implemented')
    } catch (err) {
      error.value = err.message || 'Failed to rename file'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update upload progress for a file
   * @param {string} fileName - File name
   * @param {number} percentage - Progress percentage (0-100)
   */
  function updateUploadProgress(fileName, percentage) {
    uploadProgress.value[fileName] = percentage
  }

  /**
   * Clear upload progress for a file
   * @param {string} fileName - File name
   */
  function clearUploadProgress(fileName) {
    delete uploadProgress.value[fileName]
  }

  /**
   * Clear all upload progress
   */
  function clearAllUploadProgress() {
    uploadProgress.value = {}
  }

  /**
   * Reset store state
   */
  function resetStore() {
    currentFolderContents.value = { files: [], folders: [] }
    uploadProgress.value = {}
    loading.value = false
    error.value = null
  }

  return {
    // State
    currentFolderContents,
    uploadProgress,
    loading,
    error,

    // Actions
    uploadFiles,
    listFolderContents,
    downloadFile,
    deleteFile,
    renameFile,
    updateUploadProgress,
    clearUploadProgress,
    clearAllUploadProgress,
    resetStore
  }
})
