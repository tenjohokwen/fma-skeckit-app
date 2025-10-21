# Implementation Plan: Simplified UI - Remove File and Client Management Pages

**Branch**: `011-as-a-user` | **Date**: 2025-10-21 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/011-as-a-user/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature simplifies the application UI by removing two underutilized pages (FileManagementPage and ClientManagementPage) and their corresponding navigation entries. The goal is to reduce cognitive load for users by streamlining the interface to focus on core functionality: Dashboard, Search, Profile, and authentication flows. This is purely a frontend refactoring that removes UI components and routes without affecting backend APIs or shared components used by other pages.

## Technical Context

**Language/Version**: JavaScript ES6+ (frontend), Vue 3.5.20 with Composition API
**Primary Dependencies**: Vue 3, Quasar 2.16.0, Vue Router 4, Pinia 3, vue-i18n 11, Vite (build)
**Storage**: N/A (no data model changes - frontend only)
**Testing**: Vitest 3.2.4 + Vue Test Utils 2.4.6, Mocha (E2E with Selenium)
**Target Platform**: Web browsers (responsive design for desktop and mobile)
**Project Type**: Web application (single-page application with Vue + Quasar)
**Performance Goals**: Reduce bundle size by removing unused page components, improve route tree-shaking
**Constraints**: Must preserve all functionality of retained pages (Dashboard, Search, Profile, auth flows). Components must stay under 250 lines per constitution.
**Scale/Scope**: Small refactoring - removing 2 pages, 2 routes, 2 navigation menu items

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

- [x] **Vue 3 Composition API**: Feature uses `<script setup>` exclusively - NO NEW COMPONENTS (only removing existing compliant components)
- [x] **Plain JavaScript**: No TypeScript - feature only removes files, no new code
- [x] **Functional Component Splitting**: N/A - removing components, not creating new ones
- [x] **Quasar Integration**: N/A - only modifying existing MainLayout.vue navigation (already uses Quasar)
- [x] **Clean & Readable Code**: MainLayout.vue will be reduced from 233 to ~220 lines (removing menu items)

### Testing Standards Compliance

- [x] **Component Isolation**: Will remove test files for FileManagementPage and ClientManagementPage
- [x] **Vitest + Vue Test Utils**: No new tests required (removal only)
- [x] **Realistic Test Scenarios**: Existing tests for retained pages remain unchanged

### UX Consistency Compliance

- [x] **Design System**: No changes to design system - only removing navigation items
- [x] **Quasar Design Language**: Navigation menu uses existing Quasar q-item components (no changes)
- [x] **Clear Feedback & States**: No async operations in this feature
- [x] **Accessibility**: Removing menu items improves accessibility by reducing navigation complexity
- [x] **Responsive**: MainLayout drawer is already responsive (no changes to responsiveness)

### Performance Requirements Compliance

- [x] **Lazy Loading**: Route components already lazy loaded - removing unused routes improves tree-shaking
- [x] **Efficient Reactivity**: No new reactive state (only removing navigation items)
- [x] **Network & Memory Hygiene**: N/A - no network requests in this feature
- [x] **Bundle Awareness**: IMPROVES bundle size by removing 2 page components from build

### Additional Requirements Compliance

- [x] **Mobile-First Design**: No changes to mobile-first approach (drawer already responsive)
- [x] **Internationalization**: Navigation uses existing i18n keys - will update to remove unused keys
- [x] **Progress Indicators**: N/A - no async operations

### Google Apps Script Architecture Compliance (if applicable)

- [x] **Project Structure**: N/A - frontend-only changes, no GAS code affected
- [x] **Request Flow**: N/A - no backend changes
- [x] **Security**: N/A - no backend changes
- [x] **Response Format**: N/A - no backend changes

**GATE STATUS**: ✅ **PASS** - This is a pure removal/simplification feature with no constitution violations. Improves performance and UX by reducing bundle size and navigation complexity.

**POST-DESIGN RE-EVALUATION**: ✅ **CONFIRMED PASS** - After completing Phase 0 (Research) and Phase 1 (Design), all constitution checks remain valid. This feature:
- Removes code rather than adding it (reduces complexity)
- Requires no new components (no potential for violations)
- Modifies only MainLayout.vue navigation (minimal, under 250 lines)
- Improves bundle size through tree-shaking
- Has zero backend impact
- Maintains all existing UX standards on retained pages

No constitution violations introduced during design phase.

## Project Structure

### Documentation (this feature)

```
specs/011-as-a-user/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command - N/A for this feature)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command - N/A for this feature)
├── checklists/
│   └── requirements.md  # Specification quality checklist (completed)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── layouts/
│   ├── MainLayout.vue         # MODIFY: Remove "Files" and "Clients" navigation items
│   └── EmptyLayout.vue        # No changes
├── pages/
│   ├── DashboardPage.vue      # KEEP - No changes
│   ├── SearchPage.vue         # KEEP - No changes
│   ├── ProfilePage.vue        # KEEP - No changes
│   ├── HomePage.vue           # KEEP - No changes
│   ├── ErrorNotFound.vue      # KEEP - No changes
│   ├── auth/
│   │   ├── SignUpPage.vue     # KEEP - No changes
│   │   ├── LoginPage.vue      # KEEP - No changes
│   │   └── EmailVerificationPage.vue  # KEEP - No changes
│   ├── CaseDetailsPage.vue    # KEEP - No changes
│   ├── CaseEditPage.vue       # KEEP - No changes
│   ├── CaseFilesPage.vue      # KEEP - No changes (distinct from FileManagementPage)
│   ├── FileManagementPage.vue # REMOVE
│   └── ClientManagementPage.vue # REMOVE
├── router/
│   ├── routes.js              # MODIFY: Remove /files and /clients route definitions
│   └── index.js               # No changes (main router setup)
└── i18n/
    ├── en-US/index.js         # OPTIONAL: Remove unused translation keys for removed pages
    └── fr-FR/index.js         # OPTIONAL: Remove unused translation keys for removed pages

tests/
├── unit/
│   ├── FileManagementPage.spec.js     # REMOVE if exists
│   └── ClientManagementPage.spec.js   # REMOVE if exists
└── e2e/
    └── [selenium tests]        # VERIFY: No tests depend on removed pages
```

**Structure Decision**: This is a Vue 3 single-page web application following Option 2 (web application) structure. The frontend code lives in `src/` with pages, layouts, and router configuration. This feature primarily modifies routing and navigation by removing two page components and their menu entries. No backend changes are required since this is purely a frontend UI simplification.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations** - This feature simplifies the codebase by removing complexity rather than adding it. All constitution checks passed.
