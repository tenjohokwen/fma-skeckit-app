# Implementation Tasks: Dashboard Analytics & Charts

**Feature**: 008-dashboard-analytics
**Branch**: `008-dashboard-analytics`
**Date**: 2025-10-18
**Estimated Duration**: 6.5 days

---

## Task Overview

**Total Tasks**: 32
**Parallel Opportunities**: 15 tasks can run in parallel
**Test Tasks**: 6 (backend tests)
**User Stories**: 6 stories organized by priority

**Organization**:
- Phase 1: Setup (4 tasks) - Project initialization
- Phase 2: Foundational (3 tasks) - Backend infrastructure needed by ALL stories
- Phase 3-8: User Stories (20 tasks) - One phase per story, independently implementable
- Phase 9: Polish (5 tasks) - Cross-cutting concerns

---

## Phase 1: Setup & Dependencies

**Goal**: Install dependencies and prepare project structure

### T001: Install ApexCharts Dependencies [P]
**File**: `package.json`
**Description**: Install ApexCharts and vue3-apexcharts for chart visualization
**Commands**:
```bash
npm install apexcharts vue3-apexcharts
```
**Validation**:
- `package.json` contains `"apexcharts": "^3.44.0"`
- `package.json` contains `"vue3-apexcharts": "^1.5.0"`
- Dependencies install without errors

**Status**: [X]

---

### T002: Create Dashboard Component Directory [P]
**File**: `src/components/dashboard/` (directory)
**Description**: Create directory structure for dashboard chart components
**Commands**:
```bash
mkdir -p src/components/dashboard
```
**Validation**: Directory `src/components/dashboard/` exists

**Status**: [X]

---

### T003: Create Backend Test File Structure [P]
**File**: `gas/tests/test_feature_008.gs`
**Description**: Create test file structure with test utilities
**Content**:
```javascript
/**
 * test_feature_008.gs
 * Tests for Dashboard Analytics Feature
 */

// Test results tracker
const TestResults = {
  _results: [],

  reset: function() {
    this._results = [];
  },

  pass: function(testName) {
    this._results.push({ name: testName, status: 'PASS' });
    Logger.log(`✅ PASS: ${testName}`);
  },

  fail: function(testName, reason) {
    this._results.push({ name: testName, status: 'FAIL', reason: reason });
    Logger.log(`❌ FAIL: ${testName} - ${reason}`);
  },

  summary: function() {
    const passed = this._results.filter(r => r.status === 'PASS').length;
    const failed = this._results.filter(r => r.status === 'FAIL').length;

    Logger.log(`\n=== Test Summary ===`);
    Logger.log(`Total: ${this._results.length}`);
    Logger.log(`Passed: ${passed}`);
    Logger.log(`Failed: ${failed}`);

    if (failed > 0) {
      Logger.log(`\nFailed Tests:`);
      this._results.filter(r => r.status === 'FAIL').forEach(r => {
        Logger.log(`  - ${r.name}: ${r.reason}`);
      });
    }

    return this._results;
  }
};

// Test helper functions
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Placeholder for test functions (will be added in later tasks)
function runAllFeature008Tests() {
  TestResults.reset();
  Logger.log('=== Running Feature 008 Tests ===\n');

  // Tests will be added as tasks are implemented

  return TestResults.summary();
}
```
**Validation**: File exists and contains test utilities

**Status**: [X]

---

### T004: Create Composables Directory (if needed) [P]
**File**: `src/composables/` (verify exists)
**Description**: Ensure composables directory exists for useDashboard.js
**Commands**:
```bash
mkdir -p src/composables
```
**Validation**: Directory `src/composables/` exists

**Status**: [X]

---

## Phase 2: Foundational Tasks (Backend Infrastructure)

**Goal**: Create backend services and infrastructure needed by ALL user stories
**Note**: These tasks MUST complete before any user story can be implemented

### T005: Add getAllCases() Method to SheetsService
**File**: `gas/services/SheetsService.gs`
**Description**: Add method to fetch all cases for dashboard analytics
**Location**: After `getCaseById()` method
**Code to Add**:
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
  },
