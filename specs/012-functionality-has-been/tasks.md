# Tasks: Update User Guide Documentation

**Input**: Design documents from `/specs/012-functionality-has-been/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Constitution Compliance**: This is a documentation-only feature with no code changes. All constitution checks are N/A. The updated documentation will be readable (under 750 lines), accessible (markdown is inherently accessible), and maintainable.

**Tests**: No automated tests required for this documentation feature. Validation is performed through manual verification against the running application.

**Organization**: Tasks are grouped by user story to enable independent implementation and verification of each documentation update.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different sections of the same file)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- **File**: `/docs/user-guide.md` for all tasks

## Path Conventions
- **Documentation**: `/docs/user-guide.md` (repository root)
- **Verification**: Running application at `http://localhost:9000` via `npm run dev`

---

## Phase 1: Setup (Initial Documentation Updates)

**Purpose**: Version metadata and preparation

- [x] T001 [Setup] Update version number from "Version 1.0" to "Version 1.1" in docs/user-guide.md
- [x] T002 [Setup] Update "Last Updated" date from "October 14, 2025" to "October 21, 2025" in docs/user-guide.md
- [x] T003 [Setup] Read through entire docs/user-guide.md to understand current structure (718 lines)

---

## Phase 2: User Story 3 - Update Navigation Menu Documentation (Priority: P1) 🎯

**Goal**: Accurately document the current 3-item navigation menu (Dashboard, Search, Profile) so users can quickly find pages that actually exist.

**Independent Test**: Compare documented menu structure against actual application menu at `http://localhost:9000` and verify they match exactly. Navigation should show Dashboard, Search, Profile with no Files or Clients entries.

### Implementation for User Story 3

- [x] T004 [US3] Locate "Navigation Menu" section in docs/user-guide.md (approximately lines 215-222)
- [x] T005 [US3] Update navigation menu list to show only 3 items: Dashboard, Search, Profile in docs/user-guide.md
- [x] T006 [US3] Add note: "Additional administrative functions may appear for admin users" in docs/user-guide.md
- [x] T007 [US3] Remove all references to "Files" menu item throughout docs/user-guide.md (search for "Files menu", "Files page")
- [x] T008 [US3] Remove all references to standalone "Clients" menu item throughout docs/user-guide.md (search for "Clients menu")
- [x] T009 [US3] Verify all "Accessing Features" navigation paths work correctly by testing against running application - READY FOR MANUAL TESTING

**Checkpoint**: Navigation menu documentation now accurately reflects 3 menu items. Verify against running app.

---

## Phase 3: User Story 1 - Remove Outdated File Management Documentation (Priority: P1) 🎯

**Goal**: Remove all documentation about the global "Files" menu and FileManagementPage to prevent user confusion when they cannot find features that no longer exist.

**Independent Test**: Search updated user guide for "Files", "File Management", "FileManagementPage", "global file browsing" and verify zero results. Documentation should only reference case-specific file management via CaseFilesPage.

### Implementation for User Story 1

- [x] T010 [US1] Locate "File Operations" section in docs/user-guide.md (approximately lines 420-473, ~53 lines)
- [x] T011 [US1] Remove entire "File Operations" section including all subsections and content in docs/user-guide.md
- [x] T012 [US1] Verify sections before and after deletion flow naturally together in docs/user-guide.md
- [x] T013 [US1] Search docs/user-guide.md for cross-references to "File Operations" section and remove/update them
- [x] T014 [US1] Search docs/user-guide.md for "FileManagementPage", "global file browsing", "browse all files" and remove all occurrences
- [x] T015 [US1] Verify "Case Management" section adequately documents case-specific file operations via CaseFilesPage
- [x] T016 [US1] If needed, add brief note in "Case Management" section: "Each case has a dedicated Files tab for uploading and managing case-specific documents"

**Checkpoint**: "File Operations" section completely removed, no orphaned references to global file management remain.

---

## Phase 4: User Story 2 - Remove Outdated Client Management Documentation (Priority: P2)

**Goal**: Remove or update documentation about standalone "Clients" page and ClientManagementPage to reflect that client operations are now handled through the Search page.

