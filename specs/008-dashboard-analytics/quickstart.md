# Quickstart Guide: Dashboard Analytics Implementation

**Feature**: 008-dashboard-analytics
**Date**: 2025-10-18
**Target Audience**: Developers implementing this feature

## Overview

This quickstart guide provides step-by-step instructions for implementing the Dashboard Analytics feature. Follow these steps in order to successfully add analytics charts to the existing dashboard page.

**Estimated Time**: 6.5 days (spread across 5 phases)

---

## Prerequisites

### Required Knowledge
- Vue 3 Composition API (`<script setup>` syntax)
- Quasar 2 framework
- Google Apps Script
- JavaScript ES6+

### Required Access
- Write access to repository
- Access to Google Apps Script project
- Access to test Google Sheets (metadata, clients)

### Environment Setup
```bash
# Ensure you're on the correct branch
git checkout 008-dashboard-analytics

# Install dependencies (if not already installed)
npm install

# Verify Quasar dev server works
npm run dev
```

---

## Phase 1: Backend Setup (2 days)

### Step 1.1: Install Dependencies
No new backend dependencies needed (uses Google Apps Script built-ins).

### Step 1.2: Create DashboardService.gs

**File**: `gas/services/DashboardService.gs`

**Template**:
```javascript
/**
 * DashboardService.gs
 * Service for aggregating and calculating dashboard analytics metrics
 */

const DashboardService = {
  CACHE_TTL: 300, // 5 minutes

  /**
   * Gets all dashboard metrics (with caching)
   * @param {string} userEmail - Current user's email
   * @param {string} userRole - User's role (ROLE_ADMIN or ROLE_USER)
   * @returns {Object} Dashboard metrics
   */
  getAllMetrics: function(userEmail, userRole) {
    // TODO: Implement caching logic
    // TODO: Call _calculateMetrics
  },

  /**
   * Internal: Calculate fresh metrics
   * @private
   */
  _calculateMetrics: function(userEmail, userRole) {
    const cases = this._getFilteredCases(userEmail, userRole);

    return {
      activeCases: this.getActiveCasesMetric(cases),
      casesByStatus: this.getCasesByStatus(cases),
      casesByType: this.getCasesByType(cases),
      casesPerAttorney: this.getCasesPerAttorney(cases),
      resolutionTime: this.getResolutionMetrics(cases),
      lastUpdated: DateUtil.getCurrentTimestamp()
    };
  },

  /**
   * Filter cases by user role
   * @private
   */
  _getFilteredCases: function(userEmail, userRole) {
    const allCases = SheetsService.getAllCases();

    if (userRole === 'ROLE_ADMIN') {
      return allCases;
    }

    return allCases.filter(c => c.assignedTo === userEmail);
  },

  // TODO: Implement getActiveCasesMetric
  // TODO: Implement getCasesByStatus
  // TODO: Implement getCasesByType
  // TODO: Implement getCasesPerAttorney
  // TODO: Implement getResolutionMetrics
  // TODO: Implement _calculateTrend
  // TODO: Implement _getWorkloadLevel
};
```

**Reference**: See [spec.md](./spec.md) lines 792-993 for complete implementation

### Step 1.3: Add getAllCases() to SheetsService.gs

**File**: `gas/services/SheetsService.gs`

**Add Method**:
```javascript
/**
 * Gets all cases from metadata sheet (for dashboard analytics)
 * @returns {Array} Array of all case objects
 */
getAllCases: function() {
  const sheet = this.getMetadataSheet();
  const data = sheet.getDataRange().getValues();
  const cases = [];

  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0]) { // Only include rows with caseId
      cases.push(this.parseRow(row, i + 1, true));
    }
  }

  return cases;
}
```

**Location**: Add after `getCaseById()` method

### Step 1.4: Create DashboardHandler.gs

**File**: `gas/handlers/DashboardHandler.gs`

**Template**:
```javascript
/**
 * DashboardHandler.gs
 * Handler for dashboard analytics endpoints
 */

const DashboardHandler = {
  /**
   * Get all dashboard metrics
   * @param {Object} context - Request context (contains user info)
   * @returns {Object} Response with metrics
   */
  getMetrics: function(context) {
    try {
      const metrics = DashboardService.getAllMetrics(
        context.user.email,
        context.user.role
      );

      const newToken = TokenManager.generateToken(context.user.email);

      return ResponseHandler.successWithToken(
        'dashboard.metrics.success',
        'Dashboard metrics retrieved successfully',
        { metrics: metrics },
        context.user,
        newToken.value
      );

    } catch (error) {
      if (error.status) throw error;

      throw ResponseHandler.serverError(
        'Failed to fetch dashboard metrics: ' + error.toString(),
        'dashboard.metrics.error.server'
      );
    }
  }
};
```

