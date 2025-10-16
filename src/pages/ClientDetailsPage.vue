<template>
  <q-page padding>
    <div class="client-details-page">
      <!-- Page Header -->
      <div class="page-header q-mb-lg">
        <q-btn
          flat
          icon="arrow_back"
          :label="$t('common.back')"
          @click="$router.back()"
          class="q-mb-md"
        />
        <h1 class="text-h4 q-mb-xs">
          {{ client ? `${client.firstName} ${client.lastName}` : $t('client.details.title') }}
        </h1>
        <p class="text-body2 text-grey-7">
          {{ client ? client.nationalId : $t('client.details.subtitle') }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="row justify-center q-py-xl">
        <q-spinner-dots color="primary" size="50px" />
        <div class="text-body2 text-grey-7 q-mt-md full-width text-center">
          {{ $t('common.loading') }}
        </div>
      </div>

      <!-- Error State -->
      <q-banner v-else-if="error" dense rounded class="bg-negative text-white q-mb-md">
        <template v-slot:avatar>
          <q-icon name="error" color="white" />
        </template>
        {{ error }}
        <template v-slot:action>
          <q-btn
            flat
            :label="$t('common.retry')"
            @click="loadClientDetails"
          />
        </template>
      </q-banner>

      <!-- Client Details and Cases -->
      <div v-else-if="client" class="q-gutter-lg">
        <!-- Client Personal Information -->
        <ClientDetails :client="client" />

        <!-- Cases List -->
        <CaseList
          :cases="cases"
          @case-click="handleCaseClick"
          @create-case="handleCreateCase"
        />
      </div>

      <!-- Empty State (no client found) -->
      <div v-else class="text-center q-py-xl">
        <q-icon name="person_off" size="64px" color="grey-5" />
        <div class="text-h6 text-grey-7 q-mt-md">
          {{ $t('client.details.notFound') }}
        </div>
        <q-btn
          flat
          color="primary"
          :label="$t('common.back')"
          icon="arrow_back"
          @click="$router.back()"
          class="q-mt-md"
        />
      </div>
    </div>

    <!-- Create Case Dialog -->
    <q-dialog v-model="showCreateCaseDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('case.create.title') }}</div>
          <div class="text-caption text-grey-7">
            {{ client ? `${client.firstName} ${client.lastName}` : '' }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <CaseForm
            ref="caseFormRef"
            :loading="creatingCase"
            @submit="handleCaseSubmit"
            @cancel="handleCaseCancel"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
/**
 * ClientDetailsPage.vue
 *
 * Displays detailed information about a client and their cases.
 * Implementation for User Story 3 (Phase 5).
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ClientDetails from 'src/components/clients/ClientDetails.vue'
import CaseList from 'src/components/cases/CaseList.vue'
import CaseForm from 'src/components/cases/CaseForm.vue'
import { useClientStore } from 'src/stores/client'
import { useNotifications } from 'src/composables/useNotifications'
import { api } from 'src/services/api'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const clientStore = useClientStore()
const { notifyError, notifySuccess } = useNotifications()

// State
const loading = ref(false)
const error = ref(null)
const client = ref(null)
const cases = ref([])
const showCreateCaseDialog = ref(false)
const creatingCase = ref(false)
const caseFormRef = ref(null)

// Methods
async function loadClientDetails() {
  const clientId = route.params.clientId

  if (!clientId) {
    error.value = 'Client ID is missing'
    return
  }

  loading.value = true
  error.value = null

  try {
    const result = await clientStore.getClientDetails(clientId)

    // Handle different response formats
    if (result.client) {
      client.value = result.client
      cases.value = result.cases || []
    } else {
      // If getClientDetails returns the client directly
      client.value = result
      cases.value = []
    }

  } catch (err) {
    // Try to use selected client from store as fallback
    if (clientStore.selectedClient && clientStore.selectedClient.clientId === clientId) {
      client.value = clientStore.selectedClient
      cases.value = []
    } else {
      error.value = err.message || 'Failed to load client details'
      notifyError(error.value)
    }
  } finally {
    loading.value = false
  }
}

function handleCaseClick(caseItem) {
  // Navigate to case files page
  router.push({
    name: 'case-files',
    params: { folderId: caseItem.folderId },
    query: {
      caseId: caseItem.caseId,
      clientName: `${client.value.firstName} ${client.value.lastName}`
    }
  })
}

function handleCreateCase() {
  // Open create case dialog
  showCreateCaseDialog.value = true
}

async function handleCaseSubmit(caseData) {
  if (!client.value || !client.value.clientId) {
    notifyError('Client information is missing')
    return
  }

  creatingCase.value = true

  try {
    // Call API to create case
    await api.post('case.create', {
      clientId: client.value.clientId,
      caseId: caseData.caseId
    })

    // Close dialog and reset form
    showCreateCaseDialog.value = false
    caseFormRef.value?.resetForm()

    // Show success message
    notifySuccess(t('case.create.success'))

    // Reload client details to show the new case
    await loadClientDetails()

    // Navigate to file management page for the new case (future implementation)
    // When Phases 7-9 are implemented, uncomment:
    // router.push({
    //   name: 'files',
    //   params: { pathMatch: ['cases', client.value.folderId, caseData.caseId] }
    // })

  } catch (err) {
    console.error('Failed to create case:', err)

    // Handle specific error types
    if (err.msgKey === 'case.create.error.duplicate') {
      caseFormRef.value?.setError(t('caseFolder.create.error.duplicate'))
    } else if (err.msgKey === 'case.create.error.invalidFormat') {
      caseFormRef.value?.setError(t('case.create.validation.format'))
    } else {
      notifyError(err.message || 'Failed to create case')
    }
  } finally {
    creatingCase.value = false
  }
}

function handleCaseCancel() {
  showCreateCaseDialog.value = false
  caseFormRef.value?.resetForm()
}

onMounted(() => {
  loadClientDetails()
})
</script>

<style scoped lang="scss">
.client-details-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  border-bottom: 2px solid var(--q-color-grey-3);
  padding-bottom: 1rem;
}
</style>