```
**Validation**:
- Method exists in SheetsService
- Returns array of case objects
- Works with empty sheet (returns empty array)

**Status**: [X]

---

### T006: Create DashboardService.gs
**File**: `gas/services/DashboardService.gs`
**Description**: Create analytics aggregation service with caching
**Reference**: See spec.md lines 792-993, data-model.md
**Content**: Complete DashboardService with all metric calculation methods
**Key Methods**:
- `getAllMetrics(userEmail, userRole)` - Main entry point with caching
- `_calculateMetrics()` - Calculate fresh metrics
- `_getFilteredCases()` - Role-based filtering
- `getActiveCasesMetric()` - Active cases with trend
- `getCasesByStatus()` - Status distribution
- `getCasesByType()` - Type distribution (top 10 + Other)
- `getCasesPerAttorney()` - Attorney workload with levels
- `getResolutionMetrics()` - Resolution time statistics
- `_calculateTrend()` - Trend calculation helper
- `_getWorkloadLevel()` - Workload level mapper

**Validation**:
- File exists with all methods
- Caching logic implemented (5-minute TTL)
- Role-based filtering works correctly

**Status**: [X]

---

### T007: Create DashboardHandler.gs and Add Route
**Files**:
- `gas/handlers/DashboardHandler.gs` (new)
- `gas/utils/Router.gs` (modify)

**Description**: Create handler for dashboard endpoint and register route

**DashboardHandler.gs Content**:
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

**Router.gs Modification**: Add to routing logic:
```javascript
case 'dashboard.getMetrics':
  return DashboardHandler.getMetrics(context);