### Step 1.5: Update Router.gs

**File**: `gas/utils/Router.gs`

**Add Route**:
```javascript
// In the routing logic, add:
case 'dashboard.getMetrics':
  return DashboardHandler.getMetrics(context);
```

**Location**: Add in the appropriate switch/if-else block where other routes are defined

### Step 1.6: Create Backend Tests

**File**: `gas/tests/test_feature_008.gs`

**Template**:
```javascript
/**
 * test_feature_008.gs
 * Tests for Dashboard Analytics feature
 */

function test_getAllMetrics_admin() {
  const testName = 'getAllMetrics - Admin sees all data';

  try {
    const metrics = DashboardService.getAllMetrics('admin@example.com', 'ROLE_ADMIN');

    assertEqual(typeof metrics.activeCases.count, 'number', 'activeCases.count should be a number');
    assertEqual(Array.isArray(metrics.casesByStatus), true, 'casesByStatus should be an array');
    // Add more assertions...

    TestResults.pass(testName);
  } catch (error) {
    TestResults.fail(testName, error.message);
  }
}

// TODO: Add more tests (see spec.md lines 1589-1613)

function runAllFeature008Tests() {
  TestResults.reset();

  const tests = [
    test_getAllMetrics_admin,
    test_getAllMetrics_user,
    test_caching_works,
    // Add more test functions...
  ];

  tests.forEach(test => test());

  return TestResults.summary();
}
```

### Step 1.7: Deploy & Test Backend

```bash
# Deploy to Google Apps Script
# (Use Google Apps Script editor or clasp tool)

# Run tests in Apps Script editor
# Execute: runAllFeature008Tests()

# Verify all tests pass before proceeding
```

---

## Phase 2: Frontend Setup (1 day)

### Step 2.1: Install ApexCharts

```bash
npm install apexcharts vue3-apexcharts
```

**Verify Installation**:
```bash
npm list apexcharts vue3-apexcharts
# Should show: apexcharts@3.x.x, vue3-apexcharts@1.x.x
```

### Step 2.2: Create useDashboard Composable

**File**: `src/composables/useDashboard.js`

**Template**:
```javascript
import { ref } from 'vue'
import { api } from 'src/services/api'

/**
 * Composable for dashboard analytics data fetching
 * @returns {Object} Dashboard state and methods
 */
export function useDashboard() {
  const metrics = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Fetch dashboard metrics from API
   */
  async function fetchMetrics() {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('dashboard.getMetrics', {})

      if (response.success) {
        metrics.value = response.data.metrics
      } else {
        throw new Error(response.message || 'Failed to fetch metrics')
      }
    } catch (err) {
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    metrics,
    isLoading,
    error,
    fetchMetrics
  }
}
```

### Step 2.3: Update DashboardPage.vue

**File**: `src/pages/DashboardPage.vue`

**Changes**:
1. Import necessary dependencies
2. Add analytics section below existing welcome section
3. Add auto-refresh logic

**Reference Template**: See [spec.md](./spec.md) lines 1081-1245

**Key Additions**:
```vue
<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import { useDashboard } from 'src/composables/useDashboard'
// Import chart components (will be created in Phase 3)

const authStore = useAuthStore()
const { metrics, isLoading, error, fetchMetrics } = useDashboard()
const autoRefresh = ref(false)
let refreshInterval = null

// TODO: Add handleRefresh function
// TODO: Add formatTimestamp function
// TODO: Add auto-refresh watch logic
// TODO: Add onMounted/onBeforeUnmount hooks
</script>
```

### Step 2.4: Test Basic Data Fetching

```bash
# Start dev server
npm run dev

# Navigate to dashboard page
# Open browser console

# Verify:
# 1. No console errors
# 2. API request to dashboard.getMetrics is made
# 3. Response contains metrics object
# 4. Loading state shows during fetch
```

---

## Phase 3: Chart Components (2 days)

### Step 3.1: Create ActiveCasesWidget.vue

**File**: `src/components/dashboard/ActiveCasesWidget.vue`

