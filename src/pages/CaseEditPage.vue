<template>
  <q-page padding>
    <div class="case-edit-page">
      <!-- Page Header -->
      <div class="page-header q-mb-lg">
        <div class="row items-center">
          <div class="col">
            <h1 class="text-h4 q-mb-xs">{{ pageTitle }}</h1>
            <p class="text-body2 text-grey-7">{{ pageSubtitle }}</p>
          </div>
          <div class="col-auto">
            <q-btn
              flat
              icon="arrow_back"
              label="Back"
              @click="handleBack"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center q-mt-lg">
        <q-spinner-dots color="primary" size="50px" />
        <div class="text-body2 text-grey-7 q-mt-md">Loading case details...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error && !caseData" class="q-mt-lg">
        <q-banner dense rounded class="bg-negative text-white">
          <template #avatar>
            <q-icon name="error" />
          </template>
          {{ error.message || 'Failed to load case' }}
        </q-banner>
      </div>

      <!-- Viewer (Read-only) -->
      <div v-else-if="caseData && isViewMode">
        <CaseViewer
          :case-data="caseData"
          @back="handleBack"
          @edit="switchToEditMode"
        />
      </div>

      <!-- Editor -->
      <div v-else-if="caseData && !isViewMode">
        <CaseEditor
          :case-data="caseData"
          :is-saving="isSaving"
          :version-conflict="versionConflict"
          @save="handleSave"
          @cancel="handleCancel"
          @refresh="handleRefresh"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
/**
 * CaseEditPage.vue
 *
 * Page for editing case metadata (admin only).
 * Integrates CaseEditor component with useMetadata composable.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { useMetadata } from 'src/composables/useMetadata'
import { useNotifications } from 'src/composables/useNotifications'
import CaseEditor from 'src/components/metadata/CaseEditor.vue'
import CaseViewer from 'src/components/metadata/CaseViewer.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { notifySuccess, notifyError } = useNotifications()

const {
  caseData,
  isLoading,
  isSaving,
  error,
  versionConflict,
  fetchCaseForEdit,
  updateCase,
  refreshCase
} = useMetadata()

// Local state for view mode
const isViewMode = ref(false)

// Computed
const caseId = computed(() => route.params.caseId)
const mode = computed(() => route.query.mode || 'edit')

// Initialize view mode based on query parameter
isViewMode.value = mode.value === 'view'

// Check if user can edit (admin only)
const canEdit = computed(() => authStore.isAdmin)

// Page title based on mode
const pageTitle = computed(() => {
  return isViewMode.value ? 'Case Details' : 'Edit Case'
})

const pageSubtitle = computed(() => {
  return isViewMode.value
    ? 'View case information'
    : 'Update case metadata and details'
})

// Methods
async function loadCase() {
  try {
    await fetchCaseForEdit(caseId.value)
  } catch (err) {
    console.error('Failed to load case:', err)
    if (err.status === 403) {
      notifyError('Admin role required')
      router.push({ name: 'search' })
    } else if (err.status === 404) {
      notifyError('Case not found')
      router.push({ name: 'search' })
    } else {
      notifyError(err.message || 'Failed to load case')
    }
  }
}

async function handleSave(updates) {
  try {
    await updateCase(caseId.value, updates, caseData.value.version)
    notifySuccess('Case updated successfully')
    router.push({ name: 'search' })
  } catch (err) {
    console.error('Failed to save case:', err)
    if (!versionConflict.value) {
      notifyError(err.message || 'Failed to save case')
    }
  }
}

function handleCancel() {
  router.push({ name: 'search' })
}

async function handleRefresh() {
  try {
    await refreshCase(caseId.value)
    notifySuccess('Case data refreshed')
  } catch (err) {
    console.error('Failed to refresh case:', err)
    notifyError(err.message || 'Failed to refresh case')
  }
}

function handleBack() {
  router.push({ name: 'search' })
}

function switchToEditMode() {
  // Check if user has admin rights
  if (!canEdit.value) {
    notifyError('Admin role required to edit cases')
    return
  }

  // Switch to edit mode
  isViewMode.value = false

  // Update URL to reflect edit mode
  router.replace({
    name: 'CaseEdit',
    params: { caseId: caseId.value },
    query: { mode: 'edit' }
  })
}

// Lifecycle
onMounted(() => {
  if (caseId.value) {
    loadCase()
  } else {
    notifyError('Case ID is required')
    router.push({ name: 'search' })
  }
})
</script>

<style scoped>
.case-edit-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  border-bottom: 2px solid var(--color-light-grey);
  padding-bottom: 1rem;
}
</style>
