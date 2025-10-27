# Tasks: Application Icon & Splash Screen Replacement Guide

**Input**: Design documents from `/specs/015-document-the-steps/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Constitution Compliance**: This is a documentation feature. Constitution principles related to code (Vue 3, JavaScript, testing) do not apply. Applicable requirements:
- Documentation MUST be clear and concise
- Documentation MUST be validated by actual developers following the steps
- Documentation MUST be accurate and complete

**Tests**: No automated tests for this feature. Validation is manual - developers must successfully follow the documentation to replace icons.

**Organization**: Tasks are grouped by user story to enable independent delivery of documentation sections.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can be written in parallel (different sections, no dependencies)
- **[Story]**: Which user story this task serves (US1, US2, US3)
- All paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure and baseline files

- [ ] **T001** Create `docs/` directory in repository root
- [ ] **T002** [P] Create placeholder `docs/ICON-REPLACEMENT.md` with title and brief description
- [ ] **T003** [P] Verify current icon file structure (`desktop/icons/`, `branding/bechem/icons/`)

**Checkpoint**: Directory structure ready for documentation content

---

## Phase 2: Foundational (Shared Documentation Sections)

**Purpose**: Write documentation sections that serve ALL user stories

**⚠️ CRITICAL**: These sections must be complete before user-story-specific sections make sense

- [ ] **T004** [P] Write Section 1 (Overview) in `docs/ICON-REPLACEMENT.md`
  - What this guide covers
  - Who it's for (developers)
  - Time estimate (< 10 minutes)
  - Problem solved (replacing blue placeholder)

- [ ] **T005** [P] Write Section 2 (Prerequisites) in `docs/ICON-REPLACEMENT.md`
  - Required tools (Node.js, npm, git, image editor)
  - Required permissions (git, file system access)
  - Knowledge requirements (git basics, command line)

- [ ] **T006** [P] Write Section 3 (Icon Requirements) in `docs/ICON-REPLACEMENT.md`
  - Format: PNG with RGBA (FR-001)
  - Dimensions: 1024x1024 pixels (FR-002)
  - Design best practices (FR-007): simplicity, padding, testing
  - Transparency handling
  - Platform-specific notes (FR-004): .icns, .ico conversion

- [ ] **T007** [P] Write Section 4 (File Locations) in `docs/ICON-REPLACEMENT.md`
  - Primary location: `desktop/icons/icon.png` (FR-003)
  - Client branding location: `branding/{client}/icons/icon.png` (FR-003)
  - Explanation of two locations
  - Directory tree visualization

**Checkpoint**: Foundation documentation ready - user story sections can now be added

---

## Phase 3: User Story 1 - Replace Desktop Application Icon (Priority: P1) 🎯 MVP

**Goal**: Enable developers to replace the default icon and build the desktop app with custom branding

**Independent Test**: Developer can follow steps to replace icon on main branch, build, and see new icon in Dock/taskbar/splash screen

### Implementation for User Story 1

- [ ] **T008** [US1] Write Section 5.1 (Replacing Icon on Main Branch) in `docs/ICON-REPLACEMENT.md`
  - Step 1: Checkout main branch command
  - Step 2: Replace icon file (cp command + Finder/Explorer option)
  - Step 3: Verify format command (sips for macOS)
  - Step 4: Commit changes command
  - Step 5: Push to remote command
  - Maps to FR-005

- [ ] **T009** [US1] Write Section 6.1 (Build Commands) in `docs/ICON-REPLACEMENT.md`
  - Clear build cache command: `rm -rf dist-desktop` (FR-009)
  - Platform-specific build commands (mac, win, linux)
  - Advanced cache clearing (electron-builder cache)
  - Maps to FR-009

- [ ] **T010** [US1] Write Section 6.2 (Verification Steps) in `docs/ICON-REPLACEMENT.md`
  - Visual inspection steps (launch app, check Dock/taskbar)
  - Splash screen verification (FR-008)
  - File verification (.icns, .ico presence)
  - Maps to FR-006, FR-008

- [ ] **T011** [US1] Write Example 1 (Quick Replacement Main Branch) in Section 8 of `docs/ICON-REPLACEMENT.md`
  - Complete copy-paste workflow for main branch
  - From icon replacement through build and verification

### Validation for User Story 1

- [ ] **T012** [US1] Manual validation: Follow Section 5.1 + 6.1 + 6.2 to replace icon on test branch
  - Verify icon changes in built app
  - Verify all commands work as documented
  - Fix any errors in documentation

**Checkpoint**: At this point, User Story 1 documentation is complete and validated. Developers can successfully replace icons on main branch.

---

## Phase 4: User Story 2 - Verify Icon Quality Across Platforms (Priority: P2)

**Goal**: Help developers verify their icon looks good at all sizes and on all platforms

**Independent Test**: Developer can identify icon quality issues by examining generated files and previewing at small sizes

### Implementation for User Story 2

- [ ] **T013** [US2] Expand Section 3 (Icon Requirements) with quality verification guidance in `docs/ICON-REPLACEMENT.md`
  - How to test icon at 16x16, 32x32, 64x64
  - Using image editor to preview scaled versions
  - Using macOS Preview to view .icns at all sizes
  - Common quality issues (blurry at small sizes, lost details)

- [ ] **T014** [US2] Write Troubleshooting Issue 2 (Icon format errors) in Section 7 of `docs/ICON-REPLACEMENT.md`
  - Symptoms: Build fails with "Invalid icon format"
  - Cause: Not 1024x1024 or invalid metadata
  - Solution: Verify size command, re-export if needed

- [ ] **T015** [US2] Write Troubleshooting Issue 3 (Icon looks blurry) in Section 7 of `docs/ICON-REPLACEMENT.md`
  - Symptoms: Icon unclear in system menus
  - Cause: Too much detail
  - Solution: Simplify design, test at 16x16, use bold shapes

### Validation for User Story 2

- [ ] **T016** [US2] Manual validation: Test icon quality verification process
  - Create test icon with intentional quality issues
  - Follow documentation to identify problems
  - Verify troubleshooting steps resolve issues
  - Fix any gaps in documentation

**Checkpoint**: User Stories 1 AND 2 complete. Developers can replace icons and verify quality.

---

## Phase 5: User Story 3 - Update Client-Specific Branding (Priority: P3)

**Goal**: Enable developers working on client branches to update both icon locations and handle merges correctly

**Independent Test**: Developer can update icons on client branch, merge from main without conflicts, and maintain client-specific branding

### Implementation for User Story 3

- [ ] **T017** [US3] Write Section 5.2 (Replacing Icon on Client Branch) in `docs/ICON-REPLACEMENT.md`
  - Step 1: Checkout client branch command
  - Step 2: Replace BOTH icon locations (desktop/ and branding/)
  - Step 3: Commit both locations
  - Step 4: Push to remote
  - Explanation of why both locations matter
  - Maps to FR-005

- [ ] **T018** [US3] Write Section 5.3 (Merging Icon Changes Main → Client) in `docs/ICON-REPLACEMENT.md`
  - Step 1: Checkout client branch
  - Step 2: Merge from main
  - Step 3: Handle conflicts (--ours vs --theirs)
  - Step 4: Sync desktop/ and branding/ locations
  - Step 5: Complete merge and push
  - Maps to FR-010

- [ ] **T019** [US3] Write Troubleshooting Issue 4 (Git conflict on icon.png) in Section 7 of `docs/ICON-REPLACEMENT.md`
  - Symptoms: Binary file conflict during merge
  - Cause: Both branches modified icon
  - Solution: Choose version (--ours or --theirs), sync to branding/

- [ ] **T020** [US3] Write Example 2 (Client Branch Update) in Section 8 of `docs/ICON-REPLACEMENT.md`
  - Complete workflow for updating client-specific icon
  - Includes updating both locations

- [ ] **T021** [US3] Write Example 3 (Complete Workflow Main → Client) in Section 8 of `docs/ICON-REPLACEMENT.md`
  - Step-by-step from updating main through merging to client
  - Handling conflicts
  - Full git workflow demonstration

### Validation for User Story 3

- [ ] **T022** [US3] Manual validation: Test client branch workflow
  - Update icon on test client branch
  - Create intentional merge conflict
  - Follow documentation to resolve
  - Verify both locations stay in sync
  - Fix any issues in documentation

**Checkpoint**: All user stories complete. Documentation covers main branch, client branch, and merge workflows.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Complete remaining documentation and integrate with repository

- [ ] **T023** [P] Write Troubleshooting Issue 1 (Icon doesn't change) in Section 7 of `docs/ICON-REPLACEMENT.md`
  - Symptoms: Built app shows old icon
  - Cause: Build cache not cleared
  - Solution: Clear caches and rebuild

- [ ] **T024** [P] Write Troubleshooting Issue 5 (DMG creation fails) in Section 7 of `docs/ICON-REPLACEMENT.md`
  - Symptoms: hdiutil error during DMG creation
  - Cause: Known macOS issue
  - Solution: Project uses ZIP format instead

- [ ] **T025** Update main `README.md` with link to documentation
  - Add "Developer Documentation" section if not exists
  - Add link: `[Replacing Application Icons](docs/ICON-REPLACEMENT.md)`
  - Brief description of what the guide covers

- [ ] **T026** [P] Review `docs/ICON-REPLACEMENT.md` for completeness
  - Verify all 8 sections present (per data-model.md)
  - Verify all 10 functional requirements addressed
  - Check formatting (code blocks, headings, lists)
  - Fix typos and improve clarity

- [ ] **T027** [P] Create validation checklist in `specs/015-document-the-steps/checklists/documentation-validation.md`
  - Checklist item for each section
  - Checklist item for each functional requirement
  - Sign-off criteria for documentation completion

### Final Validation

- [ ] **T028** End-to-end documentation test
  - Have a developer unfamiliar with the process follow the complete guide
  - Time the process (should be < 10 minutes per SC-001)
  - Collect feedback on clarity and completeness
  - Make final refinements based on feedback

- [ ] **T029** Commit documentation to feature branch
  - Add all files (docs/ICON-REPLACEMENT.md, updated README.md)
  - Commit message: "Add icon replacement documentation (Feature 015)"
  - Push to `015-document-the-steps` branch

- [ ] **T030** Prepare for merge to main
  - Verify documentation renders correctly on GitHub
  - Check all links work
  - Ensure no placeholders or TODOs remain

**Checkpoint**: Documentation complete, validated, and ready to merge

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories CAN proceed in parallel if multiple writers available
  - Or sequentially in priority order (P1 → P2 → P3) for single writer
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 but independently useful
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Builds on US1 but independently useful

### Within Each User Story

- Documentation sections should be written in order (5.1 before 5.2 before 5.3)
- Examples should be written after their corresponding instruction sections
- Troubleshooting should be written based on actual validation experience
- Validation task must complete before moving to next story

### Parallel Opportunities

- **Phase 1**: All setup tasks can run in parallel
- **Phase 2**: All foundational sections (T004-T007) can be written in parallel - different sections
- **Phase 3-5**: If multiple writers, each can take a different user story after Phase 2 completes
- **Phase 6**: Troubleshooting issues (T023-T024) can be written in parallel

---

## Parallel Example: Phase 2 (Foundational Sections)

```bash
# Launch all foundational sections together:
Task: "Write Section 1 (Overview) in docs/ICON-REPLACEMENT.md"
Task: "Write Section 2 (Prerequisites) in docs/ICON-REPLACEMENT.md"
Task: "Write Section 3 (Icon Requirements) in docs/ICON-REPLACEMENT.md"
Task: "Write Section 4 (File Locations) in docs/ICON-REPLACEMENT.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - provides context for all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Have developer test icon replacement on main branch
5. If validated, merge to main - developers can now replace icons!

