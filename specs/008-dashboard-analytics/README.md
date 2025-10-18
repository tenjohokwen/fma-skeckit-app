# Feature 008: Dashboard Analytics & Charts

**Status**: Specification Complete
**Priority**: High
**Estimated Effort**: 6.5 days

---

## Quick Overview

Add 6 analytical charts to the existing Dashboard page showing business insights from case and client data.

---

## Problem

Users currently have no visibility into:
- Total active case count
- Case status distribution (Open vs. Pending vs. Closed)
- Practice area breakdown (Immigration, Family Law, etc.)
- Attorney workload balance
- Case resolution efficiency
- Upcoming deadlines

Manual reporting requires counting rows in Google Sheets.

---

## Solution

Enhance the existing Dashboard page with real-time analytics:

### 1. Total Active Cases Widget
- **Display**: Big number + trend arrow
- **Metric**: Count where status ≠ 'Closed'
- **Value**: Real-time workload snapshot

### 2. Cases by Status Chart
- **Display**: Stacked bar or pie chart
- **Metric**: Count per status (Open, Pending, In Progress, Closed)
- **Value**: Identify bottlenecks

### 3. Cases by Case Type Chart
- **Display**: Horizontal bar chart
- **Metric**: Count per caseType
- **Value**: Highlight practice area strengths

### 4. Cases per Attorney Chart
- **Display**: Vertical bar chart with color coding
- **Metric**: Active cases per attorney
- **Value**: Balance workloads, identify over/under-utilization

### 5. Case Resolution Time Chart
- **Display**: Box plot or bar chart
- **Metric**: Average days from createdAt to closure
- **Value**: Measure efficiency, set expectations

### 6. Upcoming Deadlines Widget (Optional)
- **Display**: Calendar view or list
- **Metric**: Cases nearing deadlines
- **Value**: Proactive deadline management
- **Note**: Requires adding `deadline` column to metadata sheet

---

## Key Features

✅ Real-time data from Google Sheets
✅ Responsive design (desktop + mobile)
✅ Role-based access (admin sees all, attorneys see only their cases)
✅ Auto-refresh (5-minute interval, togglable)
✅ Export functionality (future enhancement)
✅ 5-minute caching for performance

---

## Technical Stack

**Backend**:
- New service: `DashboardService.gs`
- New handler: `DashboardHandler.gs`
- New method in SheetsService: `getAllCases()`
- Caching: Google Apps Script Cache Service

**Frontend**:
- Update existing page: `DashboardPage.vue` (add analytics section)
- New composable: `useDashboard.js`
- Chart library: **ApexCharts** (recommended)
- 5 new chart components in `src/components/dashboard/`

**API**:
- Endpoint: `dashboard.getMetrics`
- Returns all metrics in single call
- Filters by user role (admin vs. attorney)

---

## Data Sources

**Primary**: `metadata` sheet
- caseId, caseName, clientId
- assignedTo, caseType, status
- createdAt, lastUpdatedAt
- (future: deadline column)

**Secondary**: `clients` sheet
- Used for context (future: client analytics)

---

## Implementation Phases

1. **Backend Setup** (2 days)
   - DashboardService with calculations
   - DashboardHandler with route
   - Unit tests

2. **Frontend Setup** (1 day)
   - useDashboard.js composable
   - Update DashboardPage.vue with analytics section
   - Install ApexCharts library

3. **Chart Components** (2 days)
   - 5 chart components using ApexCharts
   - Responsive layouts
   - Integration into existing dashboard

4. **Polish & Testing** (1 day)
   - Auto-refresh
   - Error handling
   - Role-based views
   - Preserve existing welcome section

5. **Deployment** (0.5 days)
   - i18n messages
   - Documentation
   - Deploy

**Total**: 6.5 days

**Note**: Dashboard route already exists; no routing changes needed

---

## Role-Based Access

| User Role | View |
|-----------|------|
| **Admin** | All cases, all attorneys, full dashboard |
| **Attorney** | Only their assigned cases, personalized metrics |

**Frontend Labels**:
- Admin: "Total Active Cases", "Cases per Attorney"
- Attorney: "My Active Cases", "My Resolution Time"

---

## Performance

