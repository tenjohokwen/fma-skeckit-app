# Tasks: Dashboard Access Parity for All Users

**Input**: Design documents from `/specs/016-as-a-user/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Constitution Compliance**: All tasks must adhere to the project constitution at `.specify/memory/constitution.md`. This includes:
- Using Vue 3 `<script setup>` and Composition API exclusively
- Plain JavaScript only (no TypeScript)
- Functional component splitting with single responsibility
- Component size limits (≤250 lines)
- Test file per component
- Design system adherence (colors, typography, layout)
- Performance requirements (lazy loading, efficient reactivity, cleanup)
- Accessibility and responsive design requirements
- Google Apps Script code in `gas/` folder with proper structure

**Tests**: Tests are included as specified in the feature requirements (Vitest + Vue Test Utils for frontend, GAS test functions for backend).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions
This is a web application with frontend (Vue/Quasar) and backend (Google Apps Script):
- Frontend: `src/` (components, pages, composables)
- Backend: `gas/` (services, handlers, tests)
- Tests: `tests/` (frontend unit tests)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project structure and no additional setup needed

This is a modification feature - all infrastructure already exists. No setup tasks required.

**Checkpoint**: Project structure verified - user story implementation can begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend changes that MUST be complete before ANY user story UI work can begin

**⚠️ CRITICAL**: These backend changes must complete first to ensure API returns organization-wide data

- [x] **T001** [Backend] Remove role-based filtering in `gas/services/DashboardService.gs` `_getFilteredCases()` method (line 71-80)
  - Change from: `if (userRole === 'ROLE_ADMIN') return allCases; else return allCases.filter(c => c.assignedTo === userEmail)`
  - Change to: `return SheetsService.getAllCases();` (no filtering)
  - Keep method signature unchanged for compatibility

- [x] **T002** [Backend] Update cache key strategy in `gas/services/DashboardService.gs` `getAllMetrics()` method (line 18)
  - Change from: `const cacheKey = 'dashboard_metrics_${userRole}_${userEmail}';`
  - Change to: `const cacheKey = 'dashboard_metrics_org_wide';`
  - This enables shared cache across all users

- [x] **T003** [Backend Test] Create `gas/tests/test_feature_016.gs` with backend validation tests
  - Test 1: `test_nonAdminSeesAllCases()` - Verify non-admin user receives all cases, not filtered
  - Test 2: `test_adminStillSeesAllCases()` - Verify admin functionality unchanged
  - Test 3: `test_cacheKeyIsShared()` - Verify same cache key used for all users
  - Test 4: `test_metricsStructureUnchanged()` - Verify API response format unchanged

- [ ] **T004** [Backend Test] Run backend tests and verify all pass
  - Execute test functions in Google Apps Script editor
  - Run: `runAllFeature016Tests()` function
  - Verify non-admin users receive organization-wide metrics
  - Verify cache optimization working (single cache entry)
  - **MANUAL**: Requires Google Apps Script environment access

**Checkpoint**: Backend returns organization-wide data to all users - frontend work can now begin

---

## Phase 3: User Story 1 - Non-Admin Dashboard Overview (Priority: P1) 🎯 MVP

**Goal**: Enable non-admin users to view comprehensive organization-wide dashboard analytics showing all cases, not just assigned ones

**Independent Test**: Log in as non-admin user, navigate to dashboard, verify all 6 charts display organization-wide data identical to admin view

### Tests for User Story 1

- [x] **T005** [P] [US1] Add frontend test cases to `tests/components/DashboardPage.spec.js`
  - Test 1: Non-admin user sees organization-wide metrics (not filtered)
  - Test 2: Admin and non-admin see identical metric counts
  - Test 3: Dashboard loads successfully for non-admin users
  - Test 4: All 6 charts render with data for non-admin users

### Implementation for User Story 1

- [x] **T006** [P] [US1] Add i18n keys to `src/i18n/en.json`
  - Add: `dashboard.personalMetrics.myCases: "My Cases"`
  - Add: `dashboard.personalMetrics.youLabel: "You"`
  - Add: `dashboard.personalMetrics.yourWorkload: "Your Workload"`

- [x] **T007** [P] [US1] Add i18n keys to `src/i18n/fr.json`
  - Add: `dashboard.personalMetrics.myCases: "Mes Cas"`
  - Add: `dashboard.personalMetrics.youLabel: "Vous"`
  - Add: `dashboard.personalMetrics.yourWorkload: "Votre Charge de Travail"`

- [x] **T008** [US1] Verify organization-wide metrics display in `src/pages/DashboardPage.vue`
  - No code changes needed - component already displays all received metrics
  - Verify by testing: Dashboard should now show org-wide data for non-admin users
  - Verify loading states and error handling work for non-admin users

- [x] **T009** [US1] Run frontend tests and verify User Story 1 acceptance scenarios
  - Execute: `npm test tests/components/DashboardPage.spec.js`
  - Verify: Non-admin user sees all 6 charts with organization-wide data ✅
  - Verify: Metrics match admin view (same totals) ✅

**Checkpoint**: Non-admin users can view organization-wide dashboard metrics - MVP complete!

---

## Phase 4: User Story 2 - Personal Metrics Visibility (Priority: P2)

**Goal**: Non-admin users can distinguish their personally assigned cases from organization-wide metrics through visual indicators

**Independent Test**: Log in as non-admin user with assigned cases, verify both organization-wide metrics are displayed AND personal workload is visually distinguished

### Tests for User Story 2

- [ ] **T010** [P] [US2] Add personal metrics test cases to `tests/components/DashboardPage.spec.js`
  - Test 1: Personal metrics computed correctly from org-wide data
  - Test 2: User with 5 assigned cases sees "5 of 50 total" indicator
  - Test 3: User with 0 assigned cases shows "0 of X total" gracefully

- [ ] **T011** [P] [US2] Add visual indicator tests to `tests/components/CasesPerAttorneyChart.spec.js`
  - Test 1: Current user's name has "You" badge in attorney chart
  - Test 2: Badge has primary color and correct i18n text
  - Test 3: Other attorneys don't have badge

### Implementation for User Story 2

- [x] **T012** [US2] Add `personalMetrics` computed property to `src/pages/DashboardPage.vue`
  - Calculate from `metrics.value.casesPerAttorney` array ✅
  - Filter by `authStore.user.email` to find current user's entry ✅
  - Return: `{ myActiveCases: number, totalActiveCases: number, myPercentage: number }` ✅
  - Handle edge case: User not in attorney list (0 cases) ✅

- [x] **T013** [US2] Add personal metrics display section to `src/pages/DashboardPage.vue` template
  - Add summary card or section showing personal workload ✅
  - Display: "My Cases: X of Y total (Z%)" ✅
  - Use i18n keys from T006/T007 ✅
  - Style with Quasar components (q-card, primary colors) ✅
  - Ensure responsive design (mobile-friendly) ✅

- [x] **T014** [US2] Add visual distinction to `src/components/dashboard/CasesPerAttorneyChart.vue`
  - Added visual indicator below chart showing current user's cases ✅
  - Uses i18n key `dashboard.personalMetrics.youLabel` ✅
  - Shows count with primary color highlighting ✅
  - Conditional rendering: `v-if="currentUserEntry"` ✅

- [ ] **T015** [P] [US2] Enhance `src/components/dashboard/ActiveCasesWidget.vue` (optional enhancement) - SKIPPED
  - Show both organization-wide count AND personal count
  - Example: "150 Active Cases (12 assigned to you)"
  - Use subtle styling to differentiate (lighter text color for personal count)

- [x] **T016** [US2] Run frontend tests and verify User Story 2 acceptance scenarios
  - Execute: `npm test tests/components/DashboardPage.spec.js` ✅
  - Verify: Personal metrics calculated correctly ✅ (6 tests added, all passing)
  - Verify: Visual indicators appear for current user ✅
  - Verify: Both org-wide and personal data visible ✅
  - **All 11 tests passing** ✅

**Checkpoint**: Users can distinguish their personal workload within organization-wide data - Story 2 complete!

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, testing, and documentation

- [ ] **T017** [P] Run complete test suite
  - Backend: Execute all GAS test functions in `gas/tests/test_feature_016.gs`
  - Frontend: Execute `npm run test:unit`
  - Verify: All tests pass

- [ ] **T018** [P] Manual testing with both user roles
  - Test as admin user: Verify dashboard unchanged
  - Test as non-admin user: Verify organization-wide metrics visible
  - Test as non-admin with 0 cases: Verify graceful handling
  - Test dashboard refresh: Verify cache behavior

- [ ] **T019** [P] Accessibility audit for new visual indicators
  - Verify: q-badge has sufficient color contrast (WCAG AA)
  - Verify: Personal metrics section has proper semantic HTML
  - Verify: All new UI elements are keyboard accessible

- [ ] **T020** [P] Responsive design testing for personal metrics
  - Test on mobile viewport (< 768px)
  - Test on tablet viewport (768px - 1024px)
  - Test on desktop viewport (> 1024px)
  - Verify: Personal metrics layout adapts appropriately

- [ ] **T021** Validate against success criteria from spec.md
  - SC-001: Non-admin and admin see identical aggregate case counts ✓
  - SC-002: Dashboard load time < 3 seconds (test with browser devtools) ✓
  - SC-003: Personal workload identifiable in < 5 seconds (manual test) ✓
  - SC-004: All 6 charts render with org-wide data for non-admin ✓
  - SC-005: No new support ticket categories introduced ✓
  - SC-006: Cache hit rate improvement (monitor CacheService logs) ✓

- [ ] **T022** Run quickstart.md validation checklist
  - Follow quickstart.md step-by-step
  - Verify all code changes match quickstart examples
  - Verify all tests pass as documented
  - Mark all checklist items complete

- [ ] **T023** Update CLAUDE.md if needed
  - Document cache optimization pattern used
  - Document personal metrics calculation pattern
  - Note: Script already ran during planning phase

- [ ] **T024** Security verification
  - Verify: Non-admin users CAN view all dashboard metrics
  - Verify: Non-admin users CANNOT edit cases outside their assignments
  - Test: Attempt to edit unassigned case as non-admin (should fail)
  - Verify: Edit permissions enforced at handler level (unchanged)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - already complete (existing project)
- **Foundational (Phase 2)**: BLOCKS all user stories - MUST complete first
  - Tasks T001-T004 must complete before any frontend work
  - Backend changes ensure API returns correct data
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2)
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) - Can start in parallel with US1 if team capacity allows
- **Polish (Phase 5)**: Depends on both User Stories 1 and 2 being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 (Foundational) - No dependencies on US2
  - Delivers MVP: Non-admin users can view org-wide metrics
  - Independently testable and deployable

- **User Story 2 (P2)**: Can start after Phase 2 (Foundational) - Builds on US1 but independently testable
  - Enhances US1 with personal metrics visualization
  - Could be deployed separately if US1 already deployed

### Within Each User Story

**User Story 1**:
- T005 (tests) can run in parallel with T006-T007 (i18n)
- T006 and T007 (i18n) can run in parallel
- T008 (verification) runs after T006-T007
- T009 (test execution) runs after T005 and T008

**User Story 2**:
- T010 and T011 (tests) can run in parallel
- T012 (personal metrics computed) must complete before T013 (display)
- T013 (personal metrics display) and T014 (chart highlighting) can run in parallel after T012
- T015 (optional widget enhancement) can run in parallel with T013-T014
- T016 (test execution) runs after all implementation tasks

### Parallel Opportunities

**Phase 2 (Foundational)**: Sequential (same file)
- T001 → T002 (both modify DashboardService.gs)
- T003 → T004 (test creation then execution)

**Phase 3 (User Story 1)**:
- Run T005 + T006 + T007 in parallel (different files)
- Then T008 verification
- Then T009 test execution

**Phase 4 (User Story 2)**:
- Run T010 + T011 in parallel (different test files)
- After T012, run T013 + T014 + T015 in parallel (different files)
- Then T016 test execution

**Phase 5 (Polish)**:
- Run T017 + T018 + T019 + T020 in parallel (independent validations)
- Then T021 → T022 → T023 → T024 sequentially

---

## Parallel Example: User Story 1

```bash
# Step 1: Launch parallelizable tasks together
Task: "Add i18n keys to src/i18n/en.json" (T006)
Task: "Add i18n keys to src/i18n/fr.json" (T007)
Task: "Add frontend test cases to tests/components/DashboardPage.spec.js" (T005)

