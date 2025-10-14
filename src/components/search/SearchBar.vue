<template>
  <div class="search-bar">
    <q-card flat bordered class="search-card">
      <q-card-section>
        <div class="text-h6 q-mb-md">{{ $t('search.title') }}</div>

        <!-- Search Type Tabs -->
        <q-tabs
          v-model="searchTab"
          dense
          class="text-grey q-mb-md"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
        >
          <q-tab name="name" :label="$t('search.byName')" />
          <q-tab name="caseId" :label="$t('search.byCaseId')" />
        </q-tabs>

        <q-separator class="q-mb-md" />

        <!-- Search by Name Tab -->
        <q-tab-panels v-model="searchTab" animated>
          <q-tab-panel name="name" class="q-pa-none">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="firstName"
                  :label="$t('search.firstName')"
                  outlined
                  dense
                  clearable
                  :disable="isSearching"
                  @update:model-value="onNameSearchChange"
                  @keyup.enter="handleSearch"
                >
                  <template #prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="lastName"
                  :label="$t('search.lastName')"
                  outlined
                  dense
                  clearable
                  :disable="isSearching"
                  @update:model-value="onNameSearchChange"
                  @keyup.enter="handleSearch"
                >
                  <template #prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>
              </div>
            </div>
          </q-tab-panel>

          <!-- Search by Case ID Tab -->
          <q-tab-panel name="caseId" class="q-pa-none">
            <q-input
              v-model="caseId"
              :label="$t('search.caseId')"
              outlined
              dense
              clearable
              :disable="isSearching"
              @update:model-value="onCaseIdSearchChange"
              @keyup.enter="handleSearch"
            >
              <template #prepend>
                <q-icon name="folder" />
              </template>
            </q-input>
          </q-tab-panel>
        </q-tab-panels>

        <!-- Search Actions -->
        <div class="row q-col-gutter-sm q-mt-md">
          <div class="col-12 col-sm-auto">
            <q-btn
              color="primary"
              :label="$t('search.searchButton')"
              icon="search"
              :loading="isSearching"
              :disable="!canSearch"
              @click="handleSearch"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn
              flat
              color="grey"
              :label="$t('search.clearButton')"
              icon="clear"
              :disable="isSearching"
              @click="handleClear"
            />
          </div>
        </div>

        <!-- Search Info -->
        <div v-if="hasSearched && !isSearching" class="q-mt-md">
          <q-banner
            v-if="searchError"
            dense
            rounded
            class="bg-negative text-white"
          >
            <template #avatar>
              <q-icon name="error" />
            </template>
            {{ searchError.message || $t('search.error.generic') }}
          </q-banner>

          <q-banner
            v-else-if="searchResults.length === 0"
            dense
            rounded
            class="bg-info text-white"
          >
            <template #avatar>
              <q-icon name="info" />
            </template>
            {{ $t('search.noResults') }}
          </q-banner>

          <div v-else class="text-caption text-grey-7">
            {{ $t('search.resultsCount', { count: searchResults.length }) }}
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
/**
 * SearchBar.vue
 *
 * Search component for finding cases by name or case ID.
 * Provides tabbed interface with debounced search and loading states.
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { ref, computed } from 'vue'
import { useSearch } from 'src/composables/useSearch'

const {
  searchResults,
  isSearching,
  searchError,
  searchByName,
  searchByCaseId,
  clearSearch
} = useSearch()

// Local state
const searchTab = ref('name')
const firstName = ref('')
const lastName = ref('')
const caseId = ref('')
const hasSearched = ref(false)

// Computed
const canSearch = computed(() => {
  if (searchTab.value === 'name') {
    return firstName.value.trim() || lastName.value.trim()
  } else {
    return caseId.value.trim()
  }
})

// Methods
function onNameSearchChange() {
  // Trigger debounced search automatically when typing
  if (firstName.value.trim() || lastName.value.trim()) {
    hasSearched.value = true
    searchByName(firstName.value, lastName.value, false)
  } else {
    clearSearch()
    hasSearched.value = false
  }
}

function onCaseIdSearchChange() {
  // Trigger debounced search automatically when typing
  if (caseId.value.trim()) {
    hasSearched.value = true
    searchByCaseId(caseId.value, false)
  } else {
    clearSearch()
    hasSearched.value = false
  }
}

function handleSearch() {
  hasSearched.value = true
  if (searchTab.value === 'name') {
    searchByName(firstName.value, lastName.value, true)
  } else {
    searchByCaseId(caseId.value, true)
  }
}

function handleClear() {
  firstName.value = ''
  lastName.value = ''
  caseId.value = ''
  hasSearched.value = false
  clearSearch()
}

// Expose results to parent via emit or provide
defineExpose({
  searchResults,
  isSearching,
  searchError
})
</script>

<style scoped>
.search-bar {
  margin-bottom: 1.5rem;
}

.search-card {
  border-radius: 8px;
}
</style>
