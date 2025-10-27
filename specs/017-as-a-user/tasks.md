---
description: "Implementation tasks for case-insensitive status handling in dashboard charts"
---

# Tasks: Case-Insensitive Status Handling in Dashboard Charts

**Feature**: 017-as-a-user | **Branch**: `017-as-a-user`
**Input**: Design documents from `/specs/017-as-a-user/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Constitution Compliance**: All tasks adhere to the project constitution at `.specify/memory/constitution.md`:
- Plain JavaScript only (Google Apps Script backend)
- Vue 3 `<script setup>` and Composition API (no frontend changes needed)
- Functional component splitting with single responsibility
- Test files per component
- Performance requirements (normalization adds <50ms overhead)

**Tests**: Backend tests are included as part of this feature to ensure normalization works correctly. Frontend tests are optional.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

## Path Conventions
- **Backend**: `gas/` directory for Google Apps Script files
- **Frontend**: `src/` directory for Vue components
- **Tests**: `gas/tests/` for backend tests, `src/components/dashboard/__tests__/` for frontend tests

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and verification

- [X] T001 Verify feature branch `017-as-a-user` is checked out
- [X] T002 [P] Review specification in `specs/017-as-a-user/spec.md` to understand requirements
- [X] T003 [P] Review implementation plan in `specs/017-as-a-user/plan.md` for technical approach
- [X] T004 [P] Review quickstart guide in `specs/017-as-a-user/quickstart.md` for step-by-step instructions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core status normalization infrastructure that MUST be complete before user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 [Foundational] Add `_normalizeStatus()` helper function to `gas/services/DashboardService.gs` (after line 8)
  - **Implementation**: Accept status string, handle null/undefined/empty → "Unknown"
  - **Logic**: Trim whitespace, convert to lowercase, split by spaces, capitalize first letter of each word, join
  - **Return**: Normalized status in title case (e.g., "Open", "In Progress", "Closed")

- [X] T006 [Foundational] Add status pre-normalization to `_calculateMetrics()` in `gas/services/DashboardService.gs` (after line 56)
  - **Implementation**: Add `cases.forEach(c => { c._normalizedStatus = this._normalizeStatus(c.status); });` before metrics calculation
  - **Purpose**: Normalize status once per case, cache in `_normalizedStatus` property for reuse
  - **Performance**: Avoids re-normalizing same status multiple times

**Checkpoint**: Status normalization infrastructure ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Normalized Status Display in Dashboard Charts (Priority: P1) 🎯 MVP

**Goal**: Consolidate all status value variations (e.g., "Closed", "CLOSED", "closed") into single categories in dashboard charts

**Independent Test**: Create test cases with mixed-case status values and verify dashboard charts consolidate all variations into single categories with correct total counts

### Tests for User Story 1

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T007 [P] [US1] Create backend test file `gas/tests/DashboardServiceTest.gs` with helper functions
  - **Implementation**: Add `assertEqual()` and `assertNotNull()` helper functions
  - **Purpose**: Test assertion utilities for Google Apps Script tests

- [X] T008 [P] [US1] Add `testNormalizeStatus()` test function in `gas/tests/DashboardServiceTest.gs`
  - **Test Cases**:
    - Basic normalization: "open" → "Open", "OPEN" → "Open", "Open" → "Open"
    - Multi-word: "in progress" → "In Progress", "IN PROGRESS" → "In Progress"
    - Whitespace: " open " → "Open", "  In Progress  " → "In Progress"
    - Empty/null: "" → "Unknown", null → "Unknown", undefined → "Unknown"
  - **Expected**: 8 assertions, all should FAIL before T005 implementation

- [X] T009 [P] [US1] Add `testGetCasesByStatusNormalization()` test function in `gas/tests/DashboardServiceTest.gs`
  - **Test Data**: Create array with mixed-case status values ("Open", "OPEN", "open", "Closed", "CLOSED")
  - **Pre-normalize**: Call `_normalizeStatus()` for each case and store in `_normalizedStatus`
  - **Test**: Call `getCasesByStatus()` and verify:
    - Result has exactly 2 status categories (not 5)
    - "Open" entry has count=3, percentage=60
    - "Closed" entry has count=2, percentage=40
  - **Expected**: 5 assertions, all should FAIL before T010 implementation

- [X] T010 [P] [US1] Add `runDashboardServiceTests()` function in `gas/tests/DashboardServiceTest.gs`
  - **Implementation**: Runner function that calls `testNormalizeStatus()` and `testGetCasesByStatusNormalization()`
  - **Purpose**: Single entry point to execute all dashboard service tests

### Implementation for User Story 1

- [X] T011 [US1] Update `getCasesByStatus()` method in `gas/services/DashboardService.gs` (lines 109-122)
  - **Change**: Replace `c.status` with `c._normalizedStatus` when building statusCounts
  - **Implementation**: `const status = c._normalizedStatus || 'Unknown';`
  - **Purpose**: Group cases by normalized status instead of raw status
  - **Expected**: Cases with "Open", "OPEN", "open" now counted together

- [ ] T012 [US1] Run backend tests in Google Apps Script editor ⚠️ MANUAL STEP
  - **Action**: Execute `runDashboardServiceTests()` function in Google Apps Script editor
  - **Expected**: All 13 assertions (8 from testNormalizeStatus + 5 from testGetCasesByStatusNormalization) should PASS
  - **Troubleshooting**: If tests fail, review normalization logic in T005 and aggregation logic in T011
  - **Note**: This must be executed manually in Google Apps Script editor after deploying code

- [ ] T013 [US1] Manual verification: Test with real dashboard data ⚠️ MANUAL STEP
  - **Action**: Run `DashboardService.getAllMetrics(userEmail, userRole)` in Apps Script editor
  - **Inspect**: Review `casesByStatus` array in output
  - **Expected**: Status labels are title case, no duplicate categories (e.g., no "Open" AND "OPEN")
  - **Note**: This must be executed manually in Google Apps Script editor after deploying code

**Checkpoint**: At this point, Cases by Status chart should consolidate mixed-case status values correctly

---

## Phase 4: User Story 2 - Consistent Status Display Across All Dashboard Charts (Priority: P2)

**Goal**: Apply status normalization consistently across ALL dashboard charts (Active Cases, Cases per Attorney, Resolution Metrics)

**Independent Test**: Verify that all dashboard charts use consistent normalized status labels by comparing status values across multiple charts

### Implementation for User Story 2

- [X] T014 [P] [US2] Update `getActiveCasesMetric()` method in `gas/services/DashboardService.gs` (line 88)
  - **Change**: Replace `c.status !== 'Closed'` with `c._normalizedStatus !== 'Closed'`
  - **Purpose**: Filter active cases using normalized status
  - **Impact**: Cases with status "closed", "CLOSED", "Closed" all excluded correctly

- [X] T015 [P] [US2] Update `getActiveCasesMetric()` previous period filter in `gas/services/DashboardService.gs` (line 93)
  - **Change**: Replace `c.status !== 'Closed'` with `c._normalizedStatus !== 'Closed'`
  - **Purpose**: Filter previous period cases using normalized status
  - **Impact**: Trend calculations now accurate regardless of status capitalization

- [X] T016 [P] [US2] Update `getCasesPerAttorney()` method in `gas/services/DashboardService.gs` (line 171)
  - **Change**: Replace `c.status !== 'Closed'` with `c._normalizedStatus !== 'Closed'`
  - **Purpose**: Filter active cases for attorney workload using normalized status
  - **Impact**: Attorney case counts now accurate

- [X] T017 [P] [US2] Update `getResolutionMetrics()` method in `gas/services/DashboardService.gs` (line 194)
  - **Change**: Replace `c.status === 'Closed'` with `c._normalizedStatus === 'Closed'`
  - **Purpose**: Filter closed cases for resolution time calculation using normalized status
  - **Impact**: Resolution metrics include all closed cases regardless of capitalization

- [ ] T018 [US2] Run backend tests again to verify no regressions ⚠️ MANUAL STEP
  - **Action**: Execute `runDashboardServiceTests()` function in Google Apps Script editor
  - **Expected**: All 13 assertions still PASS after changes to other methods
  - **Purpose**: Ensure changes to other methods didn't break getCasesByStatus
  - **Note**: This must be executed manually in Google Apps Script editor after deploying code

- [ ] T019 [US2] Manual verification: Compare status labels across all dashboard charts ⚠️ MANUAL STEP
  - **Action**: Open dashboard in browser after clearing cache
  - **Inspect**: Check all charts (Cases by Status, Active Cases count, Cases per Attorney, Resolution Time)
  - **Expected**: All charts use consistent title case labels (no "Open" in one chart and "OPEN" in another)
  - **Note**: This must be executed manually after deploying code and clearing dashboard cache

**Checkpoint**: All user stories should now be independently functional - status normalization applied consistently across entire dashboard

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Deployment preparation, cache management, and optional frontend tests

- [X] T020 [P] Create cache management utility `gas/utils/CacheUtil.gs`
  - **Implementation**: Add `clearDashboardCache()` function that removes 'dashboard_metrics_org_wide' from ScriptCache
  - **Purpose**: Manual cache invalidation after deploying status normalization changes
  - **Usage**: Run once after deployment to force fresh metrics calculation

- [ ] T021 Deploy backend changes to Google Apps Script ⚠️ MANUAL STEP
  - **Action**: Save and deploy `DashboardService.gs`, `DashboardServiceTest.gs`, and `CacheUtil.gs` changes
  - **Verify**: Check Apps Script editor for syntax errors
  - **Expected**: Deployment succeeds without errors
  - **Note**: This must be executed manually in Google Apps Script editor

- [ ] T022 Clear dashboard cache ⚠️ MANUAL STEP
  - **Action**: Run `clearDashboardCache()` function in `gas/utils/CacheUtil.gs`
  - **Purpose**: Invalidate old cached data so new normalized data is calculated
  - **Expected**: Log message "✅ Dashboard cache cleared - fresh metrics will be calculated on next request"
  - **Note**: This must be executed manually in Google Apps Script editor after T021

- [ ] T023 Frontend verification: Dashboard loads correctly ⚠️ MANUAL STEP
  - **Action**: Open dashboard in browser (Chrome, Firefox, Safari)
  - **Expected**: Dashboard loads without errors, charts render with normalized labels
  - **Troubleshooting**: Check browser console for errors, verify backend deployment
  - **Note**: This requires deployed code and cleared cache

- [ ] T024 [P] [Optional] Add frontend test for normalized data in `src/components/dashboard/__tests__/CasesByStatusChart.spec.js`
  - **Test Case**: Mount component with normalized status data
  - **Verify**: Chart labels are title case, no duplicate labels
  - **Note**: SKIPPED - This test is optional and frontend receives normalized data from backend automatically

- [X] T025 [P] Documentation: Update feature status in `specs/017-as-a-user/plan.md`
  - **Action**: Mark implementation as complete
  - **Include**: Implementation completed 2025-10-27, all code changes complete, ready for manual testing

- [X] T026 [P] Review validation steps available in `specs/017-as-a-user/quickstart.md`
  - **Checklist**: Backend tests, frontend verification, integration testing documented
  - **Purpose**: Validation steps are documented and ready for manual execution after deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
  - T005 and T006 MUST complete before any user story tasks
- **User Stories (Phase 3-4)**: Both depend on Foundational phase completion
  - US1 (Phase 3): Can start after T005 and T006 complete
  - US2 (Phase 4): Can start after T005 and T006 complete (independent of US1)
- **Polish (Phase 5)**: Depends on US1 and US2 completion

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (T005, T006) - No dependencies on US2
  - Fixes the primary chart (Cases by Status)
  - Can be deployed independently as MVP
- **User Story 2 (P2)**: Depends on Foundational (T005, T006) - Independent of US1
  - Extends normalization to other charts
  - Can be developed in parallel with US1 if desired
  - However, logical to implement after US1 for testing clarity

### Within Each User Story

**User Story 1**:
- T007, T008, T009, T010 (tests) can all run in parallel [P]
- Tests (T007-T010) MUST be written before implementation (T011)
- T011 (implementation) depends on T005 and T006 (foundational)
- T012 (test execution) depends on T011
- T013 (manual verification) depends on T012

**User Story 2**:
- T014, T015, T016, T017 (implementations) can all run in parallel [P]
- All four tasks depend on T005 and T006 (foundational)
- T018 (test execution) depends on T014-T017
- T019 (manual verification) depends on T018

### Parallel Opportunities

- **Phase 1 (Setup)**: T002, T003, T004 all marked [P] - can review docs in parallel
- **Phase 2 (Foundational)**: T005 and T006 are sequential (T006 uses T005)
- **Phase 3 (US1 Tests)**: T007, T008, T009, T010 all marked [P] - write tests in parallel
- **Phase 4 (US2 Implementation)**: T014, T015, T016, T017 all marked [P] - update methods in parallel
- **Phase 5 (Polish)**: T020, T024, T025, T026 all marked [P] - can run in parallel

---

## Parallel Example: User Story 1 Tests

```bash
# Launch all test creation tasks for User Story 1 together:
Task: "Create backend test file gas/tests/DashboardServiceTest.gs with helper functions"
Task: "Add testNormalizeStatus() test function"
Task: "Add testGetCasesByStatusNormalization() test function"
Task: "Add runDashboardServiceTests() function"

