# Data Model: Dashboard Access Parity

**Feature**: 016-as-a-user
**Date**: 2025-10-27
**Purpose**: Document data structures and relationships for dashboard metrics

## Core Entities

### Dashboard Metrics (Aggregate)

**Description**: Aggregated analytics calculated from all cases in the system

**Source**: Calculated by `DashboardService.getAllMetrics()` from Google Sheets case data

**Attributes**:

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `activeCases` | Object | Active case count with trend | Required; includes count + trend object |
| `casesByStatus` | Array[StatusMetric] | Case distribution by status | Required; array of status metrics |
| `casesByType` | Array[TypeMetric] | Case distribution by type | Required; array of type metrics (max 10 + Other) |
| `casesPerAttorney` | Array[AttorneyMetric] | Workload distribution per attorney | Required; sorted by count descending |
| `resolutionTime` | Object | Resolution time statistics | Required; includes avg, median, percentiles |
| `lastUpdated` | String (ISO 8601) | Timestamp of last calculation | Required; UTC timestamp |

**Relationships**:
- **Derived from**: All Case entities in Google Sheets
- **Cached as**: Single entry with key `dashboard_metrics_org_wide`
- **Consumed by**: DashboardPage.vue and chart components

**Example**:
```javascript
{
  activeCases: {
    count: 150,
    trend: { direction: 'up', percentage: 12, change: 16 }
  },
  casesByStatus: [
    { status: 'Open', count: 85, percentage: 57 },
    { status: 'In Progress', count: 45, percentage: 30 },
    { status: 'Pending', count: 15, percentage: 10 },
    { status: 'Closed', count: 5, percentage: 3 }
  ],
  casesByType: [
    { type: 'Contract Review', count: 45, percentage: 30 },
    { type: 'Litigation', count: 30, percentage: 20 },
    // ... up to 10 types, plus "Other"
  ],
  casesPerAttorney: [
    { attorney: 'john@firm.com', count: 25, level: 'medium' },
    { attorney: 'jane@firm.com', count: 20, level: 'medium' },
    { attorney: 'bob@firm.com', count: 15, level: 'low' }
  ],
  resolutionTime: {
    average: 45,
    median: 38,
    min: 5,
    max: 120,
    percentile75: 60,
    percentile90: 90,
    count: 234
  },
  lastUpdated: '2025-10-27T14:30:00.000Z'
}
```

---

### Status Metric (Component)

**Description**: Count and percentage of cases with a specific status

**Attributes**:

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `status` | String | Status label | Required; non-empty string |
| `count` | Integer | Number of cases with this status | Required; >= 0 |
| `percentage` | Integer | Percentage of total cases (rounded) | Required; 0-100 |

**Validation Rules**:
- Sum of all `count` values equals total cases
- Sum of all `percentage` values ≈ 100 (allowing for rounding)

---

### Type Metric (Component)

**Description**: Count and percentage of cases with a specific type

**Attributes**:

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `type` | String | Case type label | Required; non-empty string |
| `count` | Integer | Number of cases of this type | Required; >= 0 |
| `percentage` | Integer | Percentage of total cases (rounded) | Required; 0-100 |

**Business Rules**:
- Maximum 10 specific types displayed
- Additional types grouped into single "Other" entry
- Sorted by count descending

---

### Attorney Metric (Component)

**Description**: Workload count and level for a specific attorney

**Attributes**:

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `attorney` | String | Attorney email address | Required; valid email format or "Unassigned" |
| `count` | Integer | Number of active cases assigned | Required; >= 0 |
| `level` | String (Enum) | Workload level assessment | Required; one of: 'low', 'medium', 'high', 'overloaded' |

**Workload Level Rules**:
- **low**: count <= 10
- **medium**: 11 <= count <= 20
- **high**: 21 <= count <= 30
- **overloaded**: count > 30

---

### Personal Metrics (Frontend-Calculated)

**Description**: User-specific metrics calculated from organization-wide data

**Source**: Computed on frontend by filtering `casesPerAttorney` array

**Attributes**:

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `myActiveCases` | Integer | Current user's active case count | >= 0 |
| `totalActiveCases` | Integer | Organization-wide active case count | >= myActiveCases |
| `myPercentage` | Integer | User's % of total workload (rounded) | 0-100 |

