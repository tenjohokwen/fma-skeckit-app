/**
 * useRoleAccess.js
 *
 * Composable for role-based access control (RBAC)
 * Provides computed properties for checking user permissions based on role
 *
 * Feature 004: Read-Only Access for Non-Admin Users
 * Phase 3: Frontend Access Control
 */

import { computed } from 'vue'
import { useAuthStore } from 'src/stores/authStore'

/**
 * Composable for role-based access control
 * @returns {Object} Role access computed properties
 */
export function useRoleAccess() {
  const authStore = useAuthStore()

  /**
   * Check if current user has admin role
   * @type {import('vue').ComputedRef<boolean>}
   */
  const isAdmin = computed(() => {
    return authStore.user?.role === 'ROLE_ADMIN'
  })

  /**
   * Check if current user can create resources (clients, cases, folders, files)
   * @type {import('vue').ComputedRef<boolean>}
   */
  const canCreate = computed(() => {
    return isAdmin.value
  })

  /**
   * Check if current user can edit/update resources
   * @type {import('vue').ComputedRef<boolean>}
   */
  const canEdit = computed(() => {
    return isAdmin.value
  })

  /**
   * Check if current user can delete resources
   * @type {import('vue').ComputedRef<boolean>}
   */
  const canDelete = computed(() => {
    return isAdmin.value
  })

  /**
   * Check if current user can download files
   * @type {import('vue').ComputedRef<boolean>}
   */
  const canDownload = computed(() => {
    return isAdmin.value
  })

  /**
   * Check if current user can rename files
   * @type {import('vue').ComputedRef<boolean>}
   */
  const canRename = computed(() => {
    return isAdmin.value
  })

  /**
   * Check if current user can upload files
   * @type {import('vue').ComputedRef<boolean>}
   */
  const canUpload = computed(() => {
    return isAdmin.value
  })

  /**
   * Check if current user is in view-only mode (non-admin)
   * @type {import('vue').ComputedRef<boolean>}
   */
  const isViewOnly = computed(() => {
    return !isAdmin.value
  })

  return {
    isAdmin,
    canCreate,
    canEdit,
    canDelete,
    canDownload,
    canRename,
    canUpload,
    isViewOnly
  }
}