**Independent Test**: Read Admin Features section and verify no references to standalone "Clients" menu or ClientManagementPage. Documentation should explain that client management is performed through Search interface.

### Implementation for User Story 2

- [x] T017 [US2] Locate "Creating Client Folders" subsection in docs/user-guide.md (approximately lines 323-361, ~38 lines)
- [x] T018 [US2] Remove "Creating Client Folders" subsection that documents standalone ClientManagementPage from docs/user-guide.md
- [x] T019 [US2] Verify Search page documentation in docs/user-guide.md adequately covers client management operations
- [x] T020 [US2] If Search section lacks client management details, add brief guidance: "Use the Search page to find, create, and manage client folders" in docs/user-guide.md
- [x] T021 [US2] Search docs/user-guide.md for "ClientManagementPage", "standalone client management" and remove all occurrences
- [x] T022 [US2] Update Admin Features section to reflect integrated client operations through Search (not separate page) in docs/user-guide.md

**Checkpoint**: Client management documentation now accurately reflects Search page workflow, no references to standalone ClientManagementPage.

---

## Phase 5: User Story 4 - Add Dashboard Analytics Documentation (Priority: P3)

**Goal**: Add documentation for the 6 Dashboard analytics charts so users understand how to interpret the business insights displayed on the Dashboard.

**Independent Test**: Read Dashboard section and verify it explains purpose and interpretation of all 6 charts: Cases by Status, Monthly Case Trends, Cases by Country, Average Case Duration, Client Activity, Case Age Distribution.

### Implementation for User Story 4

- [x] T023 [US4] Locate "Dashboard Overview" section in docs/user-guide.md (approximately lines 440-505)
- [x] T024 [US4] Add new subsection heading "### Dashboard Analytics" after existing Dashboard content in docs/user-guide.md
- [x] T025 [P] [US4] Document "Cases by Status" chart (donut chart showing distribution across status categories) in docs/user-guide.md
- [x] T026 [P] [US4] Document "Monthly Case Trends" chart (area chart showing case volume over time) in docs/user-guide.md
- [x] T027 [P] [US4] Document "Cases by Country" chart (bar chart showing geographic distribution) in docs/user-guide.md
- [x] T028 [P] [US4] Document "Average Case Duration" chart (bar chart showing time to close cases) in docs/user-guide.md
- [x] T029 [P] [US4] Document "Client Activity" chart (bar chart showing cases per client) in docs/user-guide.md
- [x] T030 [P] [US4] Document "Case Age Distribution" chart (column chart showing how long cases have been open) in docs/user-guide.md
- [x] T031 [US4] Verify each chart description is concise (2-3 sentences) and consistently formatted in docs/user-guide.md
- [x] T032 [US4] Verify total analytics documentation is approximately 50 lines in docs/user-guide.md

**Checkpoint**: All 6 Dashboard analytics charts documented with clear descriptions of type, data displayed, and how to interpret.

---

## Phase 6: Table of Contents and Final Cleanup

**Purpose**: Update Table of Contents to reflect all structural changes and ensure document coherence

- [x] T033 [Polish] Locate Table of Contents section in docs/user-guide.md (near top of document)
- [x] T034 [Polish] Remove ToC entry for "File Operations" section from docs/user-guide.md
- [x] T035 [Polish] Remove ToC entry for "Creating Client Folders" subsection from docs/user-guide.md
- [x] T036 [Polish] Add new ToC entry for "Dashboard Analytics" subsection under Dashboard section in docs/user-guide.md
- [x] T037 [Polish] Verify all ToC anchor links (`#section-name`) match actual heading IDs in docs/user-guide.md
- [x] T038 [Polish] Verify ToC structure reflects updated document organization in docs/user-guide.md

---

## Phase 7: Quality Assurance and Validation

**Purpose**: Final verification that all changes are correct and complete

