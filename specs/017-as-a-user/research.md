# Phase 0: Research - Case-Insensitive Status Handling

**Feature**: 017-as-a-user | **Date**: 2025-10-27
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Research Objectives

1. Understand current status handling in DashboardService
2. Identify all locations where status values are processed
3. Determine the best normalization strategy (backend vs frontend)
4. Define title case formatting rules for multi-word statuses
5. Assess performance impact of normalization
6. Verify no breaking changes to existing API contracts

## Current Implementation Analysis

### Backend: DashboardService.gs

**Current Status Handling (Lines 109-122)**:
```javascript
getCasesByStatus: function(cases) {
  const statusCounts = {};

  cases.forEach(c => {
    const status = c.status || 'Unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;  // Case-sensitive grouping!
  });

  return Object.entries(statusCounts).map(([status, count]) => ({
    status: status,
    count: count,
    percentage: Math.round((count / cases.length) * 100)
  }));
}
```

**Problem**: Status values are grouped case-sensitively. "Open", "OPEN", and "open" create three separate entries in `statusCounts`.

**Other Status-Dependent Methods**:
1. `getActiveCasesMetric` (line 83): Checks `c.status !== 'Closed'` - case-sensitive comparison
2. `getCasesPerAttorney` (line 169): Filters `c.status !== 'Closed'` - case-sensitive comparison
3. `getResolutionMetrics` (line 193): Filters `c.status === 'Closed'` - case-sensitive comparison

### Frontend: CasesByStatusChart.vue

**Current Status Display (Lines 34-58)**:
```javascript
const chartOptions = computed(() => ({
  labels: props.data.map(d => d.status),  // Uses status as-is from backend
  // ...
}))

const series = computed(() => props.data.map(d => d.count))
```

**Analysis**: Frontend displays status labels exactly as received from backend. No client-side normalization.

### Data Source

**SheetsService.getAllCases()**: Returns cases with `status` field from Google Sheets. Case values are stored as-is with no enforced capitalization standard.

## Normalization Strategy Decision

### Option 1: Backend Normalization (RECOMMENDED)

**Approach**: Normalize status values in `DashboardService.gs` before aggregation.

**Pros**:
- Single source of truth for normalized data
- Frontend receives clean, consistent data
- Reduces duplicate logic across frontend components
- Performance: Normalization happens once per cache cycle (5 minutes)
- Simplifies frontend testing (no normalization logic to test)

**Cons**:
- Backend changes required
- Must handle all edge cases in GAS

**Implementation Pattern**:
```javascript
// Helper function to normalize status
_normalizeStatus: function(status) {
  if (!status || typeof status !== 'string') return 'Unknown';

  // Trim whitespace and convert to lowercase for comparison
  const trimmed = status.trim();
  if (trimmed === '') return 'Unknown';

  const lower = trimmed.toLowerCase();

  // Title case: capitalize first letter of each word
  return lower.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

getCasesByStatus: function(cases) {
  const statusCounts = {};

  cases.forEach(c => {
    const normalizedStatus = this._normalizeStatus(c.status);
    statusCounts[normalizedStatus] = (statusCounts[normalizedStatus] || 0) + 1;
  });

  return Object.entries(statusCounts).map(([status, count]) => ({
    status: status,  // Already normalized
    count: count,
    percentage: Math.round((count / cases.length) * 100)
  }));
}
```

### Option 2: Frontend Normalization

**Approach**: Normalize status values in Vue components.

**Pros**:
- No backend changes required
- Easier to test in isolation

**Cons**:
- Duplicate logic across components
- Performance: Normalization happens on every render
- Inconsistent if not applied uniformly

**Decision**: **Use Option 1 (Backend Normalization)** per specification requirement FR-010.

## Title Case Formatting Rules

### Rules for Status Normalization

1. **Trim whitespace**: Remove leading/trailing whitespace
2. **Handle empty/null**: Convert to "Unknown"
3. **Title case**: Capitalize first letter of each word
4. **Preserve spaces**: "in progress" → "In Progress"
5. **Handle special characters**: Preserve hyphens, apostrophes

