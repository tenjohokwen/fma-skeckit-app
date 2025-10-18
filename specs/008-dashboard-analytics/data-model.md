# Data Model: Dashboard Analytics & Charts

**Feature**: 008-dashboard-analytics
**Date**: 2025-10-18
**Status**: Complete

## Overview

This document defines the data structures and models used in the Dashboard Analytics feature. The feature primarily aggregates existing data from the `metadata` and `clients` sheets and transforms it into metrics suitable for visualization.

---

## Data Sources

### Source 1: Metadata Sheet

**Location**: Google Sheets (metadata sheet)

**Purpose**: Primary source of case data for analytics

**Relevant Columns**:
| Column | Type | Description | Usage in Dashboard |
|--------|------|-------------|-------------------|
| caseId | String | Unique case identifier | Counting, grouping |
| caseName | String | Human-readable case name | Display (optional) |
| clientId | String | Reference to client | Future enhancement |
| assignedTo | String | Attorney email/name | Cases per Attorney chart |
| caseType | String | Practice area | Cases by Type chart |
| status | String | Case status | Cases by Status chart, Active Cases count |
| createdAt | Timestamp | Case creation date | Trend calculation, Resolution Time |
| lastUpdatedAt | Timestamp | Last update timestamp | Resolution Time calculation (proxy for close date) |

**Access Pattern**:
```javascript
// Backend: SheetsService.getAllCases()
const allCases = SheetsService.getAllCases();
// Returns array of case objects
```

---

### Source 2: Clients Sheet

**Location**: Google Sheets (clients sheet)

**Purpose**: Client information (limited use in dashboard MVP)

**Future Usage**:
- Client count over time
- Cases per client
- Client acquisition trends

**Current Usage**: Not directly used in MVP dashboard (only via enrichment in case data)

---

## Domain Entities

### Entity 1: DashboardMetrics

**Purpose**: Aggregated container for all dashboard metrics

**Structure**:
```javascript
{
  activeCases: ActiveCasesMetric,
  casesByStatus: Array<StatusMetric>,
  casesByType: Array<TypeMetric>,
  casesPerAttorney: Array<AttorneyMetric>,
  resolutionTime: ResolutionMetric,
  lastUpdated: String (ISO 8601 timestamp)
}
```

**Validation Rules**:
- All fields required
- `lastUpdated` must be valid ISO 8601 timestamp
- All metric arrays can be empty (for new deployments with no data)

**Relationships**:
- Contains multiple sub-metrics (composition)
- No persistence (calculated on-demand)

**State Transitions**: N/A (read-only aggregate)

---

### Entity 2: ActiveCasesMetric

**Purpose**: Current active case count with trend indicator

**Structure**:
```javascript
{
  count: Number,           // Current number of active cases (status ≠ 'Closed')
  trend: {
    direction: String,     // 'up' | 'down' | 'neutral'
    percentage: Number,    // Percentage change from previous period
    change: Number         // Absolute change in case count
  }
}
```

**Validation Rules**:
- `count` ≥ 0 (integer)
- `trend.direction` must be one of: 'up', 'down', 'neutral'
- `trend.percentage` can be negative, zero, or positive (integer)
- `trend.change` can be negative, zero, or positive (integer)

**Calculation Logic**:
```javascript
// Current active cases
activeCases.count = COUNT(cases WHERE status ≠ 'Closed')

// Previous period (30 days ago)
const thirtyDaysAgo = NOW - 30 days
previousCount = COUNT(cases WHERE status ≠ 'Closed' AND createdAt < thirtyDaysAgo)

// Trend calculation
change = activeCases.count - previousCount
percentage = (change / previousCount) * 100
direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
```

**Example**:
```javascript
{
  count: 142,
  trend: {
    direction: 'up',
    percentage: 12,
    change: 15
  }
}
```

---

### Entity 3: StatusMetric

**Purpose**: Case count for a specific status

**Structure**:
```javascript
{
  status: String,          // Status name (e.g., 'Open', 'Pending', 'Closed')
  count: Number,           // Number of cases with this status
  percentage: Number       // Percentage of total cases
}
```

**Validation Rules**:
- `status` required, non-empty string
- `count` ≥ 0 (integer)
- `percentage` between 0 and 100 (integer)
- Sum of all percentages should equal 100 (±1 for rounding)

**Calculation Logic**:
```javascript
statusCounts = GROUP_BY(cases, 'status')
totalCases = COUNT(cases)

for each status in statusCounts:
  percentage = ROUND((statusCounts[status] / totalCases) * 100)
```

**Example Array**:
```javascript
[
  { status: 'Open', count: 45, percentage: 32 },
  { status: 'Pending', count: 32, percentage: 23 },
  { status: 'In Progress', count: 35, percentage: 25 },
  { status: 'Closed', count: 30, percentage: 21 }
]
```