- [x] T039 [Polish] Check final line count of docs/user-guide.md: should be ~570-620 lines (down from 718)
- [x] T040 [Polish] Read through entire docs/user-guide.md for flow and coherence
- [x] T041 [Polish] Verify all section transitions are smooth after removals in docs/user-guide.md
- [x] T042 [Polish] Check for consistent terminology throughout docs/user-guide.md
- [x] T043 [Polish] Verify markdown formatting is correct (headings, lists, links, code blocks) in docs/user-guide.md
- [x] T044 [Polish] Ensure no placeholder text like "TODO" or "NEEDS UPDATE" remains in docs/user-guide.md
- [x] T045 [Polish] Search docs/user-guide.md for "As mentioned in File Operations" or similar orphaned cross-references and remove
- [x] T046 [Polish] Search docs/user-guide.md for "See Client Management section" or similar orphaned cross-references and update

---

## Phase 8: Manual Verification Against Running Application

**Purpose**: Verify all documented features exist and work as described

### Navigation Menu Verification

- [x] T047 [Verify] Start dev server with `npm run dev` and open application at http://localhost:9000 - SERVER RUNNING ON PORT 9001
- [ ] T048 [Verify] Verify navigation shows only Dashboard, Search, Profile (no Files, no Clients menu items) - NEEDS MANUAL TESTING
- [ ] T049 [Verify] Verify documented navigation in docs/user-guide.md matches actual application navigation exactly - NEEDS MANUAL TESTING

### Dashboard Analytics Verification

- [ ] T050 [Verify] Navigate to Dashboard in running application - NEEDS MANUAL TESTING
- [ ] T051 [Verify] Count analytics charts displayed on Dashboard (should be 6 charts) - NEEDS MANUAL TESTING
- [ ] T052 [Verify] Verify each documented chart in docs/user-guide.md exists in actual Dashboard - NEEDS MANUAL TESTING
- [ ] T053 [Verify] Verify chart types match documentation (donut, area, bar, column charts) - NEEDS MANUAL TESTING
- [ ] T054 [Verify] Test chart interactivity (hover tooltips, legends) matches documentation - NEEDS MANUAL TESTING

### File Management Verification

- [ ] T055 [Verify] Verify there is NO global "Files" menu item in running application - NEEDS MANUAL TESTING
- [ ] T056 [Verify] Navigate to a case via Search page in running application - NEEDS MANUAL TESTING
- [ ] T057 [Verify] Verify case-specific file management works through CaseFilesPage (Files tab within case) - NEEDS MANUAL TESTING
- [x] T058 [Verify] Confirm docs/user-guide.md does not mention removed global file browsing feature - VERIFIED ✓

### Client Management Verification

- [ ] T059 [Verify] Verify there is NO standalone "Clients" menu item in running application - NEEDS MANUAL TESTING
- [ ] T060 [Verify] Navigate to Search page and verify client search and management is available - NEEDS MANUAL TESTING
- [x] T061 [Verify] Confirm docs/user-guide.md accurately describes current Search page workflow for client operations - VERIFIED ✓

### Final Validation Checklist

- [x] T062 [Verify] Version number is 1.1 in docs/user-guide.md - VERIFIED ✓
- [x] T063 [Verify] "Last Updated" date is October 21, 2025 in docs/user-guide.md - VERIFIED ✓
- [x] T064 [Verify] Zero references to "Files menu" or "FileManagementPage" remain in docs/user-guide.md - VERIFIED ✓
- [x] T065 [Verify] Zero references to standalone "Client Management page" remain in docs/user-guide.md - VERIFIED ✓
- [ ] T066 [Verify] All documented workflows in docs/user-guide.md match actual application behavior - NEEDS MANUAL TESTING
- [x] T067 [Verify] No broken internal links or cross-references in docs/user-guide.md - VERIFIED ✓
- [x] T068 [Verify] Document is cohesive, readable, and under 750 lines - VERIFIED (679 lines) ✓

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 3 (Phase 2)**: Can start immediately - no dependencies
- **User Story 1 (Phase 3)**: Can start immediately - no dependencies on other stories
- **User Story 2 (Phase 4)**: Can start immediately - no dependencies on other stories
- **User Story 4 (Phase 5)**: Can start immediately - no dependencies on other stories
- **Table of Contents (Phase 6)**: Depends on completion of Phases 2-5 (all content changes must be done first)
- **Quality Assurance (Phase 7)**: Depends on completion of Phase 6 (ToC updates)
- **Manual Verification (Phase 8)**: Depends on completion of Phase 7 (document must be finalized)

