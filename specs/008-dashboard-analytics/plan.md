# Implementation Plan: Dashboard Analytics & Charts

**Branch**: `008-dashboard-analytics` | **Date**: 2025-10-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-dashboard-analytics/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add 6 analytical charts to the existing Dashboard page to provide real-time business insights from case and client data. The implementation includes a backend analytics service for data aggregation, API endpoints for metric retrieval, and interactive chart components using ApexCharts. Charts will display: (1) Total Active Cases with trend, (2) Cases by Status distribution, (3) Cases by Case Type, (4) Cases per Attorney with workload indicators, (5) Case Resolution Time metrics, and (6) optional Upcoming Deadlines widget. The feature supports role-based access (admin sees all data, users see only their assigned cases) and includes auto-refresh capabilities with 5-minute caching for performance.

## Technical Context

**Language/Version**:
- Frontend: JavaScript ES6+ (no TypeScript)
- Backend: Google Apps Script JavaScript

**Primary Dependencies**:
- Frontend: Vue 3, Quasar 2, Vue Router, Pinia, **ApexCharts** (new), vue3-apexcharts (new)
- Backend: Google Apps Script built-in services (Sheets, Cache)

**Storage**:
- Google Sheets (metadata sheet for case data, clients sheet for client data)
- Google Apps Script Cache Service (5-minute TTL for dashboard metrics)

**Testing**:
- Frontend: Vitest + Vue Test Utils (plain JavaScript)
- Backend: Google Apps Script test suite (gas/tests/test_feature_008.gs)

**Target Platform**:
- Web application (responsive design for desktop, tablet, mobile)
- Accessed via Google Apps Script web app deployment

**Project Type**: Web application with separate frontend (Vue/Quasar) and backend (Google Apps Script)

**Performance Goals**:
- Dashboard load time: < 3 seconds
- API response time: < 2 seconds (with caching)
- Chart rendering: < 500ms per chart
- Support concurrent users: 10-20 simultaneous dashboard views

**Constraints**:
- Must use Google Apps Script quota limits (daily runtime, URL fetch calls)
- Cache TTL: 5 minutes to balance freshness vs. performance
- Bundle size: Keep ApexCharts import minimal (tree-shake unused features)
- No real-time updates (auto-refresh at 5-minute intervals only)

**Scale/Scope**:
- Expected dataset: 100-500 cases, 50-200 clients
- 5-10 attorneys (users)
- 6 chart components + 1 composable + backend service
- Estimated ~1,200 LOC total

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

- [x] **Vue 3 Composition API**: Feature uses `<script setup>` exclusively, no Options API or `export default`
  - DashboardPage.vue, all chart components, and useDashboard.js composable use Composition API
- [x] **Plain JavaScript**: No TypeScript syntax, interfaces, or type annotations
  - All code written in plain JavaScript (.js, .vue files)
- [x] **Functional Component Splitting**: Each distinct feature is its own component with single responsibility
  - 5 separate chart components (ActiveCasesWidget, CasesByStatusChart, CasesByTypeChart, CasesPerAttorneyChart, ResolutionTimeChart)
  - Each component has single responsibility (display one specific chart)
- [x] **Quasar Integration**: Uses Quasar components and composables consistently
  - Uses q-page, q-btn, q-toggle, q-spinner-dots, q-banner, q-card throughout
  - Uses Quasar grid system (row, col-12, col-md-6, etc.)
- [x] **Clean & Readable Code**: Components under 250 lines, reusable logic extracted to composables
  - Each chart component estimated at 80-120 LOC
  - Dashboard logic extracted to useDashboard.js composable (~50 LOC)
  - DashboardPage.vue estimated at ~135 LOC total after adding analytics section

### Testing Standards Compliance

- [x] **Component Isolation**: Each component has its own dedicated test file
  - Backend: gas/tests/test_feature_008.gs for DashboardService tests
  - Frontend: tests for each chart component planned
- [x] **Vitest + Vue Test Utils**: Tests written in plain JavaScript
  - All frontend tests use Vitest + Vue Test Utils in plain JS
  - Backend tests use GAS test pattern (plain JS)
- [x] **Realistic Test Scenarios**: Tests simulate actual user flows with edge cases
  - Backend tests cover: empty data, single case, batch data, role-based filtering
  - Frontend tests will cover: loading states, error states, chart rendering, auto-refresh

### UX Consistency Compliance