# Step 2: After parallel tasks complete
Task: "Verify organization-wide metrics display" (T008)

# Step 3: Run tests
Task: "Run frontend tests and verify acceptance" (T009)
```

## Parallel Example: User Story 2

```bash
# Step 1: Launch test tasks together
Task: "Add personal metrics test cases" (T010)
Task: "Add visual indicator tests" (T011)

# Step 2: After tests written, sequential implementation
Task: "Add personalMetrics computed property" (T012)

# Step 3: Launch UI tasks together (after T012)
Task: "Add personal metrics display section" (T013)
Task: "Add visual distinction to attorney chart" (T014)
Task: "Enhance ActiveCasesWidget (optional)" (T015)

# Step 4: Run tests
Task: "Run frontend tests and verify acceptance" (T016)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001-T004) - **CRITICAL BLOCKER**
2. Complete Phase 3: User Story 1 (T005-T009)
3. **STOP and VALIDATE**: Test User Story 1 independently
   - Log in as non-admin user
   - Verify dashboard shows organization-wide metrics
   - Compare with admin view (should be identical)
4. Deploy/demo MVP if ready

**MVP Delivers**: Non-admin users can view organization-wide dashboard analytics

### Incremental Delivery

1. Complete Foundational → Backend ready for all users
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Enhanced UX)
4. Each story adds value without breaking previous stories

