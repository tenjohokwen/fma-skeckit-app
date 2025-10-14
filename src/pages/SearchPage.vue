<template>
  <q-page padding>
    <div class="search-page">
      <!-- Page Header -->
      <div class="page-header q-mb-lg">
        <h1 class="text-h4 q-mb-xs">{{ $t('search.pageTitle') }}</h1>
        <p class="text-body2 text-grey-7">{{ $t('search.pageSubtitle') }}</p>
      </div>

      <!-- Search Bar -->
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
    </div>
  </q-page>
</template>

<script setup>
/**
 * SearchPage.vue
 *
 * Main page for searching and viewing case metadata (User Story 3).
 * Integrates SearchBar and displays results as CaseCard components.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SearchBar from 'src/components/search/SearchBar.vue'
import CaseCard from 'src/components/search/CaseCard.vue'
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue'
import ErrorDisplay from 'src/components/shared/ErrorDisplay.vue'
import { useNotifications } from 'src/composables/useNotifications'

const router = useRouter()
const { notifyInfo } = useNotifications()

// Refs
const searchBarRef = ref(null)

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

// Methods
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