**Calculation Logic**:
```javascript
const currentUserEmail = authStore.user.email;
const userEntry = metrics.casesPerAttorney.find(
  attorney => attorney.attorney === currentUserEmail
);

personalMetrics = {
  myActiveCases: userEntry?.count || 0,
  totalActiveCases: metrics.activeCases.count,
  myPercentage: userEntry
    ? Math.round((userEntry.count / metrics.activeCases.count) * 100)
    : 0
};
```

**Edge Cases**:
- User has 0 assigned cases: `myActiveCases = 0`, `myPercentage = 0`
- User not found in attorney list: Same as 0 assigned cases
- No active cases in organization: `myPercentage = 0` (avoid division by zero)

---

### User (Auth Context)

**Description**: Authenticated user information from auth store

**Attributes**:

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `email` | String | User's email address | Required; valid email format |
| `role` | String (Enum) | User's access level | Required; one of: 'ROLE_ADMIN', 'ROLE_USER' |
| `name` | String | User's display name | Optional |

**Notes**:
- **BEFORE this feature**: `role` was used to filter dashboard data
- **AFTER this feature**: `role` no longer affects dashboard data filtering; all users see org-wide metrics
- `email` is still used to identify current user for personal metrics highlighting

---

## Data Flow

### Backend (Google Apps Script)

```
1. Client requests dashboard metrics
   ↓
2. DashboardHandler.getMetrics(context)
   ↓
3. DashboardService.getAllMetrics(userEmail, userRole)
   ↓
4. Check cache: CacheService.get('dashboard_metrics_org_wide')
   ↓
5a. Cache HIT → Return cached metrics
5b. Cache MISS → Calculate fresh metrics
   ↓
6. DashboardService._getFilteredCases(userEmail, userRole)
   ↓ [MODIFIED: No longer filters by user]
7. SheetsService.getAllCases()
   ↓
8. Calculate aggregate metrics (all 6 types)
   ↓
9. Store in cache: CacheService.put('dashboard_metrics_org_wide', metrics, 300s)
   ↓
10. Return metrics to client
```

### Frontend (Vue/Quasar)

```
1. DashboardPage.vue mounts
   ↓
2. useDashboard.fetchMetrics() calls API
   ↓
3. Receive organization-wide metrics
   ↓
4. Store in `metrics` ref
   ↓
5. Computed `personalMetrics` filters metrics by current user email
   ↓
6. Render:
   - Organization-wide charts (all users see same data)
   - Personal metrics badge/indicator (user-specific)
```

---

## State Transitions

### Cache State Machine

```
[Empty] --calculate--> [Cached (TTL: 5min)] --expire--> [Empty]
   ↑                                                        ↓
   └──────────────────── force refresh ────────────────────┘
```

**States**:
- **Empty**: No cache entry exists; next request triggers calculation
- **Cached**: Valid cache entry exists; served to all requests
- **Expired**: TTL elapsed; next request triggers recalculation

**Triggers**:
- **User requests dashboard**: Check cache → serve or calculate
- **Manual refresh button**: Force recalculation, update cache
- **TTL expires (5 minutes)**: Cache auto-evicts, next request calculates

---

## Validation Rules

### Organization-Wide Metrics

1. **Consistency**: All percentage fields across all metrics must be based on same total
2. **Completeness**: All 6 metric types (activeCases, casesByStatus, casesByType, casesPerAttorney, resolutionTime, lastUpdated) must be present
3. **Sorted**: `casesByType` and `casesPerAttorney` must be sorted by count descending
4. **Bounded**: All counts >= 0, all percentages 0-100

### Personal Metrics

1. **Subset**: `myActiveCases` <= `totalActiveCases`
2. **Match**: Personal count must match corresponding entry in `casesPerAttorney` array
3. **Graceful**: If user not found in attorney list, personal metrics default to 0

---

## Schema Changes

**None required** - This feature does not introduce new database schema or modify existing Google Sheets structure. All changes are computational (how data is filtered/cached) and presentational (how data is displayed).

---

## Migration Notes

### Cache Migration

**Before Deployment**:
- Cache keys: `dashboard_metrics_ROLE_ADMIN_user@example.com`, `dashboard_metrics_ROLE_USER_user@example.com`, etc.

**After Deployment**:
- Cache key: `dashboard_metrics_org_wide` (single entry)

**Migration Strategy**:
- **No explicit migration needed**
- Old cache entries will naturally expire after 5 minutes
- New cache key will be created on first request post-deployment
- No downtime or manual intervention required

### Data Compatibility

**Backward Compatible**: Yes
- API response format unchanged (same JSON structure)
- Frontend components already handle the data structure
- Only difference: non-admin users now receive full dataset instead of filtered subset