### User Story Dependencies

**All user stories are INDEPENDENT** - they can be worked on in any order or in parallel:

- **User Story 3 (P1)**: Update Navigation Menu - No dependencies on other stories
- **User Story 1 (P1)**: Remove File Management Docs - No dependencies on other stories
- **User Story 2 (P2)**: Remove Client Management Docs - No dependencies on other stories
- **User Story 4 (P3)**: Add Dashboard Analytics Docs - No dependencies on other stories

### Within Each User Story

- Tasks within a user story should generally be done sequentially
- Tasks marked [P] within a user story can be done in parallel (e.g., documenting 6 different charts)
- Each story should be completed and checkpointed before moving to next

### Parallel Opportunities

Since all tasks edit the SAME FILE (`docs/user-guide.md`), true parallelization is limited. However:

- **Different user stories can be worked on in separate branches** by different team members
- **Within US4 (Dashboard Analytics)**: T025-T030 can be written in parallel (6 separate chart descriptions)
- **Verification tasks (Phase 8)**: T047-T061 can be performed in parallel if multiple people are testing

---

## Parallel Example: User Story 4 (Dashboard Analytics)

```bash
# Write all 6 chart descriptions in parallel:
Task T025: "Document Cases by Status chart (donut chart)"
Task T026: "Document Monthly Case Trends chart (area chart)"
Task T027: "Document Cases by Country chart (bar chart)"
Task T028: "Document Average Case Duration chart (bar chart)"
Task T029: "Document Client Activity chart (bar chart)"
Task T030: "Document Case Age Distribution chart (column chart)"

# Then sequentially:
Task T031: "Verify formatting consistency"
Task T032: "Verify total line count (~50 lines)"
```

---

## Implementation Strategy

### MVP First (Priority P1 User Stories)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: User Story 3 - Navigation Menu (T004-T009)
3. Complete Phase 3: User Story 1 - Remove File Management Docs (T010-T016)
4. Complete Phase 6: Table of Contents Updates (T033-T038)
5. Complete Phase 7: Quality Assurance (T039-T046)
6. Complete Phase 8: Manual Verification (T047-T068)
7. **STOP and VALIDATE**: P1 stories complete - documentation accurate for navigation and file management

### Incremental Delivery

**Recommended Order** (by priority):

1. **Setup** → Version and date updated
2. **US3 (P1) + US1 (P1)** → Critical navigation and file management docs fixed
3. **Table of Contents + QA** → Test independently → Document ready for review
4. **US2 (P2)** → Client management docs updated → Test independently
5. **US4 (P3)** → Analytics docs added → Test independently → Full documentation complete

Each increment delivers value without breaking previous updates.

### Single-Person Strategy

Work sequentially in priority order:

1. Setup (T001-T003)
2. US3 Navigation (T004-T009) ✓
3. US1 File Management Removal (T010-T016) ✓
4. US2 Client Management Removal (T017-T022) ✓
5. US4 Analytics Addition (T023-T032) ✓
6. ToC Updates (T033-T038) ✓
7. Quality Assurance (T039-T046) ✓
8. Manual Verification (T047-T068) ✓

---

## Notes

- All tasks edit the SAME FILE: `/docs/user-guide.md`
- [P] tasks within US4 can write different chart descriptions in parallel (non-conflicting content)
- [Story] label maps task to specific user story for traceability
- Each user story delivers independent value and can be verified independently
- No automated tests - all validation is manual against running application
- Commit after each phase or logical group of tasks
- Use `git diff` to review changes before committing
- Rollback plan: `git revert` or `git checkout HEAD~1 docs/user-guide.md`

**Estimated Effort**: 3 hours total
- Setup: 5 minutes
- US3 Navigation: 20 minutes
- US1 File Management: 30 minutes
- US2 Client Management: 30 minutes
- US4 Analytics: 1 hour
- ToC Updates: 15 minutes
- Quality Assurance: 30 minutes
- Manual Verification: 45 minutes

**Risk Level**: Very Low - Documentation only, no code changes, easy rollback
