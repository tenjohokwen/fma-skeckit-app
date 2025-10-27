# Implementation Plan: Case-Insensitive Status Handling in Dashboard Charts

**Branch**: `017-as-a-user` | **Date**: 2025-10-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-as-a-user/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements case-insensitive status normalization for dashboard charts to ensure that status values like "Closed", "CLOSED", and "closed" are treated as a single category. The normalization will be implemented in the backend (Google Apps Script DashboardService) to aggregate status counts case-insensitively, while maintaining standardized title case display format in the frontend Vue components.

## Technical Context

**Language/Version**: JavaScript ES6+ (frontend), Google Apps Script JavaScript (backend)
**Primary Dependencies**: Vue 3, Quasar 2, ApexCharts (existing dashboard dependencies)
**Storage**: Google Sheets (existing case data storage)
**Testing**: Vitest + Vue Test Utils (frontend), Google Apps Script test functions (backend)
**Target Platform**: Web application (Chrome, Firefox, Safari)
**Project Type**: Web application (frontend Vue + backend Google Apps Script)
**Performance Goals**: Dashboard chart rendering <1s, status normalization adds <50ms overhead
**Constraints**: Backend changes must work with existing Google Sheets data structure, no schema migrations
**Scale/Scope**: Affects 2 dashboard charts (Cases by Status, metadata in other charts), ~10 GAS functions, ~3 Vue components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

- [x] **Vue 3 Composition API**: Feature uses `<script setup>` exclusively, no Options API or `export default`
  - *Existing dashboard chart components already use `<script setup>` syntax*
- [x] **Plain JavaScript**: No TypeScript syntax, interfaces, or type annotations
  - *No TypeScript in this feature, follows existing plain JavaScript pattern*
- [x] **Functional Component Splitting**: Each distinct feature is its own component with single responsibility
  - *No new components needed - modifications to existing single-purpose chart components*
- [x] **Quasar Integration**: Uses Quasar components and composables consistently
  - *Existing components already use Quasar consistently*
- [x] **Clean & Readable Code**: Components under 250 lines, reusable logic extracted to composables
  - *Changes will be backend-focused (GAS service layer), frontend changes minimal*

### Testing Standards Compliance

- [x] **Component Isolation**: Each component has its own dedicated test file
  - *Will create/update test files for modified components*
- [x] **Vitest + Vue Test Utils**: Tests written in plain JavaScript
  - *Tests will use existing Vitest + Vue Test Utils setup*
- [x] **Realistic Test Scenarios**: Tests simulate actual user flows with edge cases
  - *Will test mixed-case status values and verify normalization*

### UX Consistency Compliance

- [x] **Design System**: Follows color palette, typography, and layout structure specifications
  - *No visual changes - only data normalization logic*
- [x] **Quasar Design Language**: Consistent padding, typography, Material Icons
  - *No UI changes required*
- [x] **Clear Feedback & States**: Loading indicators, `$q.notify()` for errors, success confirmations
  - *Existing error handling remains in place*
- [x] **Accessibility**: Form labels, WCAG AA contrast, keyboard navigation
  - *No accessibility impact - backend data normalization only*
- [x] **Responsive**: Uses Quasar grid system, mobile-tested
  - *No responsive changes needed*

### Performance Requirements Compliance

- [x] **Lazy Loading**: Route components are async, heavy components dynamically imported
  - *No changes to component loading strategy*
- [x] **Efficient Reactivity**: Uses `computed` for derived state, debounced search inputs
  - *Existing computed properties remain efficient*
- [x] **Network & Memory Hygiene**: Cancels requests on unmount, cleans up timers/listeners
  - *No changes to lifecycle management*
- [x] **Bundle Awareness**: Imports only needed Quasar components, evaluates dependency impact
  - *No new dependencies required*

### Additional Requirements Compliance

- [x] **Mobile-First Design**: Designed for mobile viewports first
  - *No UI changes*
- [x] **Internationalization**: Supports English and French via i18n keys
  - *Existing i18n keys remain unchanged*
- [x] **Progress Indicators**: Displays indicators for all async operations
  - *Existing loading indicators remain in place*

### Google Apps Script Architecture Compliance (if applicable)

- [x] **Project Structure**: All GAS code written in `gas/` folder at project root
  - *Will modify existing `gas/services/DashboardService.gs`*
- [x] **Request Flow**: Follows Security Interceptor → Router → Handler → Response pattern
  - *No changes to request flow pattern*
- [x] **Security**: Validates tokens, uses PropertiesService for credentials
  - *No changes to security implementation*
- [x] **Response Format**: Returns standardized JSON with status, msgKey, message, data, token
  - *Existing response format maintained*

**✅ GATE PASSED**: All constitutional requirements satisfied. Feature requires backend logic changes to normalize status values before aggregation, with minimal frontend impact.

## Project Structure

### Documentation (this feature)

```
specs/017-as-a-user/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - Technical research and decisions
├── data-model.md        # Phase 1 output - Data structures and normalization rules
├── quickstart.md        # Phase 1 output - Implementation guide for developers
├── checklists/
│   └── requirements.md  # Specification validation checklist
└── spec.md              # Feature specification
```

### Source Code (repository root)

**Structure**: Web application (Vue 3 frontend + Google Apps Script backend)

```
gas/
├── services/
│   └── DashboardService.gs      # MODIFIED: Add _normalizeStatus(), update all methods
├── tests/
│   └── DashboardServiceTest.gs  # NEW: Backend tests for normalization
└── utils/
    └── CacheUtil.gs             # NEW: Cache management utilities

src/
├── components/
│   └── dashboard/
│       ├── CasesByStatusChart.vue      # No changes needed (receives normalized data)
│       ├── CasesPerAttorneyChart.vue   # No changes needed
│       └── __tests__/
│           └── CasesByStatusChart.spec.js  # OPTIONAL: Add normalization test
└── pages/
    └── DashboardPage.vue        # No changes needed
```

**Structure Decision**: This is a web application with Vue 3 frontend and Google Apps Script backend. The feature is primarily a backend change - status normalization happens in `DashboardService.gs` before data is sent to the frontend. Frontend components require no modifications as they already display status labels from the backend data.

## Complexity Tracking

*No violations - all constitutional requirements satisfied*

This feature introduces no architectural complexity. Implementation follows existing patterns:
- Backend changes isolated to DashboardService.gs
- No new dependencies or frameworks
- No changes to API contracts or response structures
- Frontend requires zero modifications (receives normalized data transparently)