---

### Entity 4: TypeMetric

**Purpose**: Case count for a specific case type (practice area)

**Structure**:
```javascript
{
  type: String,            // Case type name (e.g., 'Immigration', 'Family Law')
  count: Number,           // Number of cases of this type
  percentage: Number       // Percentage of total cases
}
```

**Validation Rules**:
- `type` required, non-empty string
- `count` ≥ 0 (integer)
- `percentage` between 0 and 100 (integer)
- Array sorted by count (descending)
- Maximum 11 entries (top 10 + "Other" category)

**Calculation Logic**:
```javascript
typeCounts = GROUP_BY(cases, 'caseType')
totalCases = COUNT(cases)
sorted = SORT(typeCounts BY count DESC)

// Keep top 10, group rest as "Other"
if (sorted.length > 10) {
  top10 = sorted.slice(0, 10)
  others = sorted.slice(10)
  otherCount = SUM(others.count)
  result = [...top10, { type: 'Other', count: otherCount, percentage: ROUND((otherCount / totalCases) * 100) }]
} else {
  result = sorted
}
```

**Example Array**:
```javascript
[
  { type: 'Immigration', count: 45, percentage: 32 },
  { type: 'Family Law', count: 32, percentage: 23 },
  { type: 'Criminal', count: 20, percentage: 14 },
  { type: 'Other', count: 10, percentage: 7 }
]
```

---

### Entity 5: AttorneyMetric

**Purpose**: Active case count per attorney with workload indicator

**Structure**:
```javascript
{
  attorney: String,        // Attorney email or 'Unassigned'
  count: Number,           // Number of active cases assigned to this attorney
  level: String            // Workload level: 'low' | 'medium' | 'high' | 'overloaded'
}
```

**Validation Rules**:
- `attorney` required, non-empty string
- `count` ≥ 0 (integer)
- `level` must be one of: 'low', 'medium', 'high', 'overloaded'
- Array sorted by count (descending)
- Only includes attorneys with active cases (status ≠ 'Closed')

**Workload Level Mapping**:
```javascript
if (count <= 10) level = 'low'
else if (count <= 20) level = 'medium'
else if (count <= 30) level = 'high'
else level = 'overloaded'
```

**Calculation Logic**:
```javascript
activeCases = FILTER(cases WHERE status ≠ 'Closed')
attorneyCounts = GROUP_BY(activeCases, 'assignedTo')

// Replace empty assignedTo with 'Unassigned'
for each attorney in attorneyCounts:
  if (attorney === '' or attorney === null):
    attorney = 'Unassigned'

  level = getWorkloadLevel(attorneyCounts[attorney])

sorted = SORT(attorneyCounts BY count DESC)
```

**Example Array**:
```javascript
[
  { attorney: 'john@example.com', count: 28, level: 'high' },
  { attorney: 'jane@example.com', count: 22, level: 'medium' },
  { attorney: 'bob@example.com', count: 15, level: 'medium' },
  { attorney: 'Unassigned', count: 8, level: 'low' }
]
```

---

### Entity 6: ResolutionMetric

**Purpose**: Statistical metrics for case resolution time

**Structure**:
```javascript
{
  average: Number,         // Average days to close (mean)
  median: Number,          // Median days to close
  min: Number,             // Fastest case closure (days)
  max: Number,             // Slowest case closure (days)
  percentile75: Number,    // 75th percentile (days)
  percentile90: Number,    // 90th percentile (days)
  count: Number            // Number of closed cases analyzed
}
```

**Validation Rules**:
- All fields ≥ 0 (integers)
- `min` ≤ `median` ≤ `average` ≤ `percentile75` ≤ `percentile90` ≤ `max`
- `count` ≥ 0 (can be 0 if no closed cases)
- If `count` === 0, all other fields should be 0

**Calculation Logic**:
```javascript
closedCases = FILTER(cases WHERE status === 'Closed')

resolutionTimes = []
for each case in closedCases:
  created = PARSE_DATE(case.createdAt)
  closed = PARSE_DATE(case.lastUpdatedAt) // Proxy for close date
  days = DAYS_BETWEEN(created, closed)
  if (days >= 0):
    resolutionTimes.push(days)

if (resolutionTimes.length === 0):
  return { average: 0, median: 0, min: 0, max: 0, percentile75: 0, percentile90: 0, count: 0 }

sorted = SORT(resolutionTimes ASC)
average = ROUND(SUM(sorted) / sorted.length)
median = sorted[FLOOR(sorted.length / 2)]
min = sorted[0]
max = sorted[sorted.length - 1]
percentile75 = sorted[FLOOR(sorted.length * 0.75)]
percentile90 = sorted[FLOOR(sorted.length * 0.90)]
count = sorted.length
```

