# Quick Start Guide - Case-Insensitive Status Handling

**Feature**: 017-as-a-user | **Date**: 2025-10-27
**For**: Developers implementing this feature

## 🎯 Goal

Add case-insensitive status normalization to dashboard metrics so that "Open", "OPEN", and "open" are treated as the same status category.

## 📋 Prerequisites

- Feature branch `017-as-a-user` checked out
- Access to Google Apps Script project
- Familiarity with DashboardService.gs
- Local development environment set up for frontend testing

## 🚀 Implementation Steps

### Step 1: Add Normalization Helper (Backend)

**File**: `gas/services/DashboardService.gs`

**Location**: After line 8 (after CACHE_TTL constant), add:

```javascript
/**
 * Normalizes status string to title case
 * @param {string} status - Raw status value
 * @returns {string} Normalized status in title case
 * @private
 */
_normalizeStatus: function(status) {
  // Handle null/undefined/empty
  if (!status || typeof status !== 'string') return 'Unknown';

  // Trim whitespace
  const trimmed = status.trim();
  if (trimmed === '') return 'Unknown';

  // Title case: capitalize first letter of each word
  const lower = trimmed.toLowerCase();
  return lower.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
},
```

### Step 2: Pre-normalize Status in Calculate Metrics

**File**: `gas/services/DashboardService.gs`

**Location**: In `_calculateMetrics()` method, after line 44 (after getting filtered cases), add:

```javascript
_calculateMetrics: function(userEmail, userRole) {
  const cases = this._getFilteredCases(userEmail, userRole);

  // Handle empty dataset gracefully
  if (!Array.isArray(cases) || cases.length === 0) {
    return {
      activeCases: { count: 0, trend: { direction: 'neutral', percentage: 0, change: 0 } },
      casesByStatus: [],
      casesByType: [],
      casesPerAttorney: [],
      resolutionTime: { average: 0, median: 0, min: 0, max: 0, percentile75: 0, percentile90: 0, count: 0 },
      lastUpdated: DateUtil.getCurrentTimestamp()
    };
  }

  // ADD THIS: Pre-compute normalized status for all cases
  cases.forEach(c => {
    c._normalizedStatus = this._normalizeStatus(c.status);
  });

  return {
    activeCases: this.getActiveCasesMetric(cases),
    casesByStatus: this.getCasesByStatus(cases),
    casesByType: this.getCasesByType(cases),
    casesPerAttorney: this.getCasesPerAttorney(cases),
    resolutionTime: this.getResolutionMetrics(cases),
    lastUpdated: DateUtil.getCurrentTimestamp()
  };
},
```

### Step 3: Update getCasesByStatus

**File**: `gas/services/DashboardService.gs`

**Location**: Replace `getCasesByStatus()` method (lines 109-122):

```javascript
/**
 * Get cases grouped by status (case-insensitive)
 * @param {Array} cases - Array of case objects with _normalizedStatus
 * @returns {Array} Array of status metrics
 */
getCasesByStatus: function(cases) {
  const statusCounts = {};

  cases.forEach(c => {
    const status = c._normalizedStatus || 'Unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  return Object.entries(statusCounts).map(([status, count]) => ({
    status: status,
    count: count,
    percentage: Math.round((count / cases.length) * 100)
  }));
},
```

### Step 4: Update getActiveCasesMetric

**File**: `gas/services/DashboardService.gs`

**Location**: In `getActiveCasesMetric()` method, update line 88:

**Before**:
```javascript
const currentActive = cases.filter(c => c.status !== 'Closed').length;
```

**After**:
```javascript
const currentActive = cases.filter(c => c._normalizedStatus !== 'Closed').length;
```

**Also update line 93**:

**Before**:
```javascript
return createdDate < thirtyDaysAgo && c.status !== 'Closed';
```

**After**:
```javascript
return createdDate < thirtyDaysAgo && c._normalizedStatus !== 'Closed';
```

### Step 5: Update getCasesPerAttorney

**File**: `gas/services/DashboardService.gs`

**Location**: In `getCasesPerAttorney()` method, update line 171:

**Before**:
```javascript
const activeCases = cases.filter(c => c.status !== 'Closed');
```

**After**:
```javascript
const activeCases = cases.filter(c => c._normalizedStatus !== 'Closed');
```

### Step 6: Update getResolutionMetrics

**File**: `gas/services/DashboardService.gs`

**Location**: In `getResolutionMetrics()` method, update line 194:

**Before**:
```javascript
const closedCases = cases.filter(c => c.status === 'Closed');
```

