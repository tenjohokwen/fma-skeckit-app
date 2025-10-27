# Implementation Plan: Dashboard Access Parity for All Users

**Branch**: `016-as-a-user` | **Date**: 2025-10-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/016-as-a-user/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable non-admin users to view organization-wide dashboard analytics by removing role-based filtering in the backend DashboardService. Currently, non-admin users only see metrics from cases assigned to them, limiting visibility into firm-wide business operations. This feature will display identical aggregate metrics to all users while adding visual indicators to help users identify their personal workload within organization-wide data.

**Technical Approach**: Modify `gas/services/DashboardService.gs` to remove the role-based filtering in `_getFilteredCases()` method, update cache key strategy to be user-agnostic, and enhance frontend dashboard components to visually distinguish personal metrics within organization-wide data.

## Technical Context

**Language/Version**: JavaScript ES6+ (frontend), Google Apps Script JavaScript (backend)
**Primary Dependencies**: Vue 3, Quasar 2, Google Apps Script CacheService, Google Sheets API
**Storage**: Google Sheets (case data), CacheService (5-minute TTL for metrics)
**Testing**: Vitest + Vue Test Utils (frontend), Google Apps Script test functions (backend)
**Target Platform**: Web application (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application with frontend (Vue/Quasar) and backend (Google Apps Script)
**Performance Goals**: Dashboard load time < 3 seconds, cache hit rate improvement of 50%+
**Constraints**: Google Apps Script quota limits, 5-minute cache TTL, maintains existing security for edit operations
**Scale/Scope**: Small modification - 1 backend service file, 2-3 frontend components, 2 test files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ **PASS** - All applicable requirements met

### Core Principles Compliance

- [x] **Vue 3 Composition API**: Feature modifies existing dashboard components that already use `<script setup>` syntax
- [x] **Plain JavaScript**: All code will be plain JavaScript (no TypeScript)
- [x] **Functional Component Splitting**: Dashboard chart components already follow single responsibility pattern
- [x] **Quasar Integration**: Will continue using existing Quasar components for any UI enhancements
- [x] **Clean & Readable Code**: Existing dashboard components are under 250 lines; modifications will maintain this

### Testing Standards Compliance

- [x] **Component Isolation**: Will update existing component test files (DashboardPage.spec.js)
- [x] **Vitest + Vue Test Utils**: Tests will be written in plain JavaScript using Vitest
- [x] **Realistic Test Scenarios**: Will test both admin and non-admin user scenarios with edge cases

### UX Consistency Compliance

- [x] **Design System**: Will follow existing color palette and typography for any visual indicators added
- [x] **Quasar Design Language**: Will maintain consistent styling with existing dashboard
- [x] **Clear Feedback & States**: Dashboard already has loading states and error handling via `$q.notify()`
- [x] **Accessibility**: Will ensure any new visual indicators maintain WCAG AA contrast
- [x] **Responsive**: Dashboard is already responsive; modifications will maintain responsive design

### Performance Requirements Compliance

- [x] **Lazy Loading**: Dashboard page is already lazy loaded as a route component
- [x] **Efficient Reactivity**: Will use `computed` for any new derived state (personal metrics calculations)
- [x] **Network & Memory Hygiene**: Dashboard already properly handles cleanup; no new timers or listeners needed
- [x] **Bundle Awareness**: No new dependencies required; uses existing Quasar components

### Additional Requirements Compliance

- [x] **Mobile-First Design**: Dashboard already mobile-responsive; modifications will maintain this
- [x] **Internationalization**: Will add i18n keys for any new text ("My Cases", personal metrics labels)
- [x] **Progress Indicators**: Dashboard already has loading indicators; no changes needed

### Google Apps Script Architecture Compliance

- [x] **Project Structure**: Backend changes in `gas/services/DashboardService.gs` (correct location)
- [x] **Request Flow**: No changes to request flow; uses existing Security Interceptor → Router → Handler pattern
- [x] **Security**: Maintains existing token validation; only changes data filtering logic
- [x] **Response Format**: Maintains existing standardized response format; no API contract changes

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
# Backend (Google Apps Script)
gas/
├── services/
│   └── DashboardService.gs          # MODIFY: Remove role-based filtering
└── tests/
    └── test_feature_016.gs           # NEW: Test organization-wide metrics

# Frontend (Vue/Quasar)
src/
├── pages/
│   └── DashboardPage.vue             # MODIFY: Add personal metrics indicators
├── components/
│   └── dashboard/
│       ├── ActiveCasesWidget.vue     # MODIFY: Show personal vs org-wide count
│       └── CasesPerAttorneyChart.vue # MODIFY: Highlight current user
└── composables/
    └── useDashboard.js               # POTENTIALLY MODIFY: Cache handling

# Tests
tests/
└── components/
    └── DashboardPage.spec.js         # MODIFY: Add non-admin user tests
```

**Structure Decision**: This is a web application with separate frontend (Vue/Quasar) and backend (Google Apps Script) codebases. The feature primarily modifies existing files rather than creating new ones. Backend changes focus on `DashboardService.gs` to remove role-based filtering. Frontend changes enhance existing dashboard components to visually distinguish personal metrics within organization-wide data.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**N/A** - No constitution violations. All requirements are met by this feature.