### Incremental Delivery

1. Complete Setup + Foundational → Basic documentation structure ready
2. Add User Story 1 → Validate independently → Merge (MVP! Main branch icon replacement works)
3. Add User Story 2 → Validate independently → Merge (Icon quality verification added)
4. Add User Story 3 → Validate independently → Merge (Client workflow complete)
5. Add Polish → Final validation → Merge (Complete, polished documentation)

Each increment adds value without breaking previous increments.

### Parallel Team Strategy

With multiple technical writers:

1. Team completes Setup + Foundational together (or assigns sections)
2. Once Foundational is done:
   - Writer A: User Story 1 (main branch workflow)
   - Writer B: User Story 2 (quality verification)
   - Writer C: User Story 3 (client workflow)
3. Stories complete independently, then integrate for final review

---

## Success Criteria Verification

After completing all tasks, verify against Success Criteria from spec.md:

- [ ] **SC-001**: Time developer following documentation → Must be < 10 minutes
- [ ] **SC-002**: Test with multiple developers → 100% should see correct custom icon when following docs
- [ ] **SC-003**: Verify generated .icns/.ico files contain all size variants (16x16 through 1024x1024)
- [ ] **SC-004**: Confirm visual inspection sufficient (no specialized tools needed)
- [ ] **SC-005**: Test merge workflow → Should result in zero conflicts when following documented process
- [ ] **SC-006**: Survey developers → 95% should correctly identify both file locations on first attempt

---

## File Summary

**Files Created/Modified**:
- `docs/ICON-REPLACEMENT.md` (new file - main deliverable)
- `README.md` (modified - add documentation link)
- `specs/015-document-the-steps/checklists/documentation-validation.md` (new file - validation checklist)

**Total Tasks**: 30
- Setup: 3 tasks
- Foundational: 4 tasks
- User Story 1 (P1): 5 tasks (4 implementation + 1 validation)
- User Story 2 (P2): 4 tasks (3 implementation + 1 validation)
- User Story 3 (P3): 6 tasks (5 implementation + 1 validation)
- Polish: 8 tasks (4 documentation + 4 integration/validation)

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel with others

---

## Notes

- [P] tasks = different sections/files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently deliverable
- Manual validation after each story ensures documentation actually works
- Commit frequently (after each section or logical group)
- Stop at any checkpoint to validate independently
- This is documentation - no automated tests, validation is manual and iterative