# All four test tasks can be written in parallel since they're in the same file
# but testing different aspects (or can be written sequentially if preferred)
```

## Parallel Example: User Story 2 Implementation

```bash
# Launch all method updates for User Story 2 together:
Task: "Update getActiveCasesMetric() method line 88"
Task: "Update getActiveCasesMetric() previous period filter line 93"
Task: "Update getCasesPerAttorney() method line 171"
Task: "Update getResolutionMetrics() method line 194"

# All four updates are independent changes to different parts of DashboardService.gs
# Can be done in parallel if carefully managing file edits
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T006) - **CRITICAL: Required for all user stories**
3. Complete Phase 3: User Story 1 (T007-T013)
4. **STOP and VALIDATE**:
   - Run backend tests (should have 13 passing assertions)
   - Test dashboard with mixed-case status data
   - Verify Cases by Status chart consolidates correctly
5. Deploy to production if ready (just US1)
6. **Result**: MVP delivers primary value - accurate Cases by Status chart

### Incremental Delivery

1. **Foundation** (T001-T006): Status normalization infrastructure → 2 hours
2. **MVP** (T007-T013): User Story 1 complete → 3 hours
   - Test independently: Cases by Status chart works correctly
   - Deploy/Demo if satisfied with US1
3. **Enhanced** (T014-T019): Add User Story 2 → 2 hours
   - Test independently: All charts now use normalized status
   - Deploy/Demo complete feature
