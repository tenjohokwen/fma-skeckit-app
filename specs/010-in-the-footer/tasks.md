---
description: "Task list for Footer Branding and Copyright feature"
---

# Tasks: Footer Branding and Copyright

**Input**: Design documents from `/specs/010-in-the-footer/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Constitution Compliance**: All tasks must adhere to the project constitution at `.specify/memory/constitution.md`. This includes:
- Using Vue 3 `<script setup>` and Composition API exclusively
- Plain JavaScript only (no TypeScript)
- Functional component splitting with single responsibility
- Component size limits (≤250 lines)
- Test file per component
- Design system adherence (colors, typography, layout)
- Performance requirements (lazy loading, efficient reactivity, cleanup)
- Accessibility and responsive design requirements

**Organization**: This feature has a single user story (P1), so all tasks are focused on delivering that complete, testable increment.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1 = User Story 1)
- File paths are absolute from repository root

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing project structure is ready for footer implementation

- [x] T001 [US1] Verify src/layouts/MainLayout.vue exists and is under 250 lines (currently 220 lines)
- [x] T002 [US1] Verify src/layouts/EmptyLayout.vue exists
- [x] T003 [US1] Verify Quasar `q-footer` component is available in project dependencies

**Checkpoint**: Project structure verified - ready for implementation

---

## Phase 2: User Story 1 - View Footer Attribution (Priority: P1) 🎯 MVP

**Goal**: Add footer with "Powered by Virtues Cafe | Copyright © [current year]" to all pages

**Independent Test**: Navigate to any page (login, dashboard, search, files) and verify footer displays branding, copyright symbol, and current year with proper styling

### Implementation for MainLayout (Authenticated Pages)

- [x] T004 [US1] Add computed property `currentYear` to MainLayout.vue script section using `new Date().getFullYear()`
- [x] T005 [US1] Add `<q-footer>` component to MainLayout.vue template before closing `</q-layout>` tag
- [x] T006 [US1] Style footer in MainLayout.vue using `bg-grey-2`, `text-grey-7`, `q-pa-sm`, and `text-caption` classes
- [x] T007 [US1] Add footer text content "Powered by Virtues Cafe | Copyright © {{ currentYear }}" to MainLayout.vue

### Implementation for EmptyLayout (Public Pages)

- [x] T008 [P] [US1] Add computed property `currentYear` to EmptyLayout.vue script section using `new Date().getFullYear()`
- [x] T009 [P] [US1] Add `<q-footer>` component to EmptyLayout.vue template before closing `</q-layout>` tag
- [x] T010 [P] [US1] Style footer in EmptyLayout.vue using `bg-grey-2`, `text-grey-7`, `q-pa-sm`, and `text-caption` classes
- [x] T011 [P] [US1] Add footer text content "Powered by Virtues Cafe | Copyright © {{ currentYear }}" to EmptyLayout.vue

### Testing & Verification

- [ ] T012 [P] [US1] Create test file src/layouts/MainLayout.spec.js (if not exists) and add test for footer rendering
- [ ] T013 [P] [US1] Add test case: "should render footer with branding and copyright" in MainLayout.spec.js
- [ ] T014 [P] [US1] Add test case: "should display current year in footer" in MainLayout.spec.js
- [ ] T015 [P] [US1] Create test file src/layouts/EmptyLayout.spec.js (if not exists) and add test for footer rendering
- [ ] T016 [P] [US1] Add test case: "should render footer with branding and copyright" in EmptyLayout.spec.js
- [ ] T017 [P] [US1] Add test case: "should display current year in footer" in EmptyLayout.spec.js
- [ ] T018 [US1] Run all tests with `npm test` and verify footer tests pass
- [x] T019 [US1] Run linter with `npm run lint` and fix any issues

### Manual Testing

- [ ] T020 [US1] Start dev server with `npm run dev` and verify footer appears on login page (EmptyLayout)
- [ ] T021 [US1] Login and verify footer appears on dashboard page (MainLayout)
- [ ] T022 [US1] Verify footer appears on search page (MainLayout)
- [ ] T023 [US1] Verify footer appears on files page (MainLayout)
- [ ] T024 [US1] Test footer responsiveness on mobile viewport (320px width)
- [ ] T025 [US1] Test footer responsiveness on tablet viewport (768px width)
- [ ] T026 [US1] Test footer responsiveness on desktop viewport (1920px width)
- [ ] T027 [US1] Verify footer text contrast meets WCAG AA standards using browser DevTools
- [ ] T028 [US1] Verify footer text is properly formatted with pipe separator visible

**Checkpoint**: User Story 1 complete - footer displays on all pages with correct branding, copyright, and current year

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Final quality checks and documentation updates

- [x] T029 [US1] Update CLAUDE.md with new feature documentation (add to "Recent Changes" section)
- [ ] T030 [US1] Take screenshots of footer on different page types for documentation (optional)
- [x] T031 [US1] Verify MainLayout.vue total line count is still under 250 lines (232 lines ✓)
- [x] T032 [US1] Verify EmptyLayout.vue total line count is still under 250 lines (36 lines ✓)
- [ ] T033 [US1] Run full test suite one final time with `npm test`
- [ ] T034 [US1] Commit changes with message: "feat: add footer branding and copyright to all pages"

**Final Checkpoint**: Feature complete and ready for deployment

---

## Dependencies

### User Story Dependencies
- **User Story 1**: No dependencies (independent)

### Task Dependencies Within User Story 1

**Sequential** (must be done in order within same file):
- T004 → T005 → T006 → T007 (MainLayout.vue changes)
- T008 → T009 → T010 → T011 (EmptyLayout.vue changes)

**Parallel Opportunities**:
- T004-T007 (MainLayout) can run in parallel with T008-T011 (EmptyLayout)
- T012-T014 (MainLayout tests) can run in parallel with T015-T017 (EmptyLayout tests)
- All manual testing tasks (T020-T028) can be done in any order after implementation complete

**Blocking**:
- T012-T017 (tests) require T004-T011 (implementation) to be complete
- T018-T019 (test execution) requires T012-T017 (test writing) to be complete
- T020-T028 (manual testing) requires T004-T011 (implementation) to be complete
- T029-T034 (polish) requires all previous tasks to be complete

---

## Parallel Execution Examples

### Example 1: Two developers working simultaneously

**Developer A** focuses on MainLayout:
```bash
# Checkout feature branch
git checkout 010-in-the-footer