**Example**:
```javascript
{
  average: 32,
  median: 28,
  min: 5,
  max: 120,
  percentile75: 45,
  percentile90: 67,
  count: 87
}
```

---

## Data Transformations

### Transformation 1: Case Data → Active Cases Metric

**Input**: Array of case objects from metadata sheet

**Output**: ActiveCasesMetric object

**Logic**:
1. Filter cases where status ≠ 'Closed' → current active count
2. Filter cases where status ≠ 'Closed' AND createdAt < 30 days ago → previous count
3. Calculate trend: (current - previous) / previous * 100
4. Determine direction: up/down/neutral
5. Return structured metric

**Pseudo-code**:
```javascript
function getActiveCasesMetric(cases) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)

  const currentActive = cases.filter(c => c.status !== 'Closed').length

  const previousCases = cases.filter(c => {
    const createdDate = new Date(c.createdAt)
    return createdDate < thirtyDaysAgo && c.status !== 'Closed'
  }).length

  const trend = calculateTrend(currentActive, previousCases)

  return {
    count: currentActive,
    trend: trend
  }
}
```

---

### Transformation 2: Case Data → Status Distribution

**Input**: Array of case objects

**Output**: Array of StatusMetric objects

**Logic**:
1. Group cases by status field
2. Count cases in each status group
3. Calculate percentage of total for each status
4. Return array of status metrics

**Pseudo-code**:
```javascript
function getCasesByStatus(cases) {
  const statusCounts = {}
  cases.forEach(c => {
    const status = c.status || 'Unknown'
    statusCounts[status] = (statusCounts[status] || 0) + 1
  })

  return Object.entries(statusCounts).map(([status, count]) => ({
    status: status,
    count: count,
    percentage: Math.round((count / cases.length) * 100)
  }))
}
```

---

### Transformation 3: Role-Based Filtering

**Input**: All cases + user context (email, role)

**Output**: Filtered array of cases based on role

**Logic**:
1. If user.role === 'ROLE_ADMIN' → return all cases
2. Else → filter cases where assignedTo === user.email
3. Return filtered array

**Pseudo-code**:
```javascript
function _getFilteredCases(userEmail, userRole) {
  const allCases = SheetsService.getAllCases()

  if (userRole === 'ROLE_ADMIN') {
    return allCases
  }

  return allCases.filter(c => c.assignedTo === userEmail)
}
```

---

## Caching Strategy

### Cache Entity: CachedMetrics

**Purpose**: Store calculated metrics in Google Apps Script Cache Service

**Structure**:
```javascript
{
  // Cache Key Pattern
  key: `dashboard_metrics_${userRole}_${userEmail}`

  // Cache Value (JSON stringified DashboardMetrics)
  value: JSON.stringify(DashboardMetrics)

  // TTL
  ttl: 300 seconds (5 minutes)
}
```

**Cache Key Examples**:
- Admin user: `dashboard_metrics_ROLE_ADMIN_admin@example.com`
- Regular user: `dashboard_metrics_ROLE_USER_john@example.com`

**Cache Invalidation**:
- Automatic after 5 minutes (TTL expiration)
- Manual via refresh button (bypasses cache, fetches fresh data, updates cache)

**Cache Hit Logic**:
```javascript
const cache = CacheService.getScriptCache()
const cacheKey = `dashboard_metrics_${userRole}_${userEmail}`

const cached = cache.get(cacheKey)
if (cached) {
  return JSON.parse(cached) // Cache hit
}

// Cache miss - calculate fresh metrics
const metrics = calculateMetrics(userEmail, userRole)
cache.put(cacheKey, JSON.stringify(metrics), 300)
return metrics
```

---

## Data Validation

### Backend Validation

**DashboardService.getAllMetrics()**:
- Validates user context exists (email, role)
- Validates cases array is not null
- Handles empty datasets gracefully (returns zeros, not errors)

**Example Error Handling**:
```javascript
getAllMetrics: function(userEmail, userRole) {
  if (!userEmail || !userRole) {
    throw new Error('User context required')
  }

  const cases = this._getFilteredCases(userEmail, userRole)

  if (!Array.isArray(cases)) {
    throw new Error('Failed to fetch cases')
  }

  // Handle empty dataset gracefully
  if (cases.length === 0) {
    return {
      activeCases: { count: 0, trend: { direction: 'neutral', percentage: 0, change: 0 } },
      casesByStatus: [],
      casesByType: [],
      casesPerAttorney: [],
      resolutionTime: { average: 0, median: 0, min: 0, max: 0, percentile75: 0, percentile90: 0, count: 0 },
      lastUpdated: new Date().toISOString()
    }
  }

  // Calculate metrics normally
  return {
    activeCases: this.getActiveCasesMetric(cases),
    casesByStatus: this.getCasesByStatus(cases),
    casesByType: this.getCasesByType(cases),
    casesPerAttorney: this.getCasesPerAttorney(cases),
    resolutionTime: this.getResolutionMetrics(cases),
    lastUpdated: new Date().toISOString()
  }
}
```

