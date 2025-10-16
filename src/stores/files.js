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
      const response = await api.post('file.uploadBatch', {
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
      const response = await api.post('file.listFolderContents', {
        folderId
      })

      // Update current folder contents
      currentFolderContents.value = {
        files: response.data.files || [],
        folders: response.data.folders || []
      }

      return response.data
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
      const response = await api.post('file.downloadFile', {
        fileId
      })

      // Convert base64 content to blob and trigger download
      if (response.data.content) {
        // Decode base64 to binary
        const binaryString = atob(response.data.content)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }

        // Create blob from binary data
        const blob = new Blob([bytes], { type: response.data.mimeType || 'application/octet-stream' })

        // Create download link
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = response.data.fileName || 'download'
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()

        // Clean up
        setTimeout(() => {
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }, 100)
      }

      return response.data
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
      const response = await api.post('file.deleteFile', {
        fileId
      })

      // Remove file from current folder contents
      currentFolderContents.value.files = currentFolderContents.value.files.filter(
        file => file.fileId !== fileId
      )

      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to delete file'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Rename a file
   * @param {string} fileId - File ID to rename
   * @param {string} newName - New file name
   * @returns {Promise<Object>} Rename result
   */
  async function renameFile(fileId, newName) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('file.renameFile', {
        fileId,
        newName
      })

      // Update file name in current folder contents if it exists
      const fileIndex = currentFolderContents.value.files.findIndex(
        file => file.fileId === fileId
      )
      if (fileIndex !== -1) {
        currentFolderContents.value.files[fileIndex].name = newName
      }

      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to rename file'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a folder and all its contents
   * Requires typed confirmation "DELETE"
   * @param {string} folderId - Folder ID to delete
   * @param {string} confirmation - Must be exactly "DELETE"
   * @returns {Promise<Object>} Deletion result
   */
  async function deleteFolder(folderId, confirmation) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('folder.delete', {
        folderId,
        confirmation
      })

      // Remove folder from current folder contents if it's there
      currentFolderContents.value.folders = currentFolderContents.value.folders.filter(
        folder => folder.folderId !== folderId
      )

      return response.data
    } catch (err) {
      error.value = err.message || 'Failed to delete folder'
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
    deleteFolder,
    renameFile,
    updateUploadProgress,
    clearUploadProgress,
    clearAllUploadProgress,
    resetStore
  }
})