```

**Validation**:
- DashboardHandler.gs exists with getMetrics method
- Route registered in Router.gs
- API call to dashboard.getMetrics works

**Status**: [X]

---

## Phase 3: US-001 - View Active Cases Count (P0 - Must Have)

**User Story**: As a law firm administrator, I want to see the total number of active cases with a trend indicator, so that I can understand current workload at a glance.

**Acceptance Criteria**:
- Display shows total count of cases where status ≠ 'Closed'
- Trend arrow shows increase/decrease from previous period
- Percentage change displayed
- Updates in real-time when refreshed

**Independent Test Criteria**: Can fetch active cases count with trend and display it in a widget

---

### T008: Test - Active Cases Metric Calculation [Story: US-001]
**File**: `gas/tests/test_feature_008.gs`
**Description**: Add test for getActiveCasesMetric() calculation
**Test Function**:
```javascript
function test_getActiveCasesMetric() {
  const testName = 'getActiveCasesMetric - Correct calculation';

  try {
    // Setup test data
    const mockCases = [
      { caseId: '1', status: 'Open', createdAt: new Date().toISOString() },
      { caseId: '2', status: 'Closed', createdAt: new Date().toISOString() },
      { caseId: '3', status: 'Pending', createdAt: new Date().toISOString() }
    ];

    const result = DashboardService.getActiveCasesMetric(mockCases);

    assertEqual(result.count, 2, 'Should count only non-closed cases');
    assertTrue(['up', 'down', 'neutral'].includes(result.trend.direction), 'Trend direction should be valid');
    assertEqual(typeof result.trend.percentage, 'number', 'Percentage should be a number');

    TestResults.pass(testName);
  } catch (error) {
    TestResults.fail(testName, error.message);
  }
}
```

**Update runAllFeature008Tests()**: Add `test_getActiveCasesMetric` to test array

**Validation**: Test passes when executed

**Status**: [ ]

---

### T009: Create useDashboard Composable [Story: US-001]
**File**: `src/composables/useDashboard.js`
**Description**: Create composable for dashboard data fetching
**Reference**: See spec.md lines 1228-1264
**Content**:
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

**Validation**:
- File exists and exports useDashboard
- Can fetch metrics via API
- Loading and error states work correctly

**Status**: [X]

---

### T010: Create ActiveCasesWidget Component [Story: US-001]
**File**: `src/components/dashboard/ActiveCasesWidget.vue`
**Description**: Create widget to display active cases count with trend
**Reference**: See spec.md lines 1287-1345
**Content**: Complete widget component with trend icon logic
**Validation**:
- Component renders with mock data
- Shows count, trend icon, and percentage
- Uses Quasar components (q-card, q-icon)
- Responsive design works

**Status**: [X]

---

### T011: Update DashboardPage with Analytics Section [Story: US-001]
**File**: `src/pages/DashboardPage.vue`
**Description**: Add analytics section with ActiveCasesWidget
**Changes**:
1. Import useDashboard composable
2. Import ActiveCasesWidget component
3. Add analytics section after existing welcome section
4. Add refresh button and auto-refresh toggle
5. Add loading/error states
6. Implement auto-refresh logic

**Reference**: See spec.md lines 1081-1245
**Validation**:
- Analytics section appears below welcome section
- Active cases widget displays correctly
- Refresh button works
- Auto-refresh toggle works (5-minute interval)
- Loading spinner shows during fetch

**Status**: [X]

---

## Phase 4: US-002 - View Cases by Status Distribution (P0 - Must Have)

**User Story**: As a law firm administrator, I want to see a visual breakdown of cases by status, so that I can identify bottlenecks.

**Acceptance Criteria**:
- Chart shows count for each status
- Visual format is stacked bar or pie chart
- Each status has distinct color

**Independent Test Criteria**: Can fetch status distribution and display it in a chart

---

### T012: Test - Cases by Status Calculation [Story: US-002]
**File**: `gas/tests/test_feature_008.gs`
**Description**: Add test for getCasesByStatus() calculation
**Test Function**: Similar to T008, validates status grouping and percentage calculation
**Validation**: Test passes

**Status**: [ ]

---

### T013: Create CasesByStatusChart Component [Story: US-002] [P]
**File**: `src/components/dashboard/CasesByStatusChart.vue`
**Description**: Create donut chart component for status distribution
**Chart Type**: ApexCharts donut chart
**Colors**: Blue (#2196F3), Orange (#FF9800), Purple (#9C27B0), Green (#4CAF50)
**Validation**:
- Chart renders with mock data
- Colors match constitution design system
- Responsive configuration works
- Legend displays at bottom

**Status**: [X]

---

### T014: Integrate CasesByStatusChart into DashboardPage [Story: US-002]
**File**: `src/pages/DashboardPage.vue`
**Description**: Add CasesByStatusChart to dashboard grid
**Location**: Row 2, left column (col-12 col-md-6)
**Validation**:
- Chart displays in correct position
- Data passes correctly from metrics
- Chart updates on refresh

**Status**: [X]

---

## Phase 5: US-003 - View Cases by Case Type (P0 - Must Have)

**User Story**: As a law firm administrator, I want to see case distribution by practice area, so that I can understand our firm's strengths.

**Acceptance Criteria**:
- Horizontal bar chart showing case count per type
- Sorted by count (highest to lowest)
- Shows only types with > 0 cases
- Hover shows percentage

**Independent Test Criteria**: Can fetch type distribution and display it in a horizontal bar chart

---

### T015: Test - Cases by Type Calculation [Story: US-003]
**File**: `gas/tests/test_feature_008.gs`
**Description**: Add test for getCasesByType() - validates top 10 + "Other" logic
**Validation**: Test passes, verifies sorting and "Other" category

**Status**: [ ]

---

### T016: Create CasesByTypeChart Component [Story: US-003] [P]
**File**: `src/components/dashboard/CasesByTypeChart.vue`
**Description**: Create horizontal bar chart for case types
**Chart Type**: ApexCharts horizontal bar chart
**Validation**:
- Chart renders horizontally
- Sorted by count descending
- Tooltips show percentage
- Max 11 entries (top 10 + Other)

**Status**: [X]

---

### T017: Integrate CasesByTypeChart into DashboardPage [Story: US-003]
**File**: `src/pages/DashboardPage.vue`
**Description**: Add CasesByTypeChart to dashboard grid
**Location**: Row 2, right column (col-12 col-md-6)
**Validation**: Chart displays correctly alongside status chart

**Status**: [X]

---

## Phase 6: US-004 - View Cases per Attorney (P0 - Must Have)

**User Story**: As a law firm administrator, I want to see active case distribution across attorneys, so that I can balance workloads.

**Acceptance Criteria**:
- Bar chart showing active case count per attorney
- Only shows attorneys with assigned cases
- Includes "Unassigned" category
- Color-coded to show workload levels

**Independent Test Criteria**: Can fetch attorney workload and display it with color-coded levels

---

### T018: Test - Cases per Attorney Calculation [Story: US-004]
**File**: `gas/tests/test_feature_008.gs`
**Description**: Add test for getCasesPerAttorney() - validates workload level assignment
**Validation**: Test passes, verifies levels (low/medium/high/overloaded)

**Status**: [ ]

---

### T019: Create CasesPerAttorneyChart Component [Story: US-004] [P]
**File**: `src/components/dashboard/CasesPerAttorneyChart.vue`
**Description**: Create vertical bar chart with workload color coding
**Chart Type**: ApexCharts bar chart (vertical)
**Colors**:
- Green: 0-10 cases (low)
- Yellow: 11-20 (medium)
- Orange: 21-30 (high)
- Red: 31+ (overloaded)

**Validation**:
- Color coding works correctly based on count
- Chart shows horizontal line at ideal workload (20 cases)
- Sorted by count descending

**Status**: [X]

---

### T020: Integrate CasesPerAttorneyChart into DashboardPage [Story: US-004]
**File**: `src/pages/DashboardPage.vue`
**Description**: Add CasesPerAttorneyChart to dashboard grid
**Location**: Row 3, left column (col-12 col-md-6)
**Validation**: Chart displays with correct workload colors

**Status**: [X]

---

## Phase 7: US-005 - View Case Resolution Time Metrics (P1 - Should Have)

**User Story**: As a law firm administrator, I want to see average and median case resolution times, so that I can measure efficiency.

**Acceptance Criteria**:
- Shows average days to close for closed cases
- Shows median resolution time
- Box plot or bar chart visualization

**Independent Test Criteria**: Can calculate resolution metrics and display them in a chart

---

### T021: Test - Resolution Metrics Calculation [Story: US-005]
**File**: `gas/tests/test_feature_008.gs`
**Description**: Add test for getResolutionMetrics() - validates statistical calculations
**Validation**: Test passes, verifies average, median, percentiles

**Status**: [ ]

---

### T022: Create ResolutionTimeChart Component [Story: US-005] [P]
**File**: `src/components/dashboard/ResolutionTimeChart.vue`
**Description**: Create chart component for resolution time metrics
**Chart Type**: ApexCharts bar chart showing average, median, percentiles
**Validation**:
- Chart displays all metrics (avg, median, min, max, percentiles)
- Empty state handled gracefully (0 closed cases)
- Tooltips show day counts

**Status**: [X]

---

### T023: Integrate ResolutionTimeChart into DashboardPage [Story: US-005]
**File**: `src/pages/DashboardPage.vue`
**Description**: Add ResolutionTimeChart to dashboard grid
**Location**: Row 3, right column (col-12 col-md-6)
**Validation**: Chart displays correctly alongside attorney chart

**Status**: [X]

---

## Phase 8: US-006 - View Dashboard as Attorney (P0 - Must Have)

**User Story**: As an attorney, I want to see dashboard metrics filtered to my assigned cases, so that I can track my personal performance.

**Acceptance Criteria**:
- Non-admin users see filtered data (only their cases)
- Metrics adjust to show "My Active Cases," "My Resolution Time," etc.
- Cannot see other attorneys' data

**Independent Test Criteria**: Backend correctly filters data by user role

---

### T024: Test - Role-Based Filtering [Story: US-006]
**File**: `gas/tests/test_feature_008.gs`
**Description**: Add tests for role-based data filtering
**Test Functions**:
- `test_getAllMetrics_adminSeesAll()` - Admin sees all cases
- `test_getAllMetrics_userSeesOnlyTheirs()` - User sees filtered cases

**Validation**: Both tests pass

**Status**: [ ]

---

### T025: Test Role-Based Views Manually [Story: US-006]
**Description**: Manual testing of role-based filtering
**Steps**:
1. Login as admin user
2. Verify all metrics show all cases
3. Verify "Cases per Attorney" shows all attorneys
4. Login as regular user (attorney)
5. Verify metrics show only their assigned cases
6. Verify they don't see other attorneys in charts

**Validation**: Role-based filtering works correctly for both admin and user

**Status**: [ ]

---

## Phase 9: Polish & Cross-Cutting Concerns

**Goal**: Add internationalization, final testing, and deployment preparation

### T026: Add English i18n Messages [P]
**File**: `src/i18n/en-US.js`
**Description**: Add dashboard-related i18n keys
**Keys to Add**:
```javascript
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
```

**Validation**: i18n keys work in English

**Status**: [X]

---

### T027: Add French i18n Messages [P]
**File**: `src/i18n/fr-FR/index.js`
**Description**: Add French translations for dashboard
**Keys to Add**: French equivalents of English keys from T026
**Validation**: Language switcher shows French translations correctly

**Status**: [X]

---

### T028: Test Caching Performance
**File**: `gas/services/DashboardService.gs` (manual test)
**Description**: Verify 5-minute caching works correctly
**Steps**:
1. Call dashboard.getMetrics (first call - cache miss)
2. Log response time
3. Call dashboard.getMetrics again within 5 minutes (cache hit)
4. Log response time (should be faster)
5. Wait 5+ minutes
6. Call again (cache expired, fresh calculation)

**Expected**: Cache hits are significantly faster than cache misses

**Validation**: Caching reduces response time by >50%

**Status**: [ ]

---

### T029: Test Responsive Design
**File**: `src/pages/DashboardPage.vue` (manual test)
**Description**: Verify dashboard is responsive across devices
**Test Scenarios**:
- Desktop (> 1024px): 2-column layout, charts side-by-side
- Tablet (768-1024px): 2-column, adjusted spacing
- Mobile (< 768px): Single column, charts stack vertically

**Browsers to Test**: Chrome, Safari, Firefox

**Validation**:
- All charts render correctly on mobile
- Touch-friendly controls
- No horizontal scroll

**Status**: [ ]

---

### T030: Test Empty Data Scenarios [P]
**Description**: Verify dashboard handles empty datasets gracefully
**Test Scenarios**:
1. No cases in metadata sheet → All counts = 0, no errors
2. No closed cases → Resolution metrics show 0, no errors
3. No assigned cases for user → User sees empty state

**Validation**: No errors, appropriate zero/empty states display

**Status**: [ ]

---

### T031: Run All Backend Tests
**File**: `gas/tests/test_feature_008.gs`
**Description**: Execute complete backend test suite
**Command**: In Apps Script editor, run `runAllFeature008Tests()`
**Validation**: All 6 tests pass

**Status**: [ ]

---

### T032: Update CLAUDE.md Agent Context
**Command**: `.specify/scripts/bash/update-agent-context.sh claude`
**Description**: Update agent context with ApexCharts technology
**Validation**:
- CLAUDE.md contains ApexCharts in active technologies
- Feature 008 listed in recent changes

**Status**: [ ]

---

## Dependency Graph

```
Phase 1 (Setup)
├── T001: Install ApexCharts [P]
├── T002: Create Dashboard Directory [P]
├── T003: Create Test File [P]
└── T004: Create Composables Directory [P]
     ↓
