/**
 * useNavigation.js
 *
 * Composable for folder navigation and breadcrumb management.
 * Wraps the Navigation Pinia store for convenient access in components.
 *
 * Per constitution: Vue 3 Composition API composable.
 */

import { useNavigationStore } from 'src/stores/navigation'
import { storeToRefs } from 'pinia'

export function useNavigation() {
  const navigationStore = useNavigationStore()

  // Reactive refs from store
  const {
    currentPath,
    breadcrumbs,
    currentFolder,
    parentFolder
  } = storeToRefs(navigationStore)

  /**
   * Push a new folder onto the navigation path
   * @param {Object} folder - Folder object { folderId, folderName, type }
   */
  function pushFolder(folder) {
    navigationStore.navigateToFolder(folder)
  }

  /**
   * Pop to a specific breadcrumb index (navigate backwards)
   * @param {number} index - Index in breadcrumb trail to navigate to
   */
  function popToIndex(index) {
    navigationStore.navigateToIndex(index)
  }

  /**
   * Go up one level to parent folder
   * @returns {Object|null} Parent folder or null if at root
   */
  function goToParent() {
    return navigationStore.navigateToParent()
  }

  /**
   * Reset navigation to root (empty path)
   */
  function resetToRoot() {
    navigationStore.resetToRoot()
  }

  /**
   * Get the current folder being viewed
   * @returns {Object|null} Current folder object or null
   */
  function getCurrentFolder() {
    return currentFolder.value
  }

  /**
   * Get the parent of current folder
   * @returns {Object|null} Parent folder object or null
   */
  function getParentFolder() {
    return parentFolder.value
  }

  /**
   * Get current folder ID
   * @returns {string|null} Folder ID or null
   */
  function getCurrentFolderId() {
    return navigationStore.getCurrentFolderId()
  }

  /**
   * Get parent folder ID
   * @returns {string|null} Parent folder ID or null
   */
  function getParentFolderId() {
    return navigationStore.getParentFolderId()
  }

  /**
   * Set the entire navigation path (useful for initialization)
   * @param {Array} pathSegments - Array of path segments
   */
  function setNavigationPath(pathSegments) {
    navigationStore.setPath(pathSegments)
  }

  /**
   * Check if at root level
   * @returns {boolean} True if at root
   */
  function isAtRoot() {
    return navigationStore.isAtRoot()
  }

  /**
   * Get path depth
   * @returns {number} Number of levels deep in folder hierarchy
   */
  function getPathDepth() {
    return navigationStore.getDepth()
  }

  /**
   * Build a folder object from parameters
   * @param {string} folderId - Folder ID
   * @param {string} folderName - Folder display name
   * @param {string} type - Folder type ('root', 'client', 'case', 'folder')
   * @returns {Object} Folder object
   */
  function buildFolderObject(folderId, folderName, type = 'folder') {
    return {
      folderId,
      folderName,
      type
    }
  }

  return {
    // Reactive state
    currentPath,
    breadcrumbs,
    currentFolder,
    parentFolder,

    // Navigation actions
    pushFolder,
    popToIndex,
    goToParent,
    resetToRoot,
    setNavigationPath,

    // Getters
    getCurrentFolder,
    getParentFolder,
    getCurrentFolderId,
    getParentFolderId,
    isAtRoot,
    getPathDepth,

    // Utilities
    buildFolderObject
  }
}
