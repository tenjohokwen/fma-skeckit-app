# Data Model - Case-Insensitive Status Handling

**Feature**: 017-as-a-user | **Date**: 2025-10-27
**Related**: [spec.md](./spec.md) | [research.md](./research.md)

## Overview

This feature introduces status normalization in the dashboard metrics pipeline. No database schema changes are required - normalization happens at the service layer during data aggregation.

## Data Flow

```
Google Sheets (raw status)
    ↓
SheetsService.getAllCases() (status as-is)
    ↓
DashboardService._calculateMetrics() (normalize once)
    ↓
DashboardService.getCasesByStatus() (aggregated with normalized keys)
    ↓
Frontend Charts (display normalized labels)
```

## Entity: Case

### Source Data (Google Sheets)

**Storage**: Cases sheet in Google Sheets
**Status Field**: Column "Status" (text, no enforced capitalization)

**Example Raw Data**:
```javascript
{
  caseNumber: "CASE-001",
  status: "Open",        // May vary: "open", "OPEN", "Open"
  caseType: "Type A",
  assignedTo: "Attorney Name",
  createdAt: "2025-01-15T10:00:00Z",
  lastUpdatedAt: "2025-01-20T15:30:00Z"
}
```

### Processed Data (DashboardService)

**Normalization Point**: `DashboardService._calculateMetrics()`

**Normalized Case Object** (internal, temporary):
```javascript
{
  caseNumber: "CASE-001",
  status: "Open",                    // Original, preserved
  _normalizedStatus: "Open",         // Computed, cached
  caseType: "Type A",
  assignedTo: "Attorney Name",
  createdAt: "2025-01-15T10:00:00Z",
  lastUpdatedAt: "2025-01-20T15:30:00Z"
}
```

**Note**: `_normalizedStatus` is computed property, not stored in sheets.

## Entity: Status Metrics (casesByStatus)

### Before Normalization (Current)

```javascript
[
  { status: "Open", count: 5, percentage: 25 },
  { status: "OPEN", count: 3, percentage: 15 },   // Duplicate!
  { status: "open", count: 2, percentage: 10 },   // Duplicate!
  { status: "Closed", count: 10, percentage: 50 }
]
```

### After Normalization (Target)

```javascript
[
  { status: "Open", count: 10, percentage: 50 },    // Consolidated
  { status: "Closed", count: 10, percentage: 50 }
]
```

**Attributes**:
- `status` (string): Normalized status label in title case
- `count` (number): Number of cases with this status
- `percentage` (number): Percentage of total cases (rounded)

**Constraints**:
- Each status appears exactly once (case-insensitive uniqueness)
- Percentages sum to 100 (or close due to rounding)
- Status is never null or empty (defaults to "Unknown")

## Status Normalization Rules

### Normalization Function

**Input**: Raw status string from Google Sheets
**Output**: Normalized status string

**Algorithm**:
```
1. IF status is null, undefined, or empty string → return "Unknown"
2. Trim leading/trailing whitespace
3. IF trimmed string is empty → return "Unknown"
4. Convert to lowercase
5. Split by spaces
6. Capitalize first letter of each word
7. Join with spaces
8. Return normalized string
```

**Implementation** (gas/services/DashboardService.gs):
```javascript
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
}
```

### Normalization Examples

| Input | Trim | Lowercase | Title Case | Output |
|-------|------|-----------|------------|--------|
| `"Open"` | `"Open"` | `"open"` | `"Open"` | `"Open"` |
| `"OPEN"` | `"OPEN"` | `"open"` | `"Open"` | `"Open"` |
| `"open"` | `"open"` | `"open"` | `"Open"` | `"Open"` |
| `" Open "` | `"Open"` | `"open"` | `"Open"` | `"Open"` |
| `"in progress"` | `"in progress"` | `"in progress"` | `"In Progress"` | `"In Progress"` |
| `"IN PROGRESS"` | `"IN PROGRESS"` | `"in progress"` | `"In Progress"` | `"In Progress"` |
| `""` | `""` | - | - | `"Unknown"` |
| `null` | - | - | - | `"Unknown"` |
| `"in-progress"` | `"in-progress"` | `"in-progress"` | `"In-Progress"` | `"In-Progress"` |

