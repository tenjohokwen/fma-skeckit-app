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
          <h5 class="text-h5 text-weight-medium q-ma-none">{{ $t('dashboard.title') }}</h5>
          <p class="text-body2 text-grey-7 q-ma-none">{{ $t('dashboard.subtitle') }}</p>
        </div>
        <div class="col-auto">
          <q-btn
            flat
            icon="refresh"
            :label="$t('dashboard.refresh')"
            @click="handleRefresh"
            :loading="isLoading"
          />
          <q-toggle
            v-model="autoRefresh"
            :label="$t('dashboard.autoRefresh')"
            class="q-ml-md"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && !metrics" class="text-center q-mt-lg">
        <q-spinner-dots color="primary" size="50px" />
        <div class="text-body2 text-grey-7 q-mt-md">{{ $t('dashboard.loading') }}</div>
      </div>

      <!-- Dashboard Grid -->
      <div v-else-if="metrics" class="dashboard-grid">
        <!-- Row 1: Big Numbers -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-4">
            <ActiveCasesWidget :data="metrics.activeCases" />
          </div>

          <!-- Feature 016: Personal Metrics Card -->
          <div class="col-12 col-md-8">
            <q-card flat bordered class="personal-metrics-card">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-overline text-primary">{{ $t('dashboard.personalMetrics.yourWorkload') }}</div>
                    <div class="text-h5 text-weight-medium q-mt-sm">
                      {{ personalMetrics.myActiveCases }} <span class="text-grey-7">of</span> {{ personalMetrics.totalActiveCases }}
                      <q-badge color="primary" :label="`${personalMetrics.myPercentage}%`" class="q-ml-sm" />
                    </div>
                    <div class="text-body2 text-grey-7 q-mt-xs">
                      {{ $t('dashboard.personalMetrics.myCases') }}
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="person" size="48px" color="primary" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
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
          {{ $t('dashboard.lastUpdated') }}: {{ formatTimestamp(metrics.lastUpdated) }}
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="q-mt-lg">
        <q-banner dense rounded class="bg-negative text-white">
          <template #avatar>
            <q-icon name="error" />
          </template>
          {{ error.message || $t('dashboard.error') }}
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

import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
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

// Feature 016: Personal Metrics - Calculate user's personal workload from org-wide data
const personalMetrics = computed(() => {
  if (!metrics.value || !metrics.value.casesPerAttorney) {
    return {
      myActiveCases: 0,
      totalActiveCases: 0,
      myPercentage: 0
    }
  }

  const userEmail = authStore.user?.email
  if (!userEmail) {
    return {
      myActiveCases: 0,
      totalActiveCases: 0,
      myPercentage: 0
    }
  }

  // Find current user's entry in casesPerAttorney
  const userEntry = metrics.value.casesPerAttorney.find(
    attorney => attorney.attorney === userEmail
  )

  // Total active cases from organization-wide metrics
  const totalActiveCases = metrics.value.activeCases?.count || 0

  // User's assigned cases (0 if not in attorney list)
  const myActiveCases = userEntry?.count || 0

  // Calculate percentage (handle division by zero)
  const myPercentage = totalActiveCases > 0
    ? Math.round((myActiveCases / totalActiveCases) * 100)
    : 0

  return {
    myActiveCases,
    totalActiveCases,
    myPercentage
  }
})

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