**After**:
```javascript
const closedCases = cases.filter(c => c._normalizedStatus === 'Closed');
```

### Step 7: Add Backend Tests

**File**: Create `gas/tests/DashboardServiceTest.gs`

```javascript
/**
 * Test suite for DashboardService status normalization
 * Feature 017: Case-Insensitive Status Handling
 */

function testNormalizeStatus() {
  Logger.log('Testing _normalizeStatus...');

  // Test basic normalization
  assertEqual(DashboardService._normalizeStatus('open'), 'Open', 'lowercase should become title case');
  assertEqual(DashboardService._normalizeStatus('OPEN'), 'Open', 'uppercase should become title case');
  assertEqual(DashboardService._normalizeStatus('Open'), 'Open', 'title case should remain unchanged');

  // Test multi-word
  assertEqual(DashboardService._normalizeStatus('in progress'), 'In Progress', 'multi-word lowercase');
  assertEqual(DashboardService._normalizeStatus('IN PROGRESS'), 'In Progress', 'multi-word uppercase');

  // Test whitespace
  assertEqual(DashboardService._normalizeStatus(' open '), 'Open', 'trim whitespace');
  assertEqual(DashboardService._normalizeStatus('  In Progress  '), 'In Progress', 'trim multi-word');

  // Test empty/null
  assertEqual(DashboardService._normalizeStatus(''), 'Unknown', 'empty string');
  assertEqual(DashboardService._normalizeStatus(null), 'Unknown', 'null');
  assertEqual(DashboardService._normalizeStatus(undefined), 'Unknown', 'undefined');

  Logger.log('✅ All _normalizeStatus tests passed');
}

function testGetCasesByStatusNormalization() {
  Logger.log('Testing getCasesByStatus normalization...');

  const testCases = [
    { status: 'Open', caseType: 'A', assignedTo: 'Attorney1', createdAt: '2025-01-01', lastUpdatedAt: '2025-01-02' },
    { status: 'OPEN', caseType: 'B', assignedTo: 'Attorney2', createdAt: '2025-01-01', lastUpdatedAt: '2025-01-02' },
    { status: 'open', caseType: 'A', assignedTo: 'Attorney1', createdAt: '2025-01-01', lastUpdatedAt: '2025-01-02' },
    { status: 'Closed', caseType: 'B', assignedTo: 'Attorney2', createdAt: '2025-01-01', lastUpdatedAt: '2025-01-10' },
    { status: 'CLOSED', caseType: 'A', assignedTo: 'Attorney1', createdAt: '2025-01-01', lastUpdatedAt: '2025-01-10' }
  ];

  // Pre-normalize (simulate _calculateMetrics behavior)
  testCases.forEach(c => {
    c._normalizedStatus = DashboardService._normalizeStatus(c.status);
  });

  const result = DashboardService.getCasesByStatus(testCases);

  // Should have exactly 2 status categories (not 5)
  assertEqual(result.length, 2, 'should consolidate to 2 unique statuses');

  // Find Open and Closed entries
  const openEntry = result.find(r => r.status === 'Open');
  const closedEntry = result.find(r => r.status === 'Closed');

  // Verify Open consolidation
  assertNotNull(openEntry, 'should have Open entry');
  assertEqual(openEntry.count, 3, 'Open should have count of 3');
  assertEqual(openEntry.percentage, 60, 'Open should be 60%');

  // Verify Closed consolidation
  assertNotNull(closedEntry, 'should have Closed entry');
  assertEqual(closedEntry.count, 2, 'Closed should have count of 2');
  assertEqual(closedEntry.percentage, 40, 'Closed should be 40%');

  Logger.log('✅ All getCasesByStatus normalization tests passed');
}

function runDashboardServiceTests() {
  Logger.log('=== Running DashboardService Tests ===');
  testNormalizeStatus();
  testGetCasesByStatusNormalization();
  Logger.log('=== All tests passed ✅ ===');
}

// Test helpers
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

function assertNotNull(value, message) {
  if (value === null || value === undefined) {
    throw new Error(`Assertion failed: ${message}\nValue is null or undefined`);
  }
}
```

**Run tests**: In Google Apps Script editor, run `runDashboardServiceTests()`

### Step 8: Clear Dashboard Cache