- [x] **Design System**: Follows color palette, typography, and layout structure specifications
  - Uses primary blue (#2563eb), success green, error red from constitution
  - Chart colors defined: Blue, Orange, Purple, Green for statuses
  - Workload colors: Green (low), Yellow (medium), Orange (high), Red (overloaded)
- [x] **Quasar Design Language**: Consistent padding, typography, Material Icons
  - Uses Material Icons: dashboard, refresh, trending_up/down/flat, error
  - Consistent padding using Quasar spacing classes (q-pa-md, q-mb-lg, q-mt-md)
- [x] **Clear Feedback & States**: Loading indicators, `$q.notify()` for errors, success confirmations
  - Loading state: q-spinner-dots with "Loading analytics..." message
  - Error state: q-banner with error message
  - Success: Charts display with "Last updated" timestamp
- [x] **Accessibility**: Form labels, WCAG AA contrast, keyboard navigation
  - All interactive elements (buttons, toggle) are keyboard accessible
  - Chart colors use sufficient contrast
  - ARIA labels for charts planned via ApexCharts configuration
- [x] **Responsive**: Uses Quasar grid system, mobile-tested
  - Uses col-12 col-md-6, col-12 col-md-4 for responsive grid
  - Mobile: single column, Desktop: 2-column layout
  - Charts responsive via ApexCharts responsive configuration

### Performance Requirements Compliance

- [x] **Lazy Loading**: Route components are async, heavy components dynamically imported
  - Dashboard route already exists (lazy loaded)
  - Chart components will be imported normally (small components, needed immediately on dashboard)
  - ApexCharts library tree-shaken to include only used chart types
- [x] **Efficient Reactivity**: Uses `computed` for derived state, debounced search inputs
  - useDashboard composable returns computed/ref values
  - No inline functions in templates
  - Auto-refresh uses 5-minute interval (no excessive polling)
- [x] **Network & Memory Hygiene**: Cancels requests on unmount, cleans up timers/listeners
  - Auto-refresh interval cleared in onBeforeUnmount()
  - AbortController used for API requests (via existing api.js service)
- [x] **Bundle Awareness**: Imports only needed Quasar components, evaluates dependency impact
  - ApexCharts: 130KB gzipped (acceptable for data visualization library)
  - Only imports needed Quasar components (q-page, q-btn, q-toggle, q-spinner, q-banner, q-card)
  - Tree-shaking configured for ApexCharts

### Additional Requirements Compliance

- [x] **Mobile-First Design**: Designed for mobile viewports first
  - Grid uses col-12 (full width) for mobile, col-md-6/4 for desktop
  - Charts stack vertically on mobile, side-by-side on desktop
  - Touch-friendly controls (buttons, toggles)
- [x] **Internationalization**: Supports English and French via i18n keys
  - i18n keys planned for: dashboard.welcome, dashboard.refresh, dashboard.loading, dashboard.error
  - Chart labels will use i18n keys for status names, case types, etc.
- [x] **Progress Indicators**: Displays indicators for all async operations
  - Loading spinner shown during initial data fetch
  - Refresh button shows loading state
  - "Last updated" timestamp provides feedback

### Google Apps Script Architecture Compliance (if applicable)

- [x] **Project Structure**: All GAS code written in `gas/` folder at project root
  - gas/services/DashboardService.gs (new analytics service)
  - gas/handlers/DashboardHandler.gs (new handler for dashboard endpoints)
  - gas/tests/test_feature_008.gs (test suite)
- [x] **Request Flow**: Follows Security Interceptor → Router → Handler → Response pattern
  - Client → SecurityInterceptor → Router → DashboardHandler.getMetrics() → ResponseHandler → Client
  - Uses existing doPost() pattern with ResponseHandler.handle()
- [x] **Security**: Validates tokens, uses PropertiesService for credentials
  - dashboard.getMetrics endpoint requires authentication
  - Token validated by SecurityInterceptor before routing
  - Role-based data filtering in DashboardService
- [x] **Response Format**: Returns standardized JSON with status, msgKey, message, data, token
  - Returns: { success, message, msgKey, data: { metrics }, user, token }
  - Uses ResponseHandler.successWithToken() pattern
  - msgKey: 'dashboard.metrics.success' or 'dashboard.metrics.error.server'

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
# Web application structure (Vue 3 frontend + Google Apps Script backend)

# Backend (Google Apps Script)
gas/
├── services/
│   ├── DashboardService.gs          # NEW: Analytics aggregation service
│   ├── SheetsService.gs             # MODIFIED: Add getAllCases() method
│   └── ...
├── handlers/
│   ├── DashboardHandler.gs          # NEW: Dashboard endpoint handler
│   └── ...
├── utils/
│   ├── Router.gs                    # MODIFIED: Add dashboard.getMetrics route
│   └── ...
└── tests/
    ├── test_feature_008.gs          # NEW: Dashboard service tests
    └── ...

# Frontend (Vue 3 + Quasar)
src/
├── pages/
│   ├── DashboardPage.vue            # MODIFIED: Add analytics section
│   └── ...
├── components/
│   └── dashboard/                   # NEW: Dashboard chart components
│       ├── ActiveCasesWidget.vue    # NEW: Total active cases widget
│       ├── CasesByStatusChart.vue   # NEW: Status distribution chart
│       ├── CasesByTypeChart.vue     # NEW: Case type distribution chart
│       ├── CasesPerAttorneyChart.vue # NEW: Attorney workload chart
│       └── ResolutionTimeChart.vue  # NEW: Resolution metrics chart
├── composables/
│   ├── useDashboard.js              # NEW: Dashboard data fetching logic
│   └── ...
├── services/
│   ├── api.js                       # NO CHANGE: Uses existing API service
│   └── ...
└── i18n/
    ├── en-US.js                     # MODIFIED: Add dashboard messages
    └── fr-FR/
        └── index.js                 # MODIFIED: Add French dashboard messages

# Frontend tests
tests/
├── components/
│   └── dashboard/                   # NEW: Chart component tests
│       ├── ActiveCasesWidget.spec.js
│       ├── CasesByStatusChart.spec.js
│       └── ...
└── composables/
    └── useDashboard.spec.js         # NEW: Composable tests
```

**Structure Decision**: Web application with separate frontend and backend. Frontend uses Vue 3 + Quasar in `/src`, backend uses Google Apps Script in `/gas`. This matches the existing project structure. New files added to appropriate directories following established conventions.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations detected**. All constitution checks passed. This feature follows all established patterns and requirements.