### Frontend Validation

**useDashboard.js composable**:
- Validates API response structure
- Handles network errors
- Handles empty/null metrics

**Example**:
```javascript
async function fetchMetrics() {
  isLoading.value = true
  error.value = null

  try {
    const response = await api.post('dashboard.getMetrics', {})

    if (!response || !response.success) {
      throw new Error(response?.message || 'Failed to fetch metrics')
    }

    if (!response.data || !response.data.metrics) {
      throw new Error('Invalid metrics data')
    }

    metrics.value = response.data.metrics
  } catch (err) {
    error.value = err
    metrics.value = null
    throw err
  } finally {
    isLoading.value = false
  }
}
```

---

## Data Flow Diagram

```
┌─────────────────────┐
│  Frontend           │
│  DashboardPage.vue  │
└──────────┬──────────┘
           │
           │ 1. fetchMetrics()
           │
           ▼
┌──────────────────────┐
│  Composable          │
│  useDashboard.js     │
└──────────┬───────────┘
           │
           │ 2. api.post('dashboard.getMetrics')
           │
           ▼
┌──────────────────────┐
│  API Layer           │
│  api.js              │
└──────────┬───────────┘
           │
           │ 3. POST request with JWT
           │
           ▼
┌──────────────────────────┐
│  Google Apps Script      │
│  doPost() → Router       │
└──────────┬───────────────┘
           │
           │ 4. Route to DashboardHandler
           │
           ▼
┌─────────────────────────────┐
│  Handler                    │
│  DashboardHandler.getMetrics│
└──────────┬──────────────────┘
           │
           │ 5. Call DashboardService
           │
           ▼
┌─────────────────────────────────┐
│  Service                        │
│  DashboardService.getAllMetrics │
└──────────┬──────────────────────┘
           │
           │ 6. Check cache
           │
     ┌─────┴─────┐
     │           │
 Cache hit   Cache miss
     │           │
     │           ▼
     │    ┌──────────────────┐
     │    │  Fetch & Filter  │
     │    │  Cases from      │
     │    │  SheetsService   │
     │    └────────┬─────────┘
     │             │
     │             │ 7. Aggregate metrics
     │             │
     │             ▼
     │    ┌──────────────────────┐
     │    │  Calculate:          │
     │    │  - Active Cases      │
     │    │  - Status Dist.      │
     │    │  - Type Dist.        │
     │    │  - Attorney Workload │
     │    │  - Resolution Time   │
     │    └────────┬─────────────┘
     │             │
     │             │ 8. Cache result
     │             │
     └─────┬───────┘
           │
           │ 9. Return DashboardMetrics
           │
           ▼
┌──────────────────────┐
│  Response Handler    │
│  Format JSON         │
└──────────┬───────────┘
           │
           │ 10. Return to frontend
           │
           ▼
┌──────────────────────┐
│  Frontend            │
│  Render charts       │
└──────────────────────┘
```

---

## Performance Considerations

### Data Volume

**Expected Data**:
- Cases: 100-500 records
- Clients: 50-200 records
- Attorneys: 5-10 users

**Impact**:
- Single `getDataRange()` call for all cases: ~0.5-1 second
- In-memory aggregation: < 100ms
- Total backend processing: < 2 seconds (including cache check)

### Optimization Strategies

1. **Batch Fetching**: Use single `getAllCases()` call instead of multiple queries
2. **In-Memory Processing**: All aggregations done in memory (no additional sheet reads)
3. **Caching**: 5-minute TTL reduces repeated calculations by ~83%
4. **Data Limiting**: Limit case types to top 10 + "Other"
5. **Early Returns**: Return immediately for empty datasets

---

## Schema Evolution

### Current Version: 1.0

**Baseline**: Initial implementation

**Fields**:
- All entities defined above

### Future Versions

**Planned Changes**:
1. **v1.1**: Add `deadline` field to metadata sheet
   - Enable Upcoming Deadlines widget
   - Add DeadlineMetric entity
2. **v1.2**: Add historical metrics storage
   - Store daily snapshots of metrics
   - Enable trend line charts
3. **v1.3**: Add custom workload thresholds
   - Let admins configure workload levels per role
   - Store in PropertiesService

**Migration Strategy**:
- All changes are additive (no breaking changes)
- Backend handles missing fields gracefully (returns default values)
- Frontend backward-compatible (checks for field existence)

---

## References

1. Feature Spec: [spec.md](./spec.md)
2. API Contracts: [contracts/dashboard-api.json](./contracts/dashboard-api.json)
3. Research Findings: [research.md](./research.md)

---

**Data Model Complete**: 2025-10-18
**Ready for**: API Contract Generation
