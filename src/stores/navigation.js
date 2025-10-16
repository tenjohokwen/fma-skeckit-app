/**
 * navigation.js
 *
 * Pinia store for managing folder navigation and breadcrumb state.
 * Tracks current path through folder hierarchy for breadcrumb display.
 *
 * Per constitution: Pinia store with Vue 3 Composition API.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNavigationStore = defineStore('navigation', () => {
  // State
  // currentPath is an array of PathSegment objects: { folderId, folderName, type }
  // type can be: 'root', 'client', 'case', 'folder'
  const currentPath = ref([])

  // Computed
  /**
   * Generate breadcrumbs from current path
   * Each breadcrumb has: folderId, folderName, type, isClickable, route
   */
  const breadcrumbs = computed(() => {
    if (currentPath.value.length === 0) {
      return []
    }

    return currentPath.value.map((segment, index) => {
      const isLast = index === currentPath.value.length - 1

      return {
        folderId: segment.folderId,
        folderName: segment.folderName,
        type: segment.type,
        isClickable: !isLast, // All segments clickable except current location
        index: index,
        // Generate route path for navigation
        route: generateRoutePath(currentPath.value.slice(0, index + 1))
      }
    })
  })

  /**
   * Get the current folder (last segment in path)
   */
  const currentFolder = computed(() => {
    if (currentPath.value.length === 0) {
      return null
    }
    return currentPath.value[currentPath.value.length - 1]
  })

  /**
   * Get the parent folder (second to last segment)
   */
  const parentFolder = computed(() => {
    if (currentPath.value.length < 2) {
      return null
    }
    return currentPath.value[currentPath.value.length - 2]
  })

  // Actions

  /**
   * Navigate to a folder by adding it to the path
   * @param {Object} folder - Folder object with folderId, folderName, type
   */
  function navigateToFolder(folder) {
    if (!folder || !folder.folderId || !folder.folderName) {
      console.error('Invalid folder object:', folder)
      return
    }

    currentPath.value.push({
      folderId: folder.folderId,
      folderName: folder.folderName,
      type: folder.type || 'folder'
    })
  }

  /**
   * Navigate to a specific index in the breadcrumb path
   * Removes all segments after the specified index
   * @param {number} index - Index to navigate to
   */
  function navigateToIndex(index) {
    if (index < 0 || index >= currentPath.value.length) {
      console.error('Invalid breadcrumb index:', index)
      return
    }

    // Keep only segments up to and including the target index
    currentPath.value = currentPath.value.slice(0, index + 1)
  }

  /**
   * Navigate to parent folder (go up one level)
   * @returns {Object|null} The parent folder or null if at root
   */
  function navigateToParent() {
    if (currentPath.value.length <= 1) {
      return null
    }

    currentPath.value.pop()
    return currentFolder.value
  }

  /**
   * Reset path to root or empty
   */
  function resetToRoot() {
    currentPath.value = []
  }

  /**
   * Set the entire path at once (useful for initialization from URL)
   * @param {Array} pathSegments - Array of path segment objects
   */
  function setPath(pathSegments) {
    if (!Array.isArray(pathSegments)) {
      console.error('Path segments must be an array:', pathSegments)
      return
    }

    // Validate all segments have required fields
    const validSegments = pathSegments.filter(segment =>
      segment.folderId && segment.folderName
    )

    currentPath.value = validSegments.map(segment => ({
      folderId: segment.folderId,
      folderName: segment.folderName,
      type: segment.type || 'folder'
    }))
  }

  /**
   * Get current folder ID
   * @returns {string|null} Current folder ID or null
   */
  function getCurrentFolderId() {
    return currentFolder.value ? currentFolder.value.folderId : null
  }

  /**
   * Get parent folder ID
   * @returns {string|null} Parent folder ID or null
   */
  function getParentFolderId() {
    return parentFolder.value ? parentFolder.value.folderId : null
  }

  /**
   * Check if we're at the root (no folders in path)
   * @returns {boolean} True if at root
   */
  function isAtRoot() {
    return currentPath.value.length === 0
  }

  /**
   * Get the depth of the current path
   * @returns {number} Number of folders in path
   */
  function getDepth() {
    return currentPath.value.length
  }

  // Helper Functions

  /**
   * Generate a route path from path segments
   * @param {Array} segments - Path segments
   * @returns {string} Route path
   */
  function generateRoutePath(segments) {
    if (!segments || segments.length === 0) {
      return '/files'
    }

    // Build path from folder IDs
    const folderIds = segments.map(s => s.folderId).join('/')
    return `/files/${folderIds}`
  }

  return {
    // State
    currentPath,

    // Computed
    breadcrumbs,
    currentFolder,
    parentFolder,

    // Actions
    navigateToFolder,
    navigateToIndex,
    navigateToParent,
    resetToRoot,
    setPath,
    getCurrentFolderId,
    getParentFolderId,
    isAtRoot,
    getDepth
  }
})
