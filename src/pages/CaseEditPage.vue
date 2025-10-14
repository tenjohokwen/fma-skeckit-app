<template>
  <q-page padding>
    <div class="case-edit-page">
      <!-- Page Header -->
      <div class="page-header q-mb-lg">
        <div class="row items-center">
          <div class="col">
            <h1 class="text-h4 q-mb-xs">{{ $t('edit.pageTitle') }}</h1>
            <p class="text-body2 text-grey-7">{{ $t('edit.pageSubtitle') }}</p>
          </div>
          <div class="col-auto">
            <q-btn
              flat
              icon="arrow_back"
              :label="$t('common.back')"
              @click="handleBack"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center q-mt-lg">
        <LoadingIndicator :message="$t('edit.loading')" />
      </div>

      <!-- Error State -->
      <div v-else-if="error && !caseData" class="q-mt-lg">
        <ErrorDisplay
          type="error"
          :title="$t('edit.error.title')"
          :message="error.message || $t('edit.error.generic')"
        />
      </div>

      <!-- Editor -->
      <div v-else-if="caseData">
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

import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { useMetadata } from 'src/composables/useMetadata'
import { useNotifications } from 'src/composables/useNotifications'
import CaseEditor from 'src/components/metadata/CaseEditor.vue'
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue'
import ErrorDisplay from 'src/components/shared/ErrorDisplay.vue'

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

// Check admin permission
if (!authStore.isAdmin) {
  notifyError('Admin role required')
  router.push({ name: 'Search' })
}

// Computed
const caseId = computed(() => route.params.caseId)

// Methods
async function loadCase() {
  try {
    await fetchCaseForEdit(caseId.value)
  } catch (err) {
    console.error('Failed to load case:', err)
    if (err.status === 403) {
      notifyError('Admin role required')
      router.push({ name: 'Search' })
    } else if (err.status === 404) {
      notifyError('Case not found')
      router.push({ name: 'Search' })
    } else {
      notifyError(err.message || 'Failed to load case')
    }
  }
}

async function handleSave(updates) {
  try {
    await updateCase(caseId.value, updates, caseData.value.version)
    notifySuccess('Case updated successfully')
    router.push({ name: 'Search' })
  } catch (err) {
    console.error('Failed to save case:', err)
    if (!versionConflict.value) {
      notifyError(err.message || 'Failed to save case')
    }
  }
}

function handleCancel() {
  router.push({ name: 'Search' })
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
  router.push({ name: 'Search' })
}

// Lifecycle
onMounted(() => {
  if (caseId.value) {
    loadCase()
  } else {
    notifyError('Case ID is required')
    router.push({ name: 'Search' })
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
