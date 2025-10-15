/**
 * useFileOperations.js
 *
 * Composable for file operations including upload with progress tracking.
 * Handles base64 encoding, chunking, and file size validation.
 *
 * Per constitution: Vue 3 Composition API composable.
 */

import { useFilesStore } from 'src/stores/files'
import { useNotifications } from 'src/composables/useNotifications'

export function useFileOperations() {
  const filesStore = useFilesStore()
  const { notifyError } = useNotifications()

  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB in bytes

  /**
   * Convert a File object to base64 string
   * @param {File} file - File to convert
   * @returns {Promise<string>} Base64-encoded file content
   */
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64String = reader.result.split(',')[1]
        resolve(base64String)
      }

      reader.onerror = (error) => {
        reject(error)
      }

      reader.readAsDataURL(file)
    })
  }

  /**
   * Validate file size
   * @param {File} file - File to validate
   * @returns {boolean} True if valid
   */
  function validateFileSize(file) {
    if (file.size > MAX_FILE_SIZE) {
      notifyError(`File "${file.name}" exceeds 50MB size limit`)
      return false
    }
    return true
  }

  /**
   * Upload a single file with progress tracking
   * @param {Object} params - Upload parameters
   * @param {string} params.caseFolderId - Target case folder ID
   * @param {File} params.file - File object to upload
   * @param {string} params.displayName - Optional display name
   * @param {Function} params.onProgress - Progress callback (percentage)
   * @returns {Promise<Object>} Upload result
   */
  async function uploadFile({ caseFolderId, file, displayName, onProgress }) {
    // Validate file size
    if (!validateFileSize(file)) {
      throw new Error('File size exceeds limit')
    }

    try {
      // Update progress to 10% (starting upload)
      if (onProgress) onProgress(10)
      filesStore.updateUploadProgress(file.name, 10)

      // Convert file to base64
      const base64Content = await fileToBase64(file)

      // Update progress to 50% (file encoded)
      if (onProgress) onProgress(50)
      filesStore.updateUploadProgress(file.name, 50)

      // Prepare file data
      const fileData = {
        fileName: file.name,
        content: base64Content,
        mimeType: file.type || 'application/octet-stream',
        displayName: displayName || file.name
      }

      // Upload to server
      const result = await filesStore.uploadFiles(caseFolderId, [fileData])

      // Update progress to 100%
      if (onProgress) onProgress(100)
      filesStore.updateUploadProgress(file.name, 100)

      // Clear progress after a short delay
      setTimeout(() => {
        filesStore.clearUploadProgress(file.name)
      }, 1000)

      return result
    } catch (error) {
      // Clear progress on error
      filesStore.clearUploadProgress(file.name)
      throw error
    }
  }

  /**
   * Upload multiple files with progress tracking
   * @param {Object} params - Upload parameters
   * @param {string} params.caseFolderId - Target case folder ID
   * @param {Array} params.files - Array of {file: File, displayName: string}
   * @param {Function} params.onProgress - Progress callback (fileName, percentage)
   * @returns {Promise<Object>} Upload results
   */
  async function uploadMultipleFiles({ caseFolderId, files, onProgress }) {
    const fileDataArray = []

    // Validate all files first
    for (const fileInfo of files) {
      if (!validateFileSize(fileInfo.file)) {
        throw new Error(`File "${fileInfo.file.name}" exceeds size limit`)
      }
    }

    try {
      // Convert all files to base64
      for (let i = 0; i < files.length; i++) {
        const { file, displayName } = files[i]

        // Update progress for this file
        const progressPercent = Math.round((i / files.length) * 50)
        if (onProgress) onProgress(file.name, progressPercent)
        filesStore.updateUploadProgress(file.name, progressPercent)

        // Convert to base64
        const base64Content = await fileToBase64(file)

        fileDataArray.push({
          fileName: file.name,
          content: base64Content,
          mimeType: file.type || 'application/octet-stream',
          displayName: displayName || file.name
        })

        // Update progress to 50% for this file
        if (onProgress) onProgress(file.name, 50)
        filesStore.updateUploadProgress(file.name, 50)
      }

      // Upload all files to server
      const result = await filesStore.uploadFiles(caseFolderId, fileDataArray)

      // Update all files to 100%
      for (const fileInfo of files) {
        if (onProgress) onProgress(fileInfo.file.name, 100)
        filesStore.updateUploadProgress(fileInfo.file.name, 100)
      }

      // Clear all progress after a short delay
      setTimeout(() => {
        filesStore.clearAllUploadProgress()
      }, 1000)

      return result
    } catch (error) {
      // Clear all progress on error
      filesStore.clearAllUploadProgress()
      throw error
    }
  }

  /**
   * List files and folders in a case folder
   * @param {string} folderId - Folder ID
   * @returns {Promise<Object>} Folder contents
   */
  async function listFolderContents(folderId) {
    return await filesStore.listFolderContents(folderId)
  }

  /**
   * Download a file
   * @param {string} fileId - File ID
   * @returns {Promise<Object>} Download result
   */
  async function downloadFile(fileId) {
    return await filesStore.downloadFile(fileId)
  }

  /**
   * Delete a file
   * @param {string} fileId - File ID
   * @returns {Promise<Object>} Delete result
   */
  async function deleteFile(fileId) {
    return await filesStore.deleteFile(fileId)
  }

  return {
    uploadFile,
    uploadMultipleFiles,
    listFolderContents,
    downloadFile,
    deleteFile,
    validateFileSize,
    MAX_FILE_SIZE
  }
}