**Optimizations**:
- ✅ 5-minute caching (Google Apps Script Cache Service)
- ✅ Single API call for all metrics
- ✅ Lazy-loaded chart components
- ✅ Debounced auto-refresh

**Targets**:
- Dashboard load: < 3 seconds
- Chart render: < 500ms

---

## Sample Charts

### Active Cases Widget
```
┌─────────────────────────────┐
│  Total Active Cases         │
│                             │
│         142  ↑ +12%         │
│                             │
│  vs. last month             │
└─────────────────────────────┘
```

### Cases by Status (Pie Chart)
```
┌─────────────────────────────┐
│  Cases by Status            │
│                             │
│       ╱───╲                 │
│      │ 142 │                │
│       ╲───╱                 │
│                             │
│  □ Open (45)                │
│  □ Pending (32)             │
│  □ In Progress (35)         │
│  □ Closed (30)              │
└─────────────────────────────┘
```

### Cases per Attorney (Bar Chart)
```
┌─────────────────────────────┐
│  Active Cases per Attorney  │
│                             │
│  ██                         │
│  ██  ██                     │
│  ██  ██  ██                 │
│  ──────────────             │
│  John Jane Bob              │
│  (28) (22) (15)             │
│                             │
│  Color: 🟢 Low, 🟡 Med,     │
│         🟠 High, 🔴 Overload │
└─────────────────────────────┘
```

---

## Dependencies

**Required**:
- Feature 006 (clientId column in metadata sheet)
- ApexCharts library: `npm install apexcharts vue3-apexcharts`

**Optional**:
- Feature 007 (client name enrichment) - Improves UX
- Feature 008b (deadline column) - For Upcoming Deadlines widget

---

## Success Metrics

1. **Adoption**: 80% of admins use dashboard weekly
2. **Performance**: Dashboard loads in < 3 seconds
3. **Time Savings**: 20% reduction in manual reporting time
4. **Accuracy**: 100% accuracy vs. manual sheet counts

---

## Future Enhancements

1. ⭐ Drill-down: Click chart to see case list
2. ⭐ Filters: Date range, case type, attorney
3. ⭐ Historical trends: Line charts over time
4. ⭐ PDF export
5. ⭐ Scheduled email reports
6. ⭐ Custom widgets (user-configurable)
7. ⭐ Deadline alerts
8. ⭐ Client analytics

---

## Files to Create/Update

### Backend (3 new files)
- `gas/services/DashboardService.gs` (~300 LOC)
- `gas/handlers/DashboardHandler.gs` (~50 LOC)
- `gas/tests/test_feature_008.gs` (~200 LOC)

### Frontend (1 updated + 6 new files)
- **Update** `src/pages/DashboardPage.vue` (~100 LOC added to existing ~35 LOC)
- **New** `src/composables/useDashboard.js` (~50 LOC)
- **New** `src/components/dashboard/ActiveCasesWidget.vue` (~80 LOC)
- **New** `src/components/dashboard/CasesByStatusChart.vue` (~100 LOC)
- **New** `src/components/dashboard/CasesByTypeChart.vue` (~100 LOC)
- **New** `src/components/dashboard/CasesPerAttorneyChart.vue` (~120 LOC)
- **New** `src/components/dashboard/ResolutionTimeChart.vue` (~120 LOC)

### Config Updates
- Update `src/i18n/en-US.js` (add dashboard messages)
- Update `src/i18n/fr-FR/index.js` (add French translations)
- Update `gas/utils/Router.gs` (add dashboard route)

**Total**: ~1,200 LOC

**Note**: No need to create new dashboard route in frontend - it already exists

---

## Next Steps

1. ✅ Specification complete
2. ✅ Updated to use existing dashboard page
3. ⏳ Team review and approval
4. ⏳ Create implementation plan (`plan.md`)
5. ⏳ Begin Phase 1: Backend setup
6. ⏳ Install ApexCharts: `npm install apexcharts vue3-apexcharts`

---

## Questions?

See [spec.md](spec.md) for complete technical specification including:
- Detailed data calculations
- Complete API specifications
- Chart type comparisons
- Security considerations
- Testing strategy

---

**Document Version**: 1.1
**Last Updated**: 2025-10-18
**Status**: Ready for Review
**Owner**: Development Team
**Changes in v1.1**: Updated to integrate charts into existing dashboard page instead of creating new page