**File**: `gas/utils/CacheUtil.gs` (create if doesn't exist)

```javascript
/**
 * Cache management utilities
 */

/**
 * Clear dashboard metrics cache
 * Run once after deploying status normalization changes
 */
function clearDashboardCache() {
  const cache = CacheService.getScriptCache();
  cache.remove('dashboard_metrics_org_wide');
  Logger.log('✅ Dashboard cache cleared');
}
```

**Action**: After deploying backend changes, run `clearDashboardCache()` once.

### Step 9: Frontend Verification (No Code Changes Required)

The frontend automatically receives normalized data from the backend. No code changes needed!

**Manual Testing**:
1. Open dashboard in browser
2. Inspect "Cases by Status" chart
3. Verify status labels are in title case (e.g., "Open", "In Progress", "Closed")
4. Verify no duplicate status categories

### Step 10: Update Frontend Tests (Optional)

**File**: `src/components/dashboard/__tests__/CasesByStatusChart.spec.js`

Add test case to verify normalized data handling:

```javascript
it('handles normalized status labels from backend', () => {
  const wrapper = mount(CasesByStatusChart, {
    props: {
      data: [
        { status: 'Open', count: 10, percentage: 50 },
        { status: 'In Progress', count: 5, percentage: 25 },
        { status: 'Closed', count: 5, percentage: 25 }
      ]
    }
  })

  // All labels should be title case
  const chartLabels = wrapper.vm.chartOptions.labels
  expect(chartLabels).toEqual(['Open', 'In Progress', 'Closed'])
  expect(chartLabels).not.toContain('OPEN')
  expect(chartLabels).not.toContain('open')
})
```

## ✅ Verification Checklist

### Backend Tests
- [ ] `testNormalizeStatus()` passes (8 assertions)
- [ ] `testGetCasesByStatusNormalization()` passes (5 assertions)
- [ ] Manual test: Run `DashboardService.getAllMetrics(email, role)` and inspect `casesByStatus` array

### Frontend Verification
- [ ] Dashboard loads without errors
- [ ] "Cases by Status" chart shows title case labels
- [ ] No duplicate status categories (e.g., both "Open" and "OPEN")
- [ ] All charts displaying status use consistent labels

### Integration Testing
- [ ] Clear cache and verify fresh metrics are calculated
- [ ] Verify cache hit logs show consistent normalized data
- [ ] Test with dataset containing mixed-case status values
- [ ] Test edge cases: empty status, whitespace, null values

## 🔍 Debugging Tips

### Backend Debugging

**Check normalization**:
```javascript
function debugNormalization() {
  const cases = SheetsService.getAllCases();
  cases.slice(0, 10).forEach(c => {
    Logger.log(`Original: "${c.status}" → Normalized: "${DashboardService._normalizeStatus(c.status)}"`);
  });
}
```

**Check aggregation**:
```javascript
function debugCasesByStatus() {
  const cases = SheetsService.getAllCases();
  cases.forEach(c => {
    c._normalizedStatus = DashboardService._normalizeStatus(c.status);
  });
  const result = DashboardService.getCasesByStatus(cases);
  Logger.log(JSON.stringify(result, null, 2));
}
```

### Frontend Debugging

**Console check**:
```javascript
// In browser console after dashboard loads
console.log('Status data:', window.$vm.$refs.casesByStatusChart.data)
```

## 📚 Reference

- **Spec**: [spec.md](./spec.md) - Feature requirements
- **Research**: [research.md](./research.md) - Technical decisions
- **Data Model**: [data-model.md](./data-model.md) - Data structures

## 🎉 Success Criteria

You're done when:
1. ✅ All backend tests pass
2. ✅ Dashboard displays normalized status labels
3. ✅ No duplicate status categories in any chart
4. ✅ Active cases count is accurate (considers all "Closed" variations)
5. ✅ Cache invalidation works (fresh data after clearing cache)

## ⚠️ Common Pitfalls

1. **Forgetting to pre-normalize**: Make sure `_normalizedStatus` is computed in `_calculateMetrics()` before calling other methods
2. **Cache not cleared**: Old non-normalized data may be cached - run `clearDashboardCache()`
3. **Inconsistent comparison**: Always compare against normalized values (e.g., `'Closed'` not `'closed'`)
4. **Missing edge cases**: Test with null, empty, and whitespace-only status values

## 🚀 Deployment

1. Deploy `DashboardService.gs` changes to Google Apps Script
2. Run `clearDashboardCache()` once via Apps Script editor
3. Frontend receives normalized data automatically (no deployment needed)
4. Monitor dashboard for 5-10 minutes to verify cache regeneration

## 📞 Need Help?

- Review [research.md](./research.md) for technical decisions and rationale
- Check [data-model.md](./data-model.md) for data structure details
- Run debug functions above to inspect data at each stage