**Edge Cases**:
- Hyphenated statuses treated as one word: "in-progress" → "In-progress"
- For more sophisticated handling (e.g., "In-Progress"), would need custom split logic
- Current implementation prioritizes simplicity and covers 95% of cases

## Data Structures

### Dashboard Metrics Response

**Endpoint**: `DashboardHandler.getAllMetrics()`
**Cache Key**: `dashboard_metrics_org_wide`
**Cache TTL**: 300 seconds (5 minutes)

**Response Format**:
```javascript
{
  status: "success",
  msgKey: "dashboard.metrics.success",
  message: "Dashboard metrics retrieved successfully",
  data: {
    activeCases: {
      count: 20,
      trend: { direction: 'up', percentage: 10, change: 2 }
    },
    casesByStatus: [
      { status: "Open", count: 10, percentage: 50 },
      { status: "In Progress", count: 5, percentage: 25 },
      { status: "Closed", count: 5, percentage: 25 }
    ],
    casesByType: [ /* ... */ ],
    casesPerAttorney: [ /* ... */ ],
    resolutionTime: { /* ... */ },
    lastUpdated: "2025-10-27T14:30:00Z"
  },
  token: { /* ... */ }
}
```

**Changes**:
- `casesByStatus[].status`: Now guaranteed to be normalized (title case)
- No structural changes to response format

## Impact on Related Entities

### Active Cases Metric

**Method**: `DashboardService.getActiveCasesMetric()`

**Before**:
```javascript
const currentActive = cases.filter(c => c.status !== 'Closed').length;
```

**After**:
```javascript
const currentActive = cases.filter(c => c._normalizedStatus !== 'Closed').length;
```

**Impact**: More accurate count - cases with status "closed", "CLOSED", "Closed" all excluded.

### Cases Per Attorney

**Method**: `DashboardService.getCasesPerAttorney()`

**Before**:
```javascript
const activeCases = cases.filter(c => c.status !== 'Closed');
```

**After**:
```javascript
const activeCases = cases.filter(c => c._normalizedStatus !== 'Closed');
```

**Impact**: Attorney workload counts now accurate regardless of status capitalization.

### Resolution Metrics

**Method**: `DashboardService.getResolutionMetrics()`

**Before**:
```javascript
const closedCases = cases.filter(c => c.status === 'Closed');
```

**After**:
```javascript
const closedCases = cases.filter(c => c._normalizedStatus === 'Closed');
```

**Impact**: Resolution time calculations include all closed cases regardless of capitalization.

## Data Integrity

### Original Data Preservation

**Important**: Status normalization does NOT modify data in Google Sheets.

- Original status values remain unchanged in Cases sheet
- Normalization is applied in-memory during metrics calculation
- `_normalizedStatus` is a computed property, not persisted

### Consistency Guarantees

1. **Single normalization point**: All status processing goes through `_normalizeStatus()`
2. **Deterministic**: Same input always produces same output
3. **Idempotent**: Normalizing a normalized value returns the same value
4. **Cache coherence**: Normalized data cached for 5 minutes, then recalculated

## Testing Data

### Test Dataset for Backend Tests