**Template**:
```vue
<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-overline text-grey-7">Total Active Cases</div>

      <div class="row items-center q-mt-md">
        <div class="col">
          <div class="text-h2 text-weight-bold">
            {{ data.count }}
          </div>
        </div>
        <div class="col-auto">
          <q-icon
            :name="trendIcon"
            :color="trendColor"
            size="48px"
          />
        </div>
      </div>

      <div class="row items-center q-mt-sm">
        <div :class="`text-${trendColor}`">
          {{ data.trend.percentage }}%
        </div>
        <div class="text-grey-7 q-ml-sm">
          vs. last month
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const trendIcon = computed(() => {
  if (props.data.trend.direction === 'up') return 'trending_up'
  if (props.data.trend.direction === 'down') return 'trending_down'
  return 'trending_flat'
})

const trendColor = computed(() => {
  if (props.data.trend.direction === 'up') return 'negative'
  if (props.data.trend.direction === 'down') return 'positive'
  return 'grey'
})
</script>
```

**Reference**: See [spec.md](./spec.md) lines 1287-1345

### Step 3.2: Create CasesByStatusChart.vue

**File**: `src/components/dashboard/CasesByStatusChart.vue`

**Template** (using ApexCharts):
```vue
<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-overline text-grey-7">Cases by Status</div>
      <apexchart
        type="donut"
        height="350"
        :options="chartOptions"
        :series="series"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const chartOptions = computed(() => ({
  chart: {
    type: 'donut',
    toolbar: { show: false }
  },
  colors: ['#2196F3', '#FF9800', '#9C27B0', '#4CAF50'],
  labels: props.data.map(d => d.status),
  legend: {
    position: 'bottom'
  },
  responsive: [{
    breakpoint: 768,
    options: {
      chart: {
        height: 300
      }
    }
  }]
}))

const series = computed(() => props.data.map(d => d.count))
</script>
```

### Step 3.3: Create Remaining Chart Components

**Files to Create**:
1. `src/components/dashboard/CasesByTypeChart.vue` - Horizontal bar chart
2. `src/components/dashboard/CasesPerAttorneyChart.vue` - Vertical bar chart with workload colors
3. `src/components/dashboard/ResolutionTimeChart.vue` - Box plot or bar chart

**Reference**: See [spec.md](./spec.md) lines 1268-1345 for component patterns

**Tips**:
- Use `computed` for chart options and series
- Use ApexCharts responsive configuration
- Wrap charts in q-card for consistency
- Add loading/empty states

### Step 3.4: Integrate Charts into DashboardPage.vue

**File**: `src/pages/DashboardPage.vue`

**Add Imports**:
```vue
<script setup>
import ActiveCasesWidget from 'src/components/dashboard/ActiveCasesWidget.vue'
import CasesByStatusChart from 'src/components/dashboard/CasesByStatusChart.vue'
import CasesByTypeChart from 'src/components/dashboard/CasesByTypeChart.vue'
import CasesPerAttorneyChart from 'src/components/dashboard/CasesPerAttorneyChart.vue'
import ResolutionTimeChart from 'src/components/dashboard/ResolutionTimeChart.vue'
</script>
```

**Add to Template** (inside analytics section):
```vue
<div v-if="metrics" class="dashboard-grid">
  <!-- Row 1 -->
  <div class="row q-col-gutter-md q-mb-md">
    <div class="col-12 col-md-4">
      <ActiveCasesWidget :data="metrics.activeCases" />
    </div>
  </div>

  <!-- Row 2 -->
  <div class="row q-col-gutter-md q-mb-md">
    <div class="col-12 col-md-6">
      <CasesByStatusChart :data="metrics.casesByStatus" />
    </div>
    <div class="col-12 col-md-6">
      <CasesByTypeChart :data="metrics.casesByType" />
    </div>
  </div>

  <!-- Row 3 -->
  <div class="row q-col-gutter-md">
    <div class="col-12 col-md-6">
      <CasesPerAttorneyChart :data="metrics.casesPerAttorney" />
    </div>
    <div class="col-12 col-md-6">
      <ResolutionTimeChart :data="metrics.resolutionTime" />
    </div>
  </div>
</div>
```

---

## Phase 4: Polish & Testing (1 day)

### Step 4.1: Implement Auto-Refresh

**File**: `src/pages/DashboardPage.vue`

