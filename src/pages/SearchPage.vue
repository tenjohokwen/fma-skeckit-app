<template>
  <q-page padding>
    <div class="search-page">
      <!-- Page Header -->
      <div class="page-header q-mb-lg">
        <h1 class="text-h4 q-mb-xs">{{ $t('search.pageTitle') }}</h1>
        <p class="text-body2 text-grey-7">{{ $t('search.pageSubtitle') }}</p>
      </div>

      <!-- Tab Selection -->
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
      >
        <q-tab name="clients" :label="$t('search.tabs.clients')" icon="people" />
        <q-tab name="cases" :label="$t('search.tabs.cases')" icon="folder" />
      </q-tabs>

      <q-separator class="q-mb-lg" />

      <!-- Client Search Tab -->
      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel name="clients">
          <div class="q-gutter-lg">
            <!-- Client Search Form -->
            <ClientSearchForm
              :loading="clientStore.loading"
              @search="handleClientSearch"
              @clear="handleClearClientSearch"
            />

            <!-- Client Search Results -->
            <ClientSearchResults
              :results="displayedClientResults"
              :loading="clientStore.loading"
              @select-client="handleSelectClient"
              @view-client="handleViewClient"
              @create-client="showCreateClientDialog = true"
              @create-case="handleCreateCase"
            />
          </div>
        </q-tab-panel>

        <q-tab-panel name="cases">
          <!-- Case Search Bar -->
          <SearchBar ref="searchBarRef" />

      <!-- Loading State -->
      <div v-if="isSearching" class="q-mt-lg text-center">
        <LoadingIndicator :message="$t('search.searching')" />
      </div>

      <!-- Search Results -->
      <div v-else-if="searchResults.length > 0" class="search-results">
        <div class="results-header q-mb-md">
          <div class="text-h6">
            {{ $t('search.resultsTitle') }}
          </div>
          <div class="text-caption text-grey-7">
            {{ $t('search.resultsCount', { count: searchResults.length }) }}
          </div>
        </div>

        <div class="case-list">
          <div
            v-for="caseData in searchResults"
            :key="caseData.caseId"
            class="case-list-item q-mb-md"
          >
            <CaseCard
              :case-data="caseData"
              @view="handleViewCase"
              @edit="handleEditCase"
            />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="hasSearched && !searchError" class="empty-state q-mt-lg">
        <q-icon name="search_off" size="4rem" color="grey-5" />
        <div class="text-h6 q-mt-md text-grey-7">
          {{ $t('search.noResults') }}
        </div>
        <div class="text-body2 text-grey-6 q-mt-sm">
          {{ $t('search.noResultsHint') }}
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="searchError" class="error-state q-mt-lg">
        <ErrorDisplay
          type="error"
          :title="$t('search.error.title')"
          :message="searchError.message || $t('search.error.generic')"
          :dismissible="false"
        />
      </div>

      <!-- Initial State -->
      <div v-else class="initial-state q-mt-lg text-center">
        <q-icon name="search" size="4rem" color="grey-5" />
        <div class="text-h6 q-mt-md text-grey-7">
          {{ $t('search.initialStateTitle') }}
        </div>
        <div class="text-body2 text-grey-6 q-mt-sm">
          {{ $t('search.initialStateHint') }}
        </div>
      </div>
        </q-tab-panel>
      </q-tab-panels>

      <!-- Create Client Dialog -->
      <q-dialog v-model="showCreateClientDialog" persistent>
        <q-card style="min-width: 500px">
          <q-card-section>
            <div class="text-h6">{{ $t('client.create.title') }}</div>
            <div class="text-caption text-grey-7">
              {{ $t('client.create.subtitle') }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <ClientForm
              ref="clientFormRef"
              :loading="clientStore.loading"
              @submit="handleCreateClient"
              @cancel="handleCancelCreate"
            />
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
/**
 * SearchPage.vue
 *
 * Main page for searching clients and cases.
 * Integrates client search (US1) and case search (US3).
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SearchBar from 'src/components/search/SearchBar.vue'
import CaseCard from 'src/components/search/CaseCard.vue'
import ClientSearchForm from 'src/components/search/ClientSearchForm.vue'
import ClientSearchResults from 'src/components/search/ClientSearchResults.vue'
import ClientForm from 'src/components/clients/ClientForm.vue'
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue'
import ErrorDisplay from 'src/components/shared/ErrorDisplay.vue'
import { useNotifications } from 'src/composables/useNotifications'
import { useClientStore } from 'src/stores/client'
import { useSearch } from 'src/composables/useSearch'

const router = useRouter()
const { notifyInfo, notifyError } = useNotifications()
const clientStore = useClientStore()
const { initializeFuzzySearch } = useSearch()

// State
const activeTab = ref('clients')
const showCreateClientDialog = ref(false)

// Refs
const searchBarRef = ref(null)
const clientFormRef = ref(null)

// Computed - access search state from SearchBar
const searchResults = computed(() => {
  return searchBarRef.value?.searchResults || []
})

const isSearching = computed(() => {
  return searchBarRef.value?.isSearching || false
})

const searchError = computed(() => {
  return searchBarRef.value?.searchError || null
})

const hasSearched = computed(() => {
  // Check if SearchBar has performed a search
  return searchBarRef.value !== null &&
         (searchResults.value.length > 0 ||
          searchError.value !== null ||
          isSearching.value)
})

// Client search computed
const displayedClientResults = computed(() => {
  // Apply fuzzy search filtering if needed
  return clientStore.searchResults
})

// Client search methods
async function handleClientSearch(searchData) {
  try {
    await clientStore.searchClients(searchData)

    // Initialize fuzzy search with results
    if (clientStore.searchResults.length > 0) {
      initializeFuzzySearch(clientStore.searchResults)
    }

    if (clientStore.searchResults.length === 0) {
      notifyInfo('client.search.noResults')
    }
  } catch (error) {
    notifyError(error.message || 'client.search.error.generic')
  }
}

function handleClearClientSearch() {
  clientStore.clearSearch()
}

function handleSelectClient(client) {
  clientStore.selectClient(client)
  notifyInfo(`Selected client: ${client.firstName} ${client.lastName}`)
}

function handleViewClient(client) {
  // Navigate to client details page
  router.push({
    name: 'client-details',
    params: { clientId: client.clientId }
  })
}

function handleCreateCase(client) {
  // Navigate to case creation for this client (US4)
  notifyInfo('Case creation coming in Phase 4')
  console.log('Create case for client:', client)
}

async function handleCreateClient(clientData) {
  try {
    const newClient = await clientStore.createClient(clientData)

    // Close dialog and reset form
    showCreateClientDialog.value = false
    if (clientFormRef.value) {
      clientFormRef.value.resetForm()
    }

    // Refresh search results to include new client
    if (clientStore.searchResults.length > 0) {
      // Re-run the last search to show the new client
      await clientStore.searchClients(clientStore.searchQuery)
    }

    notifyInfo(
      `Client ${newClient.firstName} ${newClient.lastName} created successfully!`
    )

    // Navigate to client details page
    router.push({
      name: 'client-details',
      params: { clientId: newClient.clientId }
    })
  } catch (error) {
    notifyError(error.message || 'Failed to create client')
  }
}

function handleCancelCreate() {
  showCreateClientDialog.value = false
  if (clientFormRef.value) {
    clientFormRef.value.resetForm()
  }
}

// Case search methods
function handleViewCase(caseId) {
  // Navigate to case detail page (to be implemented in US4/later)
  notifyInfo('Case detail view coming soon')
  console.log('View case:', caseId)
}

function handleEditCase(caseId) {
  // Navigate to case edit page (admin only, US4)
  router.push({ name: 'CaseEdit', params: { caseId } })
}

onMounted(() => {
  // Component mounted - search bar is ready
  console.log('SearchPage mounted')
})
</script>

<style scoped>
.search-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  border-bottom: 2px solid var(--color-light-grey);
  padding-bottom: 1rem;
}

.search-results {
  margin-top: 2rem;
}

.results-header {
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
}

.case-list {
  display: flex;
  flex-direction: column;
}

.case-list-item {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-state,
.initial-state,
.error-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state,
.initial-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