Phase 2 (Foundational) ← BLOCKING: Must complete before user stories
├── T005: Add getAllCases() to SheetsService
├── T006: Create DashboardService ← depends on T005
└── T007: Create DashboardHandler & Route ← depends on T006
     ↓
Phase 3 (US-001: Active Cases) ← Can start after Phase 2
├── T008: Test Active Cases Metric
├── T009: Create useDashboard Composable
├── T010: Create ActiveCasesWidget [P with T009]
└── T011: Update DashboardPage ← depends on T009, T010
     ↓
Phase 4 (US-002: Status Distribution) ← Can start after T009, T011
├── T012: Test Status Calculation
├── T013: Create CasesByStatusChart [P]
└── T014: Integrate into DashboardPage ← depends on T013
     ↓
Phase 5 (US-003: Case Types) ← Can start after T009, T011
├── T015: Test Type Calculation
├── T016: Create CasesByTypeChart [P]
└── T017: Integrate into DashboardPage ← depends on T016
     ↓
Phase 6 (US-004: Attorney Workload) ← Can start after T009, T011
├── T018: Test Attorney Calculation
├── T019: Create CasesPerAttorneyChart [P]
└── T020: Integrate into DashboardPage ← depends on T019
     ↓
Phase 7 (US-005: Resolution Time) ← Can start after T009, T011
├── T021: Test Resolution Calculation
├── T022: Create ResolutionTimeChart [P]
└── T023: Integrate into DashboardPage ← depends on T022
     ↓