### Example Transformations

| Input | Output |
|-------|--------|
| "open" | "Open" |
| "OPEN" | "Open" |
| "Open" | "Open" |
| "in progress" | "In Progress" |
| "IN PROGRESS" | "In Progress" |
| "closed" | "Closed" |
| "CLOSED" | "Closed" |
| " open " | "Open" |
| "" | "Unknown" |
| null | "Unknown" |
| "in-progress" | "In-Progress" |
| "re-opened" | "Re-Opened" |

## Status Comparison Updates

All case-sensitive status comparisons must be updated to use normalized values:

### 1. Active Cases Filter
**Current** (line 88):
```javascript
const currentActive = cases.filter(c => c.status !== 'Closed').length;
```

**Updated**:
```javascript
const currentActive = cases.filter(c => this._normalizeStatus(c.status) !== 'Closed').length;
```

### 2. Cases Per Attorney Filter
**Current** (line 171):
```javascript
const activeCases = cases.filter(c => c.status !== 'Closed');
```

**Updated**:
```javascript
const activeCases = cases.filter(c => this._normalizeStatus(c.status) !== 'Closed');
```

### 3. Resolution Metrics Filter
**Current** (line 194):
```javascript
const closedCases = cases.filter(c => c.status === 'Closed');
```

**Updated**:
```javascript
const closedCases = cases.filter(c => this._normalizeStatus(c.status) === 'Closed');
```

## Performance Impact Assessment

### Current Performance
- Cache TTL: 300 seconds (5 minutes)
- Metrics calculated once per cache miss
- Average dataset: ~100-1000 cases

### Normalization Overhead
- Operation: String trim, toLowerCase, split, map, join per case
- Frequency: Once per case during `getCasesByStatus` + 3x during filtering
- Estimated overhead: <50ms for 1000 cases
- Impact: **Negligible** - well within 1s rendering goal

### Optimization Strategy
- Normalize once per case at the start of `_calculateMetrics`
- Cache normalized status on case object
- Reuse normalized value in all methods

**Optimized Pattern**:
```javascript
_calculateMetrics: function(userEmail, userRole) {
  const cases = this._getFilteredCases(userEmail, userRole);

  // Normalize status once per case
  cases.forEach(c => {
    c._normalizedStatus = this._normalizeStatus(c.status);
  });

  // ... rest of calculation uses c._normalizedStatus
}
```

## Edge Cases Handling

### 1. Whitespace Variations
**Test**: " Open ", "Open ", " Open"
**Handling**: `status.trim()` before normalization

### 2. Null/Undefined/Empty
**Test**: `null`, `undefined`, `""`
**Handling**: Return "Unknown" for all cases

### 3. Special Characters
**Test**: "In-Progress", "Re-Opened", "Won't Fix"
**Handling**: Preserve hyphens and apostrophes, apply title case per word

### 4. Non-Latin Characters
**Test**: Status values with accented characters
**Handling**: JavaScript `toUpperCase()`/`toLowerCase()` handles Unicode correctly

### 5. Numbers in Status
**Test**: "Phase 2", "step 1"
**Handling**: Numbers are preserved, title case applied to letters

## API Contract Verification

### Current Response Format
```json
{
  "status": "success",
  "data": {
    "casesByStatus": [
      { "status": "Open", "count": 10, "percentage": 50 },
      { "status": "Closed", "count": 10, "percentage": 50 }
    ]
  }
}
```

### Impact Assessment
- **No breaking changes**: Response structure remains identical
- **Data format**: Status field still a string
- **Backwards compatibility**: Frontend code requires no changes
- **Visual impact**: Status labels may change capitalization (e.g., "CLOSED" → "Closed")

## Testing Strategy

### Backend Tests (Google Apps Script)

Create test function in `gas/tests/DashboardServiceTest.gs`:

```javascript
function testStatusNormalization() {
  // Test basic normalization
  assertEqual(
    DashboardService._normalizeStatus('open'),
    'Open'
  );

  // Test case insensitivity
  assertEqual(
    DashboardService._normalizeStatus('OPEN'),
    'Open'
  );

  // Test multi-word
  assertEqual(
    DashboardService._normalizeStatus('in progress'),
    'In Progress'
  );

  // Test whitespace
  assertEqual(
    DashboardService._normalizeStatus(' open '),
    'Open'
  );

  // Test empty/null
  assertEqual(
    DashboardService._normalizeStatus(''),
    'Unknown'
  );
  assertEqual(
    DashboardService._normalizeStatus(null),
    'Unknown'
  );
}

function testCasesByStatusNormalization() {
  const testCases = [
    { status: 'Open' },
    { status: 'OPEN' },
    { status: 'open' },
    { status: 'Closed' },
    { status: 'CLOSED' }
  ];

  const result = DashboardService.getCasesByStatus(testCases);

  // Should have exactly 2 status categories
  assertEqual(result.length, 2);

  // Should consolidate "Open" variations
  const openItem = result.find(r => r.status === 'Open');
  assertEqual(openItem.count, 3);
  assertEqual(openItem.percentage, 60);

  // Should consolidate "Closed" variations
  const closedItem = result.find(r => r.status === 'Closed');
  assertEqual(closedItem.count, 2);
  assertEqual(closedItem.percentage, 40);
}
```

### Frontend Tests (Vitest)

Update `src/components/dashboard/__tests__/CasesByStatusChart.spec.js`:

```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CasesByStatusChart from '../CasesByStatusChart.vue'

describe('CasesByStatusChart', () => {
  it('displays normalized status labels from backend', () => {
    const wrapper = mount(CasesByStatusChart, {
      props: {
        data: [
          { status: 'Open', count: 5, percentage: 50 },
          { status: 'Closed', count: 5, percentage: 50 }
        ]
      }
    })

    // Backend should send normalized labels
    expect(wrapper.text()).toContain('Open')
    expect(wrapper.text()).toContain('Closed')
    expect(wrapper.text()).not.toContain('OPEN')
    expect(wrapper.text()).not.toContain('open')
  })
})
```

## Dependencies

### No New Dependencies Required

- **String normalization**: Native JavaScript String methods
- **Testing**: Existing Google Apps Script test infrastructure
- **Frontend**: No changes to component dependencies

## Migration Path

### Phase 1: Backend Implementation
1. Add `_normalizeStatus()` helper to DashboardService
2. Update `getCasesByStatus()` to use normalized status
3. Update status comparisons in `getActiveCasesMetric()`, `getCasesPerAttorney()`, `getResolutionMetrics()`
4. Add backend tests

### Phase 2: Cache Invalidation
1. Clear existing dashboard metrics cache
2. Verify new normalized data is returned

### Phase 3: Frontend Verification
1. Verify charts display normalized status labels
2. Update frontend tests to expect normalized data
3. Visual QA on dashboard

### Phase 4: Monitoring
1. Verify no performance degradation
2. Confirm cache hit rates remain stable
3. Monitor for any status-related errors

## Risk Assessment

### Low Risk
- **Scope**: Changes isolated to DashboardService
- **Backwards compatibility**: No API contract changes
- **Performance**: Negligible overhead (<50ms)
- **Rollback**: Simple - revert DashboardService.gs changes

### Mitigation
- Comprehensive unit tests for edge cases
- Manual QA with varied status values
- Monitor cache performance after deployment

## Conclusion

**Recommendation**: Proceed with backend normalization strategy.

**Key Decisions**:
1. ✅ Normalize in `DashboardService.gs` (backend)
2. ✅ Use title case format for display
3. ✅ Handle all edge cases (whitespace, null, special chars)
4. ✅ Update all status comparisons to use normalized values
5. ✅ Add comprehensive backend tests

**Next Step**: Proceed to Phase 1 (Design) to create data model and implementation contracts.