**Add Watch Logic**:
```vue
<script setup>
// ... existing code ...

watch(() => autoRefresh.value, (enabled) => {
  if (enabled) {
    refreshInterval = setInterval(() => {
      fetchMetrics()
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
```

### Step 4.2: Add Error Handling

**Verify Error States**:
1. Network error → Shows error banner
2. Empty data → Shows empty state gracefully (zeros, not errors)
3. Invalid token → Redirects to login

### Step 4.3: Test Responsive Design

**Checklist**:
- [ ] Desktop (> 1024px): 2-column layout works
- [ ] Tablet (768-1024px): Charts adjust properly
- [ ] Mobile (< 768px): Single column, charts stack vertically
- [ ] Charts are touch-friendly on mobile

**Test Browsers**:
- Chrome (desktop & mobile)
- Safari (desktop & mobile)
- Firefox (desktop)

### Step 4.4: Test Role-Based Views

**Test Scenarios**:
1. Login as admin → See all cases in metrics
2. Login as regular user → See only assigned cases
3. Verify attorney workload chart shows correct attorneys

### Step 4.5: Verify Welcome Section Still Works

**Checklist**:
- [ ] Welcome message displays
- [ ] User email displays correctly
- [ ] User role displays correctly
- [ ] Dashboard icon shows
- [ ] Analytics section appears below welcome section

---

## Phase 5: Documentation & Deployment (0.5 days)

### Step 5.1: Add i18n Messages

**File**: `src/i18n/en-US.js`

**Add Messages**:
```javascript
export default {
  // ... existing messages ...

  dashboard: {
    welcome: 'Welcome to the Dashboard',
    successLogin: 'You have successfully logged in',
    user: 'User',
    role: 'Role',
    refresh: 'Refresh',
    autoRefresh: 'Auto-refresh (5 min)',
    loading: 'Loading analytics...',
    lastUpdated: 'Last updated',
    error: 'Failed to load analytics',

    metrics: {
      success: 'Dashboard metrics retrieved successfully',
      error: {
        server: 'Failed to fetch dashboard metrics'
      }
    },

    charts: {
      activeCases: 'Total Active Cases',
      casesByStatus: 'Cases by Status',
      casesByType: 'Cases by Practice Area',
      casesPerAttorney: 'Active Cases per Attorney',
      resolutionTime: 'Case Resolution Time'
    }
  }
}
```

**File**: `src/i18n/fr-FR/index.js`

**Add French Translations**:
```javascript
export default {
  // ... existing messages ...

  dashboard: {
    welcome: 'Bienvenue sur le tableau de bord',
    successLogin: 'Vous vous êtes connecté avec succès',
    user: 'Utilisateur',
    role: 'Rôle',
    refresh: 'Actualiser',
    autoRefresh: 'Actualisation automatique (5 min)',
    loading: 'Chargement des analyses...',
    lastUpdated: 'Dernière mise à jour',
    error: 'Échec du chargement des analyses',

    metrics: {
      success: 'Métriques du tableau de bord récupérées avec succès',
      error: {
        server: 'Échec de la récupération des métriques du tableau de bord'
      }
    },

    charts: {
      activeCases: 'Total des cas actifs',
      casesByStatus: 'Cas par statut',
      casesByType: 'Cas par domaine de pratique',
      casesPerAttorney: 'Cas actifs par avocat',
      resolutionTime: 'Temps de résolution des cas'
    }
  }
}
```

### Step 5.2: Write Frontend Tests

**Files to Create**:
- `tests/components/dashboard/ActiveCasesWidget.spec.js`
- `tests/components/dashboard/CasesByStatusChart.spec.js`
- `tests/composables/useDashboard.spec.js`

**Example Test** (`tests/components/dashboard/ActiveCasesWidget.spec.js`):
```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ActiveCasesWidget from 'src/components/dashboard/ActiveCasesWidget.vue'

describe('ActiveCasesWidget', () => {
  it('displays active case count', () => {
    const wrapper = mount(ActiveCasesWidget, {
      props: {
        data: {
          count: 142,
          trend: {
            direction: 'up',
            percentage: 12,
            change: 15
          }
        }
      }
    })

    expect(wrapper.text()).toContain('142')
  })

  it('shows up trend icon for increasing cases', () => {
    const wrapper = mount(ActiveCasesWidget, {
      props: {
        data: {
          count: 142,
          trend: {
            direction: 'up',
            percentage: 12,
            change: 15
          }
        }
      }
    })

    const icon = wrapper.find('.q-icon')
    expect(icon.attributes('name')).toBe('trending_up')
  })

  // Add more tests...
})
```