Phase 8 (US-006: Role-Based Filtering) ← Can start after all charts
├── T024: Test Role-Based Filtering
└── T025: Manual Role Testing
     ↓
Phase 9 (Polish) ← Can start after all user stories
├── T026: Add English i18n [P]
├── T027: Add French i18n [P]
├── T028: Test Caching Performance
├── T029: Test Responsive Design
├── T030: Test Empty Data [P]
├── T031: Run All Backend Tests
└── T032: Update CLAUDE.md [P]
```

---

## Parallel Execution Opportunities

### Phase 1 (All tasks can run in parallel):
- T001, T002, T003, T004 → 4 tasks in parallel

### Phase 3 (US-001):
- T009 + T010 → 2 tasks in parallel

### Phase 4-7 (After foundational work):
Once T009 and T011 are complete, US-002, US-003, US-004, US-005 can be developed **in parallel**:
- T013 (StatusChart) [P]
- T016 (TypeChart) [P]
- T019 (AttorneyChart) [P]
- T022 (ResolutionChart) [P]

→ 4 chart components can be built simultaneously

### Phase 9 (Polish):
- T026 + T027 (i18n) [P]
- T030 (Empty data tests) [P]
- T032 (CLAUDE.md update) [P]

→ 4 tasks in parallel

**Total Parallel Opportunities**: 15 tasks can run in parallel, reducing implementation time from ~32 sequential tasks to ~20 effective task slots

---

## MVP Strategy

**Minimum Viable Product** (MVP) = User Story 1 ONLY

**MVP Scope** (can be delivered independently):
- T001-T007: Setup + Foundational
- T008-T011: US-001 (Active Cases Widget)
- T026-T027: i18n (minimal for US-001)
- T032: Update CLAUDE.md

**MVP Value**: Provides basic dashboard with active case count and trend - immediate value for admins

**Incremental Delivery**:
1. **MVP**: US-001 (Active Cases)
2. **v1.1**: + US-002 (Status Distribution)
3. **v1.2**: + US-003 (Case Types)
4. **v1.3**: + US-004 (Attorney Workload)
5. **v1.4**: + US-005 (Resolution Time)
6. **v1.5**: + US-006 (Role-Based Views) + Full Polish

Each increment is independently testable and deployable.

---

## Testing Strategy

**Backend Tests** (6 tests total):
- T008: Active cases metric calculation
- T012: Cases by status calculation
- T015: Cases by type calculation (top 10 + Other)
- T018: Cases per attorney calculation (workload levels)
- T021: Resolution metrics calculation (statistics)
- T024: Role-based filtering (admin vs user)

**Manual Tests**:
- T025: Role-based views (login as admin/user)
- T028: Caching performance
- T029: Responsive design (desktop/tablet/mobile)
- T030: Empty data scenarios

**Validation Checkpoints**:
- After Phase 2: Backend API works (call dashboard.getMetrics)
- After Phase 3: US-001 works end-to-end (active cases widget displays)
- After Phase 4-7: All charts render correctly
- After Phase 8: Role-based filtering works
- After Phase 9: All tests pass, i18n works

---

## Implementation Notes

### Constitution Compliance
All tasks follow constitution requirements:
- ✅ Vue 3 Composition API (`<script setup>`)
- ✅ Plain JavaScript (no TypeScript)
- ✅ Functional component splitting (5 separate chart components)
- ✅ Quasar integration (q-card, q-btn, q-toggle, grid system)
- ✅ Components < 250 LOC
- ✅ Mobile-first responsive design
- ✅ i18n support (English + French)
- ✅ Google Apps Script architecture (proper structure, security, caching)

### Performance Targets
- Dashboard load: < 3 seconds
- API response: < 2 seconds (with cache)
- Chart rendering: < 500ms per chart
- Bundle size: ApexCharts ~130KB gzipped (acceptable)

### Common Pitfalls to Avoid
1. **Forgetting to clear auto-refresh interval**: Always use `onBeforeUnmount()`
2. **Not handling empty data**: Backend should return zeros, not errors
3. **Inline functions in templates**: Extract to `computed` or methods
4. **Missing role-based filtering**: Always filter on backend, never client-side
5. **Cache key collisions**: Use `${role}_${email}` for cache keys
6. **Chart colors**: Use constitution-defined colors, ensure WCAG AA contrast

---

## Resources

- [Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Data Model](./data-model.md)
- [API Contract](./contracts/dashboard-api.json)
- [Research Report](./research.md)
- [Quickstart Guide](./quickstart.md)

---

**Generated**: 2025-10-18
**Ready for**: `/speckit.implement` command
**Total Estimated Time**: 6.5 days (with parallel execution)