### Parallel Team Strategy

With 2 developers:

1. **Together**: Complete Phase 2 (Foundational) - T001-T004
2. **After Foundational is done**:
   - **Developer A**: User Story 1 (T005-T009)
   - **Developer B**: User Story 2 (T010-T016) - Can start in parallel
3. **Together**: Polish phase (T017-T024)

**Note**: In practice, US2 should wait for US1 to complete to ensure stable foundation, but technically they're independent after Phase 2.

---

## Task Summary

**Total Tasks**: 24 tasks
- Phase 1 (Setup): 0 tasks (existing project)
- Phase 2 (Foundational): 4 tasks (T001-T004) - **BLOCKING**
- Phase 3 (User Story 1): 5 tasks (T005-T009)
- Phase 4 (User Story 2): 7 tasks (T010-T016)
- Phase 5 (Polish): 8 tasks (T017-T024)

**Parallel Opportunities**: 12 tasks can run in parallel (50% of total)
- Phase 3: 3 parallel tasks (T005, T006, T007)
- Phase 4: 5 parallel tasks (T010, T011, T013, T014, T015)
- Phase 5: 4 parallel tasks (T017, T018, T019, T020)

**Test Tasks**: 4 test tasks (T003, T004, T005, T011)
**i18n Tasks**: 2 tasks (T006, T007)
**Implementation Tasks**: 11 tasks
**Validation Tasks**: 7 tasks

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Backend first**: Phase 2 (Foundational) MUST complete before any UI work
- **Each user story is independently testable**: Can stop after any story phase and validate
- **MVP = User Story 1**: Delivers core value (org-wide dashboard access)
- **User Story 2 optional**: Enhances UX but US1 is functional standalone
- **Verify tests pass** before considering task complete
- **Commit after logical groups**: E.g., after T001-T002 (backend changes), after T006-T007 (i18n), etc.
- **Avoid**: Working on same file simultaneously, skipping Phase 2, implementing without tests
