<template>
  <q-page class="q-pa-md">
    <!-- Existing Welcome Section (preserved) -->
    <div class="text-center q-mb-xl">
      <q-icon name="dashboard" size="80px" color="primary" class="q-mb-md" />
      <h4 class="text-h4 text-weight-bold q-mb-sm">
        {{ $t('dashboard.welcome') }}
      </h4>
      <p class="text-body1 text-grey-7 q-mb-md">
        {{ $t('dashboard.successLogin') }}
      </p>
      <p class="text-body2 text-grey-6">
        {{ $t('dashboard.user') }}: <strong>{{ authStore.user?.email }}</strong>
      </p>
      <p class="text-body2 text-grey-6">
        {{ $t('dashboard.role') }}: <strong>{{ authStore.user?.role }}</strong>
      </p>
    </div>

    <!-- NEW: Analytics Section -->
    <div class="dashboard-analytics">
      <!-- Section Header -->
      <div class="row items-center q-mb-md">
        <div class="col">
          <h5 class="text-h5 text-weight-medium q-ma-none">Business Insights</h5>
          <p class="text-body2 text-grey-7 q-ma-none">Real-time analytics from your cases</p>
        </div>
        <div class="col-auto">
          <q-btn
            flat
            icon="refresh"
            label="Refresh"
            @click="handleRefresh"
            :loading="isLoading"
          />
          <q-toggle
            v-model="autoRefresh"
            label="Auto-refresh"
            class="q-ml-md"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && !metrics" class="text-center q-mt-lg">
        <q-spinner-dots color="primary" size="50px" />
        <div class="text-body2 text-grey-7 q-mt-md">Loading analytics...</div>
      </div>

      <!-- Dashboard Grid -->
      <div v-else-if="metrics" class="dashboard-grid">
        <!-- Row 1: Big Numbers -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-4">
            <ActiveCasesWidget :data="metrics.activeCases" />
          </div>
        </div>

        <!-- Row 2: Status & Type Charts -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-6">
            <CasesByStatusChart :data="metrics.casesByStatus" />
          </div>
          <div class="col-12 col-md-6">
            <CasesByTypeChart :data="metrics.casesByType" />
          </div>
        </div>

        <!-- Row 3: Attorney & Resolution Charts -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-6">
            <CasesPerAttorneyChart :data="metrics.casesPerAttorney" />
          </div>
          <div class="col-12 col-md-6">
            <ResolutionTimeChart :data="metrics.resolutionTime" />
          </div>
        </div>

        <!-- Last Updated -->
        <div class="text-caption text-grey-7 q-mt-md text-center">
          Last updated: {{ formatTimestamp(metrics.lastUpdated) }}
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="q-mt-lg">
        <q-banner dense rounded class="bg-negative text-white">
          <template #avatar>
            <q-icon name="error" />
          </template>
          {{ error.message || 'Failed to load analytics' }}
        </q-banner>
      </div>
    </div>
  </q-page>
</template>

<script setup>
/**
 * DashboardPage.vue
 *
 * Dashboard page with analytics charts
 * Feature 008: Dashboard Analytics
 *
 * Per constitution: Vue 3 Composition API with <script setup>
 */

import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import { useDashboard } from 'src/composables/useDashboard'
import ActiveCasesWidget from 'src/components/dashboard/ActiveCasesWidget.vue'
import CasesByStatusChart from 'src/components/dashboard/CasesByStatusChart.vue'
import CasesByTypeChart from 'src/components/dashboard/CasesByTypeChart.vue'
import CasesPerAttorneyChart from 'src/components/dashboard/CasesPerAttorneyChart.vue'
import ResolutionTimeChart from 'src/components/dashboard/ResolutionTimeChart.vue'

const authStore = useAuthStore()
const { metrics, isLoading, error, fetchMetrics } = useDashboard()

const autoRefresh = ref(false)
let refreshInterval = null

async function handleRefresh() {
  try {
    await fetchMetrics()
  } catch (err) {
    // Error is already captured in composable
    console.error('Failed to refresh dashboard:', err)
  }
}

function formatTimestamp(timestamp) {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString()
}

// Auto-refresh logic
watch(() => autoRefresh.value, (enabled) => {
  if (enabled) {
    refreshInterval = setInterval(() => {
      handleRefresh()
    }, 5 * 60 * 1000) // 5 minutes
  } else {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  }
})

onMounted(() => {
  fetchMetrics()
})

onBeforeUnmount(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.dashboard-analytics {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