### Step 5.3: Run All Tests

```bash
# Run frontend tests
npm run test

# Verify all tests pass

# Run backend tests (in Apps Script editor)
# Execute: runAllFeature008Tests()
```

### Step 5.4: Update CLAUDE.md

**Run Agent Context Script**:
```bash
.specify/scripts/bash/update-agent-context.sh claude
```

**Verify**:
- ApexCharts added to active technologies
- Feature 008 added to recent changes

### Step 5.5: Deploy to Production

**Backend Deployment**:
1. Open Google Apps Script editor
2. Deploy → New Deployment
3. Type: Web app
4. Execute as: Me
5. Who has access: Anyone with link
6. Deploy
7. Copy deployment URL

**Frontend Deployment**:
```bash
# Build production bundle
npm run build

# Deploy to hosting (depends on hosting provider)
# Update API_BASE_URL with new deployment URL
```

### Step 5.6: Smoke Test Production

**Checklist**:
- [ ] Dashboard loads without errors
- [ ] All charts render correctly
- [ ] Data is accurate (compare to manual sheet counts)
- [ ] Auto-refresh works
- [ ] Manual refresh works
- [ ] Role-based filtering works
- [ ] i18n works (test English & French)
- [ ] Mobile responsive

---

## Common Issues & Troubleshooting

### Issue 1: Charts Not Rendering

**Symptoms**: Blank space where chart should be

**Solutions**:
1. Check browser console for ApexCharts errors
2. Verify data prop is passed correctly to chart component
3. Verify ApexCharts is imported: `import VueApexCharts from 'vue3-apexcharts'`
4. Check if data array is empty (should show empty state, not error)

### Issue 2: API Returning Empty Metrics

**Symptoms**: All counts are 0, arrays are empty

**Solutions**:
1. Check if metadata sheet has data
2. Verify `SheetsService.getAllCases()` is implemented correctly
3. Check Google Apps Script logs for errors
4. Test with Logger.log() in DashboardService

### Issue 3: Auto-Refresh Not Working

**Symptoms**: Toggle switch works but dashboard doesn't update

**Solutions**:
1. Check if `fetchMetrics()` is called in interval
2. Verify interval is cleared in `onBeforeUnmount`
3. Check browser console for network errors
4. Verify 5-minute interval (300000ms) is correct

### Issue 4: Role-Based Filtering Not Working

**Symptoms**: User sees all cases instead of just theirs

**Solutions**:
1. Verify `user.role` is passed correctly to backend
2. Check if `_getFilteredCases()` is implemented correctly
3. Test with Logger.log() to verify filtering logic
4. Verify token contains correct role

### Issue 5: Cache Not Working

**Symptoms**: Every request hits backend, slow performance

**Solutions**:
1. Verify CacheService is used correctly
2. Check if cache key is unique per user
3. Verify TTL is set to 300 seconds
4. Test cache with Logger.log() for hits/misses

---

## Performance Benchmarks

**Target Metrics**:
- Dashboard load: < 3 seconds
- API response: < 2 seconds (with cache)
- Chart rendering: < 500ms per chart

**How to Measure**:
```javascript
// In DashboardPage.vue
const start = performance.now()
await fetchMetrics()
const end = performance.now()
console.log(`Dashboard load time: ${end - start}ms`)
```

**Optimization Tips**:
- Enable caching (5-minute TTL)
- Use production build (not dev mode)
- Limit data points (top 10 + "Other")
- Use ApexCharts responsive configuration

---

## Next Steps

After completing this quickstart:

1. **Monitor Performance**: Track dashboard load times in production
2. **Gather Feedback**: Ask users about chart usefulness
3. **Plan Enhancements**: Consider drill-down, filters, PDF export
4. **Update Documentation**: Keep quickstart updated with lessons learned

---

## Resources

- [Feature Spec](./spec.md) - Complete technical specification
- [Data Model](./data-model.md) - Data structures and transformations
- [API Contract](./contracts/dashboard-api.json) - OpenAPI specification
- [Research Report](./research.md) - Technology decisions and alternatives
- [ApexCharts Docs](https://apexcharts.com/docs/) - Chart library documentation
- [Quasar Components](https://quasar.dev/vue-components) - Quasar component reference

---

**Last Updated**: 2025-10-18
**Version**: 1.0
