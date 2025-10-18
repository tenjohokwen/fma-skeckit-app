# Feature 008: Dashboard Analytics & Charts

**Feature Name**: Dashboard Analytics & Charts
**Feature ID**: 008
**Date Created**: 2025-10-18
**Status**: Specification
**Priority**: High
**Estimated Effort**: 5-7 days

---

## Table of Contents

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Solution](#solution)
4. [User Stories](#user-stories)
5. [Functional Requirements](#functional-requirements)
6. [Chart Specifications](#chart-specifications)
7. [Data Sources & Calculations](#data-sources--calculations)
8. [Technical Design](#technical-design)
9. [UI/UX Design](#uiux-design)
10. [API Endpoints](#api-endpoints)
11. [Performance Considerations](#performance-considerations)
12. [Security & Access Control](#security--access-control)
13. [Testing Strategy](#testing-strategy)
14. [Implementation Phases](#implementation-phases)
15. [Dependencies](#dependencies)
16. [Success Metrics](#success-metrics)

---

## Overview

### Purpose

Provide users with visual business insights through interactive charts and metrics displayed on a dashboard page. The dashboard will aggregate data from the `metadata` and `clients` sheets to provide real-time analytics on case workload, status distribution, practice areas, attorney utilization, and case resolution efficiency.

### Key Features

- 6 interactive charts/visualizations
- Real-time data from Google Sheets
- Responsive design for desktop and mobile
- Role-based access (admin sees all, users see limited views)
- Auto-refresh capability
- Export functionality for reports

### Business Value

- **Workload Management**: Identify bottlenecks and balance attorney assignments
- **Efficiency Tracking**: Measure case resolution times
- **Practice Insights**: Understand case type distribution
- **Data-Driven Decisions**: Make informed staffing and resource allocation decisions
- **Client Communication**: Set realistic expectations based on historical data

---

## Problem Statement

### Current Challenges

1. **No Visibility**: Users cannot see aggregate case statistics without manually counting rows in sheets
2. **No Trends**: No way to track workload trends over time
3. **Unbalanced Workloads**: Cannot easily identify if attorneys are over/under-utilized
4. **No Efficiency Metrics**: Cannot measure how long cases take to resolve
5. **Manual Reporting**: Creating reports requires manual data extraction and Excel analysis

### User Pain Points

**For Administrators**:
- "I don't know how many active cases we have right now"
- "I can't tell which attorney is overloaded"
- "I need to manually count cases by status every week"

**For Attorneys**:
- "I want to see my case statistics at a glance"
- "I need to know our average resolution time"

**For Clients (indirect)**:
- Unrealistic expectations due to lack of historical data on case duration

---

## Solution

### High-Level Approach

Add 6 analytical charts to the existing Dashboard page that aggregate and visualize data from the `metadata` and `clients` sheets in real-time.

### Key Components

1. **Backend Analytics Service** (Google Apps Script)
   - Data aggregation functions
   - Statistical calculations
   - Caching for performance

2. **Dashboard API Endpoints**
   - `/dashboard.getMetrics` - Fetch all dashboard data
   - `/dashboard.getActiveCases` - Total active cases
   - `/dashboard.getCasesByStatus` - Status distribution
   - `/dashboard.getCasesByType` - Case type distribution
   - `/dashboard.getCasesPerAttorney` - Attorney workload
   - `/dashboard.getResolutionTimes` - Resolution metrics

3. **Frontend Dashboard Enhancements** (Vue 3 + Quasar)
   - Add chart components to existing DashboardPage.vue using ApexCharts
   - Responsive grid layout for charts
   - Auto-refresh controls
   - Export functionality

---

## User Stories

### US-001: View Active Cases Count
**As a** law firm administrator
**I want to** see the total number of active cases with a trend indicator
**So that** I can understand current workload at a glance

**Acceptance Criteria**:
- Display shows total count of cases where status ≠ 'Closed'
- Trend arrow shows increase/decrease from previous period
- Percentage change displayed
- Updates in real-time when refreshed

---

### US-002: View Cases by Status Distribution
**As a** law firm administrator
**I want to** see a visual breakdown of cases by status
**So that** I can identify bottlenecks (e.g., too many pending cases)

**Acceptance Criteria**:
- Chart shows count for each status: Open, Pending, In Progress, Closed, etc.
- Visual format is stacked bar or pie chart
- Each status has distinct color
- Clicking segment shows case list (optional enhancement)

---

### US-003: View Cases by Case Type
**As a** law firm administrator
**I want to** see case distribution by practice area (case type)
**So that** I can understand our firm's strengths and focus areas

**Acceptance Criteria**:
- Horizontal bar chart showing case count per case type
- Sorted by count (highest to lowest)
- Shows only case types with > 0 cases
- Hover shows percentage of total

---

### US-004: View Cases per Attorney
**As a** law firm administrator
**I want to** see active case distribution across attorneys
**So that** I can balance workloads and identify over/under-utilized staff

**Acceptance Criteria**:
- Bar chart showing active case count per assignedTo value
- Only shows attorneys with assigned cases
- Includes "Unassigned" category if applicable
- Color-coded to show workload levels (e.g., high load = red)

---

### US-005: View Case Resolution Time Metrics
**As a** law firm administrator
**I want to** see average and median case resolution times
**So that** I can measure efficiency and set client expectations

**Acceptance Criteria**:
- Shows average days to close for closed cases
- Shows median resolution time
- Box plot or bar chart visualization
- Can filter by case type or time period

---

### US-006: View Dashboard as Attorney
**As an** attorney
**I want to** see dashboard metrics filtered to my assigned cases
**So that** I can track my personal performance and workload

**Acceptance Criteria**:
- Non-admin users see filtered data (only their cases)
- Metrics adjust to show "My Active Cases," "My Resolution Time," etc.
- Cannot see other attorneys' data

---

## Functional Requirements

### FR-001: Total Active Cases Widget
**Priority**: P0 (Must Have)

**Description**: Display total count of active cases with trend indicator

**Data Source**: `metadata` sheet, `status` column

**Calculation**:
```javascript
activeCases = COUNT(cases WHERE status ≠ 'Closed')
previousPeriod = COUNT(cases WHERE status ≠ 'Closed' AND createdAt < 30 days ago)
trend = ((activeCases - previousPeriod) / previousPeriod) * 100
```

**Display**:
- Large number (primary metric)
- Trend arrow (↑ for increase, ↓ for decrease, → for no change)
- Percentage change (e.g., "+15%")
- Color coding (green for decrease, red for increase in active cases)

**Refresh Rate**: Manual refresh or auto-refresh every 5 minutes

---

### FR-002: Cases by Status Chart
**Priority**: P0 (Must Have)

**Description**: Visual breakdown of cases by status

**Data Source**: `metadata` sheet, `status` column

**Calculation**:
```javascript
statusCounts = {
  'Open': COUNT(cases WHERE status = 'Open'),
  'Pending': COUNT(cases WHERE status = 'Pending'),
  'In Progress': COUNT(cases WHERE status = 'In Progress'),
  'Closed': COUNT(cases WHERE status = 'Closed'),
  // ... other statuses
}
```

**Chart Type**: Stacked horizontal bar OR pie chart (configurable)

**Features**:
- Legend with status names and counts
- Tooltips showing percentage
- Click to filter (optional)

---

### FR-003: Cases by Case Type Chart
**Priority**: P0 (Must Have)

**Description**: Horizontal bar chart showing case distribution by practice area

**Data Source**: `metadata` sheet, `caseType` column

**Calculation**:
```javascript
typeCounts = {
  'Immigration': COUNT(cases WHERE caseType = 'Immigration'),
  'Family Law': COUNT(cases WHERE caseType = 'Family Law'),
  // ... other types
}
// Sort by count descending
```

**Chart Type**: Horizontal bar chart

**Features**:
- Only show types with > 0 cases
- Sorted highest to lowest
- Hover shows percentage of total
- Max 10 types, "Other" category for rest

---

### FR-004: Cases per Attorney Chart
**Priority**: P0 (Must Have)

**Description**: Bar chart showing active case workload per attorney

**Data Source**: `metadata` sheet, `assignedTo` column (only active cases)

**Calculation**:
```javascript
attorneyCounts = {
  'John Doe': COUNT(cases WHERE assignedTo = 'John Doe' AND status ≠ 'Closed'),
  'Jane Smith': COUNT(cases WHERE assignedTo = 'Jane Smith' AND status ≠ 'Closed'),
  'Unassigned': COUNT(cases WHERE assignedTo = '' AND status ≠ 'Closed')
}
```

**Chart Type**: Vertical bar chart

**Features**:
- Color coding by workload level:
  - Green: 0-10 cases
  - Yellow: 11-20 cases
  - Orange: 21-30 cases
  - Red: 31+ cases
- Sorted by case count
- Click to see case list (optional)

---

### FR-005: Case Resolution Time Chart
**Priority**: P1 (Should Have)

**Description**: Visualize average and median time to close cases

**Data Source**: `metadata` sheet, `createdAt` and `lastUpdatedAt` columns (for closed cases)

**Calculation**:
```javascript
closedCases = cases WHERE status = 'Closed'
resolutionTimes = closedCases.map(c => daysBetween(c.createdAt, c.lastUpdatedAt))

metrics = {
  average: mean(resolutionTimes),
  median: median(resolutionTimes),
  min: min(resolutionTimes),
  max: max(resolutionTimes),
  percentile75: percentile(resolutionTimes, 75),
  percentile90: percentile(resolutionTimes, 90)
}
```

**Chart Type**: Box plot OR grouped bar chart

**Features**:
- Shows average, median, and quartiles
- Can filter by case type
- Can filter by date range (last 30/60/90/365 days)

---

### FR-006: Upcoming Deadlines Widget
**Priority**: P2 (Nice to Have)

**Description**: Calendar view or list of cases nearing deadlines

**Data Source**:
- **Option A**: New `deadline` column in metadata sheet (requires schema change)
- **Option B**: Parse deadlines from `notes` field (less reliable)

**Calculation**:
```javascript
upcomingDeadlines = cases WHERE deadline IS NOT NULL AND deadline <= TODAY + 14 days
sorted by deadline ASC
```

**Display**:
- List of cases with deadline dates
- Color coding: Red (< 3 days), Orange (3-7 days), Yellow (8-14 days)
- Shows case name, assigned attorney, deadline date

**Note**: Requires adding `deadline` column to metadata sheet (Feature 008b)

---

### FR-007: Dashboard Data Refresh
**Priority**: P0 (Must Have)

**Functionality**:
- Manual refresh button
- Auto-refresh toggle (on/off)
- Auto-refresh interval: 5 minutes (configurable)
- Loading indicator during refresh
- Last updated timestamp

---

### FR-008: Export Dashboard Data
**Priority**: P2 (Nice to Have)

**Functionality**:
- Export button (PDF or CSV)
- Exports current dashboard view
- Includes all charts as images
- Adds timestamp and generated-by info

---

### FR-009: Role-Based Dashboard Views
**Priority**: P0 (Must Have)

**Admin View**:
- Sees all cases
- All metrics across entire firm
- Can view all attorneys' workloads

**Attorney View**:
- Sees only their assigned cases
- Metrics filtered to "My Cases"
- Cannot see other attorneys' data
- Charts show "My Active Cases", "My Resolution Time", etc.

**Implementation**:
```javascript
// Backend filters data by user role
if (user.role !== 'ROLE_ADMIN') {
  cases = cases.filter(c => c.assignedTo === user.email)
}
```

---

## Chart Specifications

### Chart 1: Total Active Cases

**Type**: Big Number Widget with Trend

**Layout**:
```
┌─────────────────────────────┐
│  Total Active Cases         │
│                             │
│         142  ↑ +12%        │
│                             │
│  vs. last month             │
└─────────────────────────────┘
```

**Data Points**:
- Current active case count
- Previous period count
- Percentage change
- Trend direction

**Visual Elements**:
- Large number (48px font)
- Arrow icon (up/down/neutral)
- Percentage with color (green/red)
- Subtitle text

---

### Chart 2: Cases by Status

**Type**: Stacked Horizontal Bar OR Donut Chart

**Option A - Stacked Bar**:
```
┌─────────────────────────────┐
│  Cases by Status            │
│                             │
│  [Open: 45][Pending: 32]   │
│  [In Progress: 35][Closed]  │
│                             │
│  Total: 142 cases           │
└─────────────────────────────┘
```

**Option B - Donut Chart**:
```
┌─────────────────────────────┐
│  Cases by Status            │
│                             │
│       ╱───╲                │
│      │ 142 │               │
│       ╲───╱                │
│                             │
│  □ Open  □ Pending          │
│  □ In Progress  □ Closed    │
└─────────────────────────────┘
```

**Data Points**:
- Count per status
- Percentage per status
- Total case count

**Colors**:
- Open: Blue (#2196F3)
- Pending: Orange (#FF9800)
- In Progress: Purple (#9C27B0)
- Closed: Green (#4CAF50)

---

### Chart 3: Cases by Case Type

**Type**: Horizontal Bar Chart

**Layout**:
```
┌─────────────────────────────┐
│  Cases by Practice Area     │
│                             │
│  Immigration    ████████ 45 │
│  Family Law     ██████ 32   │
│  Criminal       ████ 20     │
│  Corporate      ███ 15      │
│  Other          ██ 10       │
│                             │
└─────────────────────────────┘
```

**Data Points**:
- Case type name
- Count per type
- Percentage (on hover)

**Features**:
- Sorted descending by count
- Max 10 types shown
- "Other" category for remaining types
- Tooltips show exact count and percentage

---

### Chart 4: Cases per Attorney

**Type**: Vertical Bar Chart

**Layout**:
```
┌─────────────────────────────┐
│  Active Cases per Attorney  │
│                             │
│  ██                         │
│  ██  ██                     │
│  ██  ██  ██                 │
│  ██  ██  ██  ██             │
│  ──────────────             │
│  John Jane Bob  Unassigned  │
│  (28) (22) (15)    (8)      │
└─────────────────────────────┘
```

**Data Points**:
- Attorney name (or email if name not available)
- Active case count per attorney
- Workload level indicator (color)

**Colors**:
- Green: 0-10 cases (low)
- Yellow: 11-20 cases (medium)
- Orange: 21-30 cases (high)
- Red: 31+ cases (overloaded)

**Features**:
- Horizontal line at "ideal workload" (configurable, default 20)
- Sorted by case count
- Click to filter to attorney's cases (optional)

---

### Chart 5: Case Resolution Time

**Type**: Box Plot OR Grouped Bar Chart

**Option A - Box Plot**:
```
┌─────────────────────────────┐
│  Case Resolution Time       │
│  (Days to Close)            │
│                             │
│      ┬───┬─┬───┬            │
│      │   │ │   │            │
│  ────┴───┴─┴───┴────        │
│  0   15  30 45  60  90      │
│                             │
│  Avg: 32 days  Median: 28d  │
└─────────────────────────────┘
```

**Option B - Bar Chart**:
```
┌─────────────────────────────┐
│  Average Resolution Time    │
│  by Case Type               │
│                             │
│  Immigration     ████ 32d   │
│  Family Law      ███ 28d    │
│  Criminal        █████ 45d  │
│                             │
└─────────────────────────────┘
```

**Data Points**:
- Average resolution time (days)
- Median resolution time
- Min/Max values
- Percentiles (25th, 75th, 90th)

**Features**:
- Filter by case type
- Filter by date range (last 30/60/90/365 days)
- Shows only closed cases

---

### Chart 6: Upcoming Deadlines

**Type**: List Widget OR Calendar Heatmap

**Option A - List**:
```
┌─────────────────────────────┐
│  Upcoming Deadlines         │
│                             │
│  🔴 Case-001 | Oct 20       │
│     John Doe                │
│                             │
│  🟠 Case-002 | Oct 25       │
│     Jane Smith              │
│                             │
│  🟡 Case-003 | Oct 30       │
│     Bob Jones               │
└─────────────────────────────┘
```

**Option B - Calendar**:
```
┌─────────────────────────────┐
│  Deadlines This Month       │
│                             │
│  Mon Tue Wed Thu Fri        │
│   15  16  17  18  19        │
│   22  23  24  25  26        │
│        •   ••  •            │
└─────────────────────────────┘
```

**Data Points**:
- Case ID
- Case name
- Assigned attorney
- Deadline date
- Days until deadline

**Colors**:
- 🔴 Red: < 3 days
- 🟠 Orange: 3-7 days
- 🟡 Yellow: 8-14 days

**Note**: Requires `deadline` column in metadata sheet

---

## Data Sources & Calculations

### Data Source: Metadata Sheet

**Relevant Columns**:
- `caseId` (A)
- `caseName` (B)
- `clientId` (C)
- `assignedTo` (E) - Attorney email or name
- `caseType` (F) - Practice area
- `status` (G) - Open, Pending, In Progress, Closed, etc.
- `notes` (H) - May contain deadline info
- `createdBy` (I)
- `createdAt` (J) - Case creation timestamp
- `assignedAt` (K) - When case was assigned
- `lastUpdatedBy` (L)
- `lastUpdatedAt` (M) - Last update timestamp (proxy for close date)
- `version` (N)

**New Column (Optional for FR-006)**:
- `deadline` (O) - Case deadline date (YYYY-MM-DD)

---

### Data Source: Clients Sheet

**Usage**: Limited for Dashboard (mainly for context)

**Potential Use**:
- Client count over time
- Cases per client
- Client acquisition trends (future enhancement)

---

### Calculation Formulas

#### Active Cases
```javascript
function getActiveCasesCount(cases) {
  return cases.filter(c => c.status !== 'Closed').length;
}
```

#### Cases by Status
```javascript
function getCasesByStatus(cases) {
  const statusCounts = {};
  cases.forEach(c => {
    const status = c.status || 'Unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  return statusCounts;
}
```

#### Cases by Type
```javascript
function getCasesByType(cases) {
  const typeCounts = {};
  cases.forEach(c => {
    const type = c.caseType || 'Uncategorized';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  // Sort by count descending
  const sorted = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1]);

  return sorted;
}
```

#### Cases per Attorney
```javascript
function getCasesPerAttorney(cases) {
  const activeCases = cases.filter(c => c.status !== 'Closed');
  const attorneyCounts = {};

  activeCases.forEach(c => {
    const attorney = c.assignedTo || 'Unassigned';
    attorneyCounts[attorney] = (attorneyCounts[attorney] || 0) + 1;
  });

  return attorneyCounts;
}
```

#### Resolution Time
```javascript
function getResolutionMetrics(cases) {
  const closedCases = cases.filter(c => c.status === 'Closed');

  const resolutionTimes = closedCases.map(c => {
    const created = new Date(c.createdAt);
    const closed = new Date(c.lastUpdatedAt); // Proxy for close date
    const days = Math.floor((closed - created) / (1000 * 60 * 60 * 24));
    return days;
  }).filter(days => days >= 0); // Filter out invalid data

  if (resolutionTimes.length === 0) {
    return { average: 0, median: 0, min: 0, max: 0 };
  }

  const sorted = resolutionTimes.sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);

  return {
    average: Math.round(sum / sorted.length),
    median: sorted[Math.floor(sorted.length / 2)],
    min: sorted[0],
    max: sorted[sorted.length - 1],
    percentile25: sorted[Math.floor(sorted.length * 0.25)],
    percentile75: sorted[Math.floor(sorted.length * 0.75)],
    percentile90: sorted[Math.floor(sorted.length * 0.90)],
    count: sorted.length
  };
}
```

#### Trend Calculation
```javascript
function calculateTrend(currentValue, previousValue) {
  if (previousValue === 0) {
    return { change: 0, direction: 'neutral', percentage: '0%' };
  }

  const change = currentValue - previousValue;
  const percentage = Math.round((change / previousValue) * 100);
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

  return {
    change: change,
    direction: direction,
    percentage: `${percentage > 0 ? '+' : ''}${percentage}%`
  };
}
```

---

## Technical Design

### Backend Architecture

#### New Service: DashboardService.gs

**Location**: `gas/services/DashboardService.gs`

**Purpose**: Aggregate and calculate dashboard metrics

**Methods**:

```javascript
const DashboardService = {
  /**
   * Gets all dashboard metrics in one call
   * @param {string} userEmail - Current user's email (for role-based filtering)
   * @param {string} userRole - User's role (ROLE_ADMIN or ROLE_USER)
   * @returns {Object} All dashboard metrics
   */
  getAllMetrics: function(userEmail, userRole) {
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
   * Gets filtered cases based on user role
   * @private
   */
  _getFilteredCases: function(userEmail, userRole) {
    const allCases = SheetsService.getAllCases(); // New method needed

    if (userRole === 'ROLE_ADMIN') {
      return allCases;
    }

    // Filter to user's assigned cases only
    return allCases.filter(c => c.assignedTo === userEmail);
  },

  /**
   * Get active cases count with trend
   */
  getActiveCasesMetric: function(cases) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const currentActive = cases.filter(c => c.status !== 'Closed').length;

    const previousCases = cases.filter(c => {
      const createdDate = new Date(c.createdAt);
      return createdDate < thirtyDaysAgo && c.status !== 'Closed';
    }).length;

    const trend = this._calculateTrend(currentActive, previousCases);

    return {
      count: currentActive,
      trend: trend
    };
  },

  /**
   * Get cases grouped by status
   */
  getCasesByStatus: function(cases) {
    const statusCounts = {};

    cases.forEach(c => {
      const status = c.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status,
      count: count,
      percentage: Math.round((count / cases.length) * 100)
    }));
  },

  /**
   * Get cases grouped by type
   */
  getCasesByType: function(cases) {
    const typeCounts = {};

    cases.forEach(c => {
      const type = c.caseType || 'Uncategorized';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    // Sort by count descending, limit to top 10
    const sorted = Object.entries(typeCounts)
      .map(([type, count]) => ({
        type: type,
        count: count,
        percentage: Math.round((count / cases.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    // Group remaining into "Other"
    if (sorted.length > 10) {
      const top10 = sorted.slice(0, 10);
      const others = sorted.slice(10);
      const otherCount = others.reduce((sum, item) => sum + item.count, 0);

      top10.push({
        type: 'Other',
        count: otherCount,
        percentage: Math.round((otherCount / cases.length) * 100)
      });

      return top10;
    }

    return sorted;
  },

  /**
   * Get active cases per attorney
   */
  getCasesPerAttorney: function(cases) {
    const activeCases = cases.filter(c => c.status !== 'Closed');
    const attorneyCounts = {};

    activeCases.forEach(c => {
      const attorney = c.assignedTo || 'Unassigned';
      attorneyCounts[attorney] = (attorneyCounts[attorney] || 0) + 1;
    });

    return Object.entries(attorneyCounts)
      .map(([attorney, count]) => ({
        attorney: attorney,
        count: count,
        level: this._getWorkloadLevel(count)
      }))
      .sort((a, b) => b.count - a.count);
  },

  /**
   * Get workload level based on case count
   * @private
   */
  _getWorkloadLevel: function(count) {
    if (count <= 10) return 'low';
    if (count <= 20) return 'medium';
    if (count <= 30) return 'high';
    return 'overloaded';
  },

  /**
   * Get resolution time metrics
   */
  getResolutionMetrics: function(cases) {
    const closedCases = cases.filter(c => c.status === 'Closed');

    const resolutionTimes = closedCases.map(c => {
      const created = new Date(c.createdAt);
      const closed = new Date(c.lastUpdatedAt);
      return Math.floor((closed - created) / (1000 * 60 * 60 * 24));
    }).filter(days => days >= 0);

    if (resolutionTimes.length === 0) {
      return {
        average: 0,
        median: 0,
        min: 0,
        max: 0,
        count: 0
      };
    }

    const sorted = resolutionTimes.sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);

    return {
      average: Math.round(sum / sorted.length),
      median: sorted[Math.floor(sorted.length / 2)],
      min: sorted[0],
      max: sorted[sorted.length - 1],
      percentile75: sorted[Math.floor(sorted.length * 0.75)],
      percentile90: sorted[Math.floor(sorted.length * 0.90)],
      count: sorted.length
    };
  },

  /**
   * Calculate trend between two values
   * @private
   */
  _calculateTrend: function(current, previous) {
    if (previous === 0) {
      return { direction: 'neutral', percentage: 0, change: 0 };
    }

    const change = current - previous;
    const percentage = Math.round((change / previous) * 100);
    const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

    return {
      direction: direction,
      percentage: percentage,
      change: change
    };
  }
};
```

---

#### New Method in SheetsService.gs

Add `getAllCases()` method to retrieve all cases efficiently:

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

---

#### New Handler: DashboardHandler.gs

**Location**: `gas/handlers/DashboardHandler.gs`

**Methods**:

```javascript
const DashboardHandler = {
  /**
   * Get all dashboard metrics
   * @param {Object} context - Request context
   * @returns {Object} Response with all metrics
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

---

### Frontend Architecture

#### Enhanced DashboardPage.vue

**Location**: `src/pages/DashboardPage.vue`

**Current State**: The dashboard page exists with a simple welcome message showing user info

**Changes Needed**: Add analytical charts while preserving the existing welcome section

**Updated Structure**:

```vue
<template>
  <q-page class="q-pa-md">
    <!-- Existing Welcome Section (preserve) -->
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
          <!-- Future: Add more big number widgets -->
        </div>

        <!-- Row 2: Charts -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-6">
            <CasesByStatusChart :data="metrics.casesByStatus" />
          </div>
          <div class="col-12 col-md-6">
            <CasesByTypeChart :data="metrics.casesByType" />
          </div>
        </div>

        <!-- Row 3: More Charts -->
        <div class="row q-col-gutter-md">
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
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import { useDashboard } from 'src/composables/useDashboard'
import { useNotifications } from 'src/composables/useNotifications'
import ActiveCasesWidget from 'src/components/dashboard/ActiveCasesWidget.vue'
import CasesByStatusChart from 'src/components/dashboard/CasesByStatusChart.vue'
import CasesByTypeChart from 'src/components/dashboard/CasesByTypeChart.vue'
import CasesPerAttorneyChart from 'src/components/dashboard/CasesPerAttorneyChart.vue'
import ResolutionTimeChart from 'src/components/dashboard/ResolutionTimeChart.vue'

const authStore = useAuthStore()
const { metrics, isLoading, error, fetchMetrics } = useDashboard()
const { notifyError } = useNotifications()

const autoRefresh = ref(false)
let refreshInterval = null

async function handleRefresh() {
  try {
    await fetchMetrics()
  } catch (err) {
    notifyError(err.message || 'Failed to refresh dashboard')
  }
}

function formatTimestamp(timestamp) {
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

.dashboard-grid {
  /* Grid layout handled by Quasar row/col */
}
</style>
```

**Key Changes**:
- Preserve existing welcome section with user info
- Add new "Business Insights" analytics section below welcome
- Import and use dashboard composable
- Import chart components
- Add refresh controls and auto-refresh toggle
- Maintain existing structure and styling

---

#### New Composable: useDashboard.js

**Location**: `src/composables/useDashboard.js`

```javascript
import { ref } from 'vue'
import { api } from 'src/services/api'

export function useDashboard() {
  const metrics = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

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

---

#### Chart Components

**Location**: `src/components/dashboard/`

**Components to Create**:

1. **ActiveCasesWidget.vue** - Big number with trend
2. **CasesByStatusChart.vue** - Stacked bar or donut chart
3. **CasesByTypeChart.vue** - Horizontal bar chart
4. **CasesPerAttorneyChart.vue** - Vertical bar chart
5. **ResolutionTimeChart.vue** - Box plot or bar chart

**Chart Library**: ApexCharts (recommended) or Chart.js

**Installation**:
```bash
npm install apexcharts vue3-apexcharts
```

**Example Component - ActiveCasesWidget.vue**:

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
  // For active cases, decrease is good (green), increase is concerning (red)
  if (props.data.trend.direction === 'up') return 'negative'
  if (props.data.trend.direction === 'down') return 'positive'
  return 'grey'
})
</script>
```

---

## UI/UX Design

### Dashboard Layout

**Responsive Grid**:
- **Desktop (> 1024px)**: 2-column layout
- **Tablet (768-1024px)**: 2-column, stacked
- **Mobile (< 768px)**: Single column, stacked

**Component Hierarchy**:
```
DashboardPage (existing)
├── Welcome Section (existing - preserved)
│   ├── Dashboard icon
│   ├── Welcome message
│   └── User info (email, role)
└── NEW: Analytics Section
    ├── Section Header (title, refresh, auto-refresh toggle)
    ├── Row 1: Big Number Widgets
    │   └── ActiveCasesWidget
    ├── Row 2: Status & Type Charts
    │   ├── CasesByStatusChart
    │   └── CasesByTypeChart
    ├── Row 3: Attorney & Resolution Charts
    │   ├── CasesPerAttorneyChart
    │   └── ResolutionTimeChart
    └── Footer (last updated timestamp)
```

**Implementation Notes**:
- Existing welcome section remains unchanged
- Analytics section added below welcome section
- All new components are self-contained and can be added incrementally

---

### Color Palette

**Chart Colors**:
- Primary: #2196F3 (Blue)
- Secondary: #9C27B0 (Purple)
- Success: #4CAF50 (Green)
- Warning: #FF9800 (Orange)
- Error: #F44336 (Red)
- Info: #00BCD4 (Cyan)

**Status Colors**:
- Open: Blue
- Pending: Orange
- In Progress: Purple
- Closed: Green

**Workload Colors**:
- Low (0-10): Green
- Medium (11-20): Yellow
- High (21-30): Orange
- Overloaded (31+): Red

---

### Accessibility

1. **Color Contrast**: All text meets WCAG AA standards
2. **Alt Text**: Charts include descriptive labels
3. **Keyboard Navigation**: All interactive elements keyboard accessible
4. **Screen Reader**: ARIA labels for charts

---

## API Endpoints

### Endpoint: dashboard.getMetrics

**Method**: POST
**Route**: `dashboard.getMetrics`
**Authentication**: Required
**Authorization**: All authenticated users (filtered by role)

**Request**:
```json
{
  "action": "dashboard.getMetrics",
  "data": {}
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Dashboard metrics retrieved successfully",
  "msgKey": "dashboard.metrics.success",
  "data": {
    "metrics": {
      "activeCases": {
        "count": 142,
        "trend": {
          "direction": "up",
          "percentage": 12,
          "change": 15
        }
      },
      "casesByStatus": [
        { "status": "Open", "count": 45, "percentage": 32 },
        { "status": "Pending", "count": 32, "percentage": 23 },
        { "status": "In Progress", "count": 35, "percentage": 25 },
        { "status": "Closed", "count": 30, "percentage": 21 }
      ],
      "casesByType": [
        { "type": "Immigration", "count": 45, "percentage": 32 },
        { "type": "Family Law", "count": 32, "percentage": 23 },
        { "type": "Criminal", "count": 20, "percentage": 14 }
      ],
      "casesPerAttorney": [
        { "attorney": "john@example.com", "count": 28, "level": "high" },
        { "attorney": "jane@example.com", "count": 22, "level": "medium" },
        { "attorney": "Unassigned", "count": 8, "level": "low" }
      ],
      "resolutionTime": {
        "average": 32,
        "median": 28,
        "min": 5,
        "max": 120,
        "percentile75": 45,
        "percentile90": 67,
        "count": 87
      },
      "lastUpdated": "2025-10-18T10:30:00Z"
    }
  },
  "user": { "email": "user@example.com", "role": "ROLE_ADMIN" },
  "token": "new-jwt-token"
}
```

**Response** (Error):
```json
{
  "success": false,
  "message": "Failed to fetch dashboard metrics",
  "msgKey": "dashboard.metrics.error.server",
  "data": null
}
```

---

## Performance Considerations

### Backend Performance

**Challenge**: Aggregating all cases can be slow for large datasets

**Optimizations**:

1. **Caching**:
   - Cache dashboard metrics for 5 minutes
   - Use Google Apps Script Cache Service
   - Invalidate on case create/update

```javascript
const CACHE_KEY = 'dashboard_metrics';
const CACHE_TTL = 5 * 60; // 5 minutes

getAllMetrics: function(userEmail, userRole) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `${CACHE_KEY}_${userRole}_${userEmail}`;

  // Try to get from cache
  const cached = cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Calculate metrics
  const metrics = this._calculateMetrics(userEmail, userRole);

  // Store in cache
  cache.put(cacheKey, JSON.stringify(metrics), CACHE_TTL);

  return metrics;
}
```

2. **Lazy Loading**:
   - Load critical metrics first (active cases)
   - Load secondary metrics in parallel

3. **Data Pagination** (future):
   - For large datasets, consider pagination or time-based filtering

---

### Frontend Performance

1. **Chart Rendering**:
   - Use lightweight chart library (ApexCharts)
   - Lazy load chart components
   - Debounce auto-refresh

2. **State Management**:
   - Cache metrics in Pinia store
   - Only re-fetch when explicitly refreshed

3. **Code Splitting**:
   - Dashboard route lazy-loaded
   - Chart components lazy-loaded

---

## Security & Access Control

### Authentication

- All dashboard endpoints require valid JWT token
- Token validated and refreshed on each request

### Authorization

**Role-Based Access**:

| Role | Access Level |
|------|--------------|
| ROLE_ADMIN | All cases, all attorneys' data |
| ROLE_USER | Only their assigned cases |

**Implementation**:
```javascript
// Backend filters data by user role
if (user.role !== 'ROLE_ADMIN') {
  cases = cases.filter(c => c.assignedTo === user.email);
}
```

**Frontend Display**:
- Admins see: "Total Active Cases", "Cases per Attorney"
- Users see: "My Active Cases", "My Resolution Time"

---

### Data Privacy

- No client PII displayed on dashboard (only aggregates)
- Case IDs may be shown but not client names
- Attorney emails may be shown (internal users only)

---

## Testing Strategy

### Unit Tests (Backend)

**Test Coverage**:

1. **DashboardService.getAllCases()**
   - Returns all cases for admin
   - Returns filtered cases for user

2. **DashboardService.getActiveCasesMetric()**
   - Correctly counts active cases
   - Correctly calculates trend

3. **DashboardService.getCasesByStatus()**
   - Correctly groups by status
   - Calculates percentages correctly

4. **DashboardService.getCasesPerAttorney()**
   - Correctly groups by attorney
   - Correctly assigns workload levels

5. **DashboardService.getResolutionMetrics()**
   - Correctly calculates average, median, min, max
   - Handles empty data gracefully

**Test File**: `gas/tests/test_feature_008.gs`

---

### Integration Tests (Frontend)

1. **Dashboard Page Load**
   - Fetches metrics on mount
   - Displays loading state
   - Renders charts when data loaded

2. **Refresh Functionality**
   - Manual refresh button works
   - Auto-refresh toggle works
   - Auto-refresh interval correct (5 min)

3. **Role-Based Views**
   - Admin sees all data
   - User sees only their data
   - Labels adjust based on role

---

### Manual Testing

**Test Cases**:

1. View dashboard as admin → All metrics shown
2. View dashboard as user → Filtered metrics shown
3. Refresh dashboard → Data updates
4. Enable auto-refresh → Dashboard updates every 5 min
5. No cases exist → Dashboard shows zeros gracefully
6. Large dataset → Dashboard loads in acceptable time (< 3s)

---

## Implementation Phases

### Phase 1: Backend Setup (2 days)
- Create DashboardService.gs
- Add getAllCases() to SheetsService
- Create DashboardHandler.gs
- Add dashboard route to Router.gs
- Write unit tests

### Phase 2: Frontend Setup (1 day)
- Create useDashboard.js composable
- Install chart library (ApexCharts)
- Update existing DashboardPage.vue with analytics section structure
- Test basic data fetching

### Phase 3: Chart Components (2 days)
- Create ActiveCasesWidget.vue
- Create CasesByStatusChart.vue
- Create CasesByTypeChart.vue
- Create CasesPerAttorneyChart.vue
- Create ResolutionTimeChart.vue
- Integrate components into DashboardPage.vue

### Phase 4: Polish & Testing (1 day)
- Implement auto-refresh
- Add loading states
- Add error handling
- Responsive design
- Integration testing
- Ensure welcome section still works correctly

### Phase 5: Documentation & Deployment (0.5 days)
- Update i18n messages
- Update user documentation
- Deploy to production

**Total**: 6.5 days

**Note**: Dashboard route already exists, so no routing changes needed

---

## Dependencies

### External Dependencies

1. **Chart Library**:
   - **Option A**: ApexCharts (recommended)
     - `npm install apexcharts vue3-apexcharts`
   - **Option B**: Chart.js
     - `npm install chart.js vue-chartjs`

### Internal Dependencies

1. **Feature 006**: clientId column must exist
2. **Feature 007**: Client name enrichment (optional, improves UX)
3. **SheetsService**: Must have getAllCases() method

### Future Enhancements

1. **Feature 008b**: Add deadline column to metadata sheet (for Upcoming Deadlines chart)
2. **Feature 009**: Export dashboard as PDF
3. **Feature 010**: Historical trend charts (cases over time)

---

## Success Metrics

### User Adoption

- **Target**: 80% of admins use dashboard weekly
- **Measure**: Page views analytics

### Performance

- **Target**: Dashboard loads in < 3 seconds
- **Measure**: Frontend performance monitoring

### Business Impact

- **Target**: 20% reduction in time spent on manual reporting
- **Measure**: User survey

### Data Accuracy

- **Target**: 100% accuracy vs. manual sheet counts
- **Measure**: Automated tests + spot checks

---

## Open Questions

1. **Deadline Tracking**:
   - Add deadline column to metadata sheet? (Recommended: Yes)
   - Or parse from notes field? (Less reliable)

2. **Chart Preferences**:
   - Pie chart vs. bar chart for status?
   - Box plot vs. bar chart for resolution time?
   - User preference: Let users toggle chart types?

3. **Auto-Refresh Default**:
   - Should auto-refresh be ON or OFF by default?
   - Recommendation: OFF (to reduce API calls)

4. **Historical Data**:
   - Store historical metrics for trend analysis?
   - Or calculate trends on-the-fly?
   - Recommendation: Calculate on-the-fly for MVP, add historical storage later

5. **Export Format**:
   - PDF or CSV?
   - Recommendation: CSV for MVP (easier), PDF later

---

## Risks & Mitigation

### Risk 1: Slow Dashboard Load for Large Datasets

**Impact**: High
**Probability**: Medium
**Mitigation**:
- Implement caching (5-minute TTL)
- Add loading indicators
- Consider pagination or time-based filtering for very large datasets

---

### Risk 2: Chart Library Learning Curve

**Impact**: Medium
**Probability**: Medium
**Mitigation**:
- Choose well-documented library (ApexCharts)
- Start with simple charts, add complexity later
- Use pre-built examples

---

### Risk 3: Role-Based Filtering Complexity

**Impact**: Medium
**Probability**: Low
**Mitigation**:
- Thoroughly test role-based filtering
- Add comprehensive unit tests
- Document expected behavior clearly

---

### Risk 4: Data Privacy Concerns

**Impact**: High
**Probability**: Low
**Mitigation**:
- Ensure no client PII on dashboard (aggregate data only)
- Implement strict role-based access
- Security review before deployment

---

## Future Enhancements

1. **Drill-Down**: Click chart segments to see case list
2. **Filters**: Filter by date range, case type, attorney
3. **Historical Trends**: Line charts showing metrics over time
4. **Benchmarking**: Compare current period to previous periods
5. **Alerts**: Notify when metrics exceed thresholds (e.g., too many pending cases)
6. **PDF Export**: Generate PDF reports of dashboard
7. **Scheduled Reports**: Email dashboard summary daily/weekly
8. **Custom Widgets**: Let admins choose which charts to display
9. **Deadline Tracking**: Integrate with calendar for deadline reminders
10. **Client Analytics**: Charts showing client acquisition, retention, etc.

---

## Appendix

### A. Sample Data Structures

**getAllMetrics Response**:
```json
{
  "activeCases": {
    "count": 142,
    "trend": { "direction": "up", "percentage": 12, "change": 15 }
  },
  "casesByStatus": [
    { "status": "Open", "count": 45, "percentage": 32 },
    { "status": "Pending", "count": 32, "percentage": 23 }
  ],
  "casesByType": [
    { "type": "Immigration", "count": 45, "percentage": 32 }
  ],
  "casesPerAttorney": [
    { "attorney": "john@example.com", "count": 28, "level": "high" }
  ],
  "resolutionTime": {
    "average": 32,
    "median": 28,
    "min": 5,
    "max": 120,
    "count": 87
  },
  "lastUpdated": "2025-10-18T10:30:00Z"
}
```

---

### B. Color Reference

```javascript
const CHART_COLORS = {
  status: {
    'Open': '#2196F3',      // Blue
    'Pending': '#FF9800',   // Orange
    'In Progress': '#9C27B0', // Purple
    'Closed': '#4CAF50'     // Green
  },
  workload: {
    low: '#4CAF50',         // Green
    medium: '#FFC107',      // Yellow
    high: '#FF9800',        // Orange
    overloaded: '#F44336'   // Red
  },
  trend: {
    up: '#F44336',          // Red (for active cases, increase is bad)
    down: '#4CAF50',        // Green
    neutral: '#9E9E9E'      // Grey
  }
};
```

---

### C. Chart Library Comparison

| Feature | ApexCharts | Chart.js |
|---------|-----------|----------|
| Ease of Use | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Chart Types | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Customization | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Performance | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Vue Integration | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Documentation | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Recommendation**: ApexCharts (better out-of-the-box styling, more chart types)

---

**Document Version**: 1.1
**Last Updated**: 2025-10-18
**Status**: Specification Complete
**Next Step**: Team review and approval
**Estimated Implementation**: 6.5 days
**Changes in v1.1**: Updated to integrate charts into existing DashboardPage.vue instead of creating new page