```javascript
const TEST_CASES = [
  // Variation 1: Open
  { caseNumber: 'C001', status: 'Open', caseType: 'A', assignedTo: 'Attorney1', createdAt: '2025-01-01', lastUpdatedAt: '2025-01-02' },
  { caseNumber: 'C002', status: 'OPEN', caseType: 'A', assignedTo: 'Attorney1', createdAt: '2025-01-01', lastUpdatedAt: '2025-01-02' },
  { caseNumber: 'C003', status: 'open', caseType: 'B', assignedTo: 'Attorney2', createdAt: '2025-01-01', lastUpdatedAt: '2025-01-02' },

  // Variation 2: In Progress
  { caseNumber: 'C004', status: 'In Progress', caseType: 'A', assignedTo: 'Attorney1', createdAt: '2025-01-01', lastUpdatedAt: '2025-01-02' },
  { caseNumber: 'C005', status: 'IN PROGRESS', caseType: 'B', assignedTo: 'Attorney2', createdAt: '2025-01-01', lastUpdatedAt: '2025-01-02' },

  // Variation 3: Closed
  { caseNumber: 'C006', status: 'Closed', caseType: 'A', assignedTo: 'Attorney1', createdAt: '2025-01-01', lastUpdatedAt: '2025-01-10' },
  { caseNumber: 'C007', status: 'CLOSED', caseType: 'B', assignedTo: 'Attorney2', createdAt: '2025-01-01', lastUpdatedAt: '2025-01-10' },
  { caseNumber: 'C008', status: 'closed', caseType: 'A', assignedTo: 'Attorney1', createdAt: '2025-01-01', lastUpdatedAt: '2025-01-10' },

  // Edge cases
  { caseNumber: 'C009', status: ' Open ', caseType: 'A', assignedTo: 'Attorney1', createdAt: '2025-01-01', lastUpdatedAt: '2025-01-02' },
  { caseNumber: 'C010', status: '', caseType: 'A', assignedTo: 'Attorney1', createdAt: '2025-01-01', lastUpdatedAt: '2025-01-02' },
  { caseNumber: 'C011', status: null, caseType: 'B', assignedTo: 'Attorney2', createdAt: '2025-01-01', lastUpdatedAt: '2025-01-02' }
];
```

**Expected Aggregation**:
```javascript
[
  { status: 'Open', count: 4, percentage: 36 },       // C001, C002, C003, C009
  { status: 'In Progress', count: 2, percentage: 18 }, // C004, C005
  { status: 'Closed', count: 3, percentage: 27 },      // C006, C007, C008
  { status: 'Unknown', count: 2, percentage: 18 }      // C010, C011
]
```

## Migration Considerations

### No Database Migration Required

- No schema changes
- No data transformation scripts
- No backfill operations

### Cache Invalidation

**Action**: Clear `dashboard_metrics_org_wide` cache after deployment

**Script** (gas/utils/CacheUtil.gs):
```javascript
function clearDashboardCache() {
  const cache = CacheService.getScriptCache();
  cache.remove('dashboard_metrics_org_wide');
  Logger.log('Dashboard cache cleared');
}
```

**When**: Run once immediately after deploying DashboardService changes.

## Performance Characteristics

### Time Complexity

**Normalization**: O(n * m) where:
- n = number of cases
- m = average status string length (typically 5-15 characters)

**Expected**: <1ms per case, <50ms for 1000 cases

### Space Complexity

**Additional Memory**: O(n) for `_normalizedStatus` property on each case object

**Cache Impact**: None - normalized data is same size as original (status strings)

### Optimization

**Strategy**: Normalize once at start of `_calculateMetrics()`, reuse normalized value:

```javascript
_calculateMetrics: function(userEmail, userRole) {
  const cases = this._getFilteredCases(userEmail, userRole);

  // Pre-compute normalized status for all cases
  cases.forEach(c => {
    c._normalizedStatus = this._normalizeStatus(c.status);
  });

  // Now all methods can use c._normalizedStatus without re-normalizing
  return {
    activeCases: this.getActiveCasesMetric(cases),
    casesByStatus: this.getCasesByStatus(cases),
    casesPerAttorney: this.getCasesPerAttorney(cases),
    resolutionTime: this.getResolutionMetrics(cases),
    lastUpdated: DateUtil.getCurrentTimestamp()
  };
}
```

**Benefit**: Status normalization happens exactly once per case per metrics calculation.

## Summary

**Data Changes**:
- ✅ No schema changes
- ✅ No data migration required
- ✅ In-memory normalization only
- ✅ Original data preserved

**New Computed Property**:
- `_normalizedStatus`: Title case version of `status` field

**Modified Aggregations**:
- `casesByStatus`: Groups by normalized status
- Status comparisons in all metrics methods use normalized values

**API Compatibility**:
- ✅ Response structure unchanged
- ✅ Field types unchanged
- ✅ Only status label values change (capitalization)