# Implement tasks T004-T007
# Add currentYear computed property
# Add footer component
# Style footer
# Add footer text

# Write tests T012-T014
# Create MainLayout.spec.js
# Add footer rendering tests
# Add year calculation tests

# Commit MainLayout changes
git add src/layouts/MainLayout.vue src/layouts/MainLayout.spec.js
git commit -m "feat: add footer to MainLayout"
```

**Developer B** focuses on EmptyLayout (in parallel):
```bash
# Checkout feature branch
git checkout 010-in-the-footer

# Implement tasks T008-T011
# Add currentYear computed property
# Add footer component
# Style footer
# Add footer text

# Write tests T015-T017
# Create EmptyLayout.spec.js
# Add footer rendering tests
# Add year calculation tests

# Commit EmptyLayout changes
git add src/layouts/EmptyLayout.vue src/layouts/EmptyLayout.spec.js
git commit -m "feat: add footer to EmptyLayout"
```

After both complete:
```bash
# Run full test suite together
npm test

# Manual testing
npm run dev
# Test on login page (EmptyLayout)
# Test on dashboard (MainLayout)
# Test on search, files pages (MainLayout)

# Polish and finalize
npm run lint
# Update CLAUDE.md
git add .
git commit -m "feat: finalize footer branding feature"
```

### Example 2: Single developer (recommended for this simple feature)

```bash
# Implement MainLayout (T004-T007)
# Implement EmptyLayout (T008-T011)
# Write all tests (T012-T017)
# Run tests (T018-T019)
# Manual testing (T020-T028)
# Polish (T029-T034)

# Total estimated time: 30-45 minutes
```

---

## Implementation Strategy

### MVP Scope (User Story 1 only)
Since this feature consists of a single user story (P1), the entire feature IS the MVP. All tasks deliver the complete, independently testable increment.

### Incremental Delivery
This feature can be delivered incrementally:
1. **Increment 1**: MainLayout only (authenticated pages get footer)
2. **Increment 2**: EmptyLayout (public pages get footer) - completes feature

### Testing Strategy
- Unit tests verify footer component renders with correct text
- Unit tests verify year calculation uses current year
- Manual tests verify visual appearance and responsiveness
- Accessibility tests verify text contrast and semantics

### Success Criteria Verification

After completing all tasks, verify:
- ✅ **SC-001**: Footer displays on 100% of application pages (verify via manual testing T020-T023)
- ✅ **SC-002**: Footer text readable on all device sizes (verify via responsive testing T024-T026)
- ✅ **SC-003**: Copyright year updates automatically (verify via computed property implementation T004, T008)
- ✅ **SC-004**: Footer rendering has no performance impact (verify via browser DevTools during manual testing)
- ✅ **SC-005**: Users can easily identify "Virtues Cafe" branding (verify via manual testing)

---

## Summary

**Total Tasks**: 34
- Phase 1 (Setup): 3 tasks
- Phase 2 (User Story 1 Implementation): 25 tasks
  - MainLayout implementation: 4 tasks (T004-T007)
  - EmptyLayout implementation: 4 tasks (T008-T011)
  - Testing: 8 tasks (T012-T019)
  - Manual verification: 9 tasks (T020-T028)
- Phase 3 (Polish): 6 tasks (T029-T034)

**Parallel Opportunities**:
- MainLayout and EmptyLayout can be implemented simultaneously (8 tasks in parallel)
- MainLayout tests and EmptyLayout tests can be written simultaneously (6 tasks in parallel)
- Up to 14 tasks can run in parallel with proper coordination

**Estimated Time**:
- Single developer: 30-45 minutes
- Two developers (parallel): 20-30 minutes

**MVP**: User Story 1 (all tasks) - delivers complete footer branding feature

**Constitution Compliance**: All tasks follow Vue 3 Composition API, Plain JavaScript, Quasar components, design system colors/typography, and component size limits