4. **Polish** (T020-T026): Deployment and verification → 1 hour
5. **Total**: ~8 hours for complete feature

### Parallel Team Strategy

With two developers:

1. **Together**: Complete Setup (Phase 1) + Foundational (Phase 2)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T007-T013) - Fix Cases by Status chart
   - **Developer B**: User Story 2 (T014-T019) - Fix other charts
3. Both stories complete and integrate independently
4. **Together**: Polish and deploy (Phase 5)

**Time Savings**: ~2 hours (US1 and US2 developed in parallel instead of sequentially)

---

## Task Count Summary

- **Total Tasks**: 26
- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundational)**: 2 tasks (CRITICAL - blocks all user stories)
- **Phase 3 (User Story 1)**: 7 tasks (4 tests + 3 implementation/verification)
- **Phase 4 (User Story 2)**: 6 tasks (4 implementations + 2 verification)
- **Phase 5 (Polish)**: 7 tasks (deployment + verification + optional)
- **Parallel Opportunities**: 15 tasks marked [P] (58% can run in parallel)
- **Test Tasks**: 4 backend tests (required), 1 frontend test (optional)

---

## Notes

- **[P] tasks**: Different files or independent code sections, no dependencies
- **[Story] label**: Maps task to specific user story (US1, US2) for traceability
- **Each user story is independently completable and testable**
- **Backend-focused feature**: Frontend requires zero code changes (receives normalized data)
- **Verify tests fail before implementing**: TDD approach ensures tests are valid
- **Commit after each task or logical group**: Enables easy rollback if needed
- **Stop at any checkpoint to validate story independently**: Each phase is a deployable increment
- **Performance**: Status normalization adds <50ms overhead per metrics calculation (negligible)
- **Cache**: Existing 5-minute cache strategy maintained, must be cleared after deployment

---

## Success Criteria Checklist

Before considering this feature complete, verify:

- [ ] All 13 backend test assertions pass (8 for normalization + 5 for aggregation)
- [ ] Cases by Status chart shows title case labels (e.g., "Open", not "open" or "OPEN")
- [ ] No duplicate status categories in Cases by Status chart
- [ ] Active cases count accurately excludes all "Closed" variations
- [ ] Cases per Attorney chart uses normalized status for workload calculation
- [ ] Resolution metrics include all "Closed" variations in calculations
- [ ] All dashboard charts use consistent status labels (same capitalization)
- [ ] Dashboard cache successfully invalidated and regenerated
- [ ] Dashboard loads without errors in Chrome, Firefox, and Safari
- [ ] Original status values in Google Sheets remain unchanged (normalization is display-only)
