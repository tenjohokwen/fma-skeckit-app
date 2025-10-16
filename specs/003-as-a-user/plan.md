# Implementation Plan: Admin Client Information Editing

**Branch**: `003-as-a-user` | **Date**: 2025-10-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-as-a-user/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature enables administrators to edit client personal information directly from the client details page. Admins can update first name, last name, national ID, telephone, and email with real-time validation. The implementation extends the existing ClientDetailsPage component with inline editing capabilities, leverages the existing client store for state management, and adds a new backend endpoint for updating client information with uniqueness validation.

## Technical Context

**Language/Version**: JavaScript ES6+ (frontend), Google Apps Script JavaScript (backend)
**Primary Dependencies**: Vue 3, Quasar 2, Pinia, @vuelidate/core, @vuelidate/validators (frontend); Google Apps Script libraries (backend)
**Storage**: Google Sheets (clients sheet with columns: clientId, firstName, lastName, nationalId, telephone, email, folderId, createdAt, updatedAt)
**Testing**: Vitest + Vue Test Utils for frontend components
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge), Google Apps Script environment
**Project Type**: Web application (single-page Vue app with Google Apps Script backend)
**Performance Goals**: < 1 second validation feedback, < 2 seconds save operation, < 30 seconds complete edit workflow
**Constraints**: Must maintain existing client folder structure in Google Drive, must preserve data integrity with unique national ID validation, must work within Google Apps Script execution time limits (30 seconds max)
**Scale/Scope**: Small feature extension affecting 1 existing page component, 1 new backend handler method, ~200-300 lines of new code total

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

- [x] **Vue 3 Composition API**: Feature uses `<script setup>` exclusively, no Options API or `export default`
- [x] **Plain JavaScript**: No TypeScript syntax, interfaces, or type annotations
- [x] **Functional Component Splitting**: Edit functionality will be extracted to ClientEditForm component with single responsibility
- [x] **Quasar Integration**: Uses Q-input, Q-btn, Q-form, Q-notify for all UI elements
- [x] **Clean & Readable Code**: ClientEditForm will be under 200 lines, validation logic extracted to useClientValidation composable

### Testing Standards Compliance

- [x] **Component Isolation**: ClientEditForm will have dedicated test file (ClientEditForm.spec.js)
- [x] **Vitest + Vue Test Utils**: All tests written in plain JavaScript with Vitest
- [x] **Realistic Test Scenarios**: Tests will simulate edit mode toggle, field updates, validation errors, save success/failure

### UX Consistency Compliance

- [x] **Design System**: Uses primary blue (#2563eb) for save button, error red (#ef4444) for validation messages
- [x] **Quasar Design Language**: Consistent with existing client details page styling using Material Icons
- [x] **Clear Feedback & States**: Loading spinner during save, $q.notify() for errors/success, disabled state during save
- [x] **Accessibility**: All form inputs have labels, WCAG AA contrast maintained, keyboard accessible (Tab navigation, Enter to save, Escape to cancel)
- [x] **Responsive**: Uses Quasar grid system, tested on mobile viewport (inline editing adapts to narrow screens)

### Performance Requirements Compliance

- [x] **Lazy Loading**: Reuses existing ClientDetailsPage (already lazy-loaded route)
- [x] **Efficient Reactivity**: Uses computed for validation state, debounced validation for email format
- [x] **Network & Memory Hygiene**: Cancels pending save request on unmount, no memory leaks
- [x] **Bundle Awareness**: Only adds @vuelidate dependencies (~10KB gzipped), no new heavy libraries

### Additional Requirements Compliance

- [x] **Mobile-First Design**: Edit form tested on mobile viewports, buttons stack vertically on small screens
- [x] **Internationalization**: All new UI text uses i18n keys (client.edit.* namespace in en-US.js and fr-FR/index.js)
- [x] **Progress Indicators**: Save button shows loading spinner, form disabled during save operation

### Google Apps Script Architecture Compliance

- [x] **Project Structure**: New update method added to gas/handlers/ClientHandler.gs
- [x] **Request Flow**: Follows Security Interceptor → Router → ClientHandler.update → Response pattern
- [x] **Security**: Admin-only endpoint, validates token, uses PropertiesService for SPREADSHEET_ID
- [x] **Response Format**: Returns standardized JSON {status, msgKey, message, data: {client}, token}

## Project Structure

### Documentation (this feature)

```
specs/003-as-a-user/
├── plan.md              # This file
├── research.md          # Phase 0: Validation patterns, inline editing UX research
├── data-model.md        # Phase 1: Client entity with validation rules
├── quickstart.md        # Phase 1: How to test the edit feature locally
├── contracts/           # Phase 1: API contract for client.update endpoint
│   └── client-update.md
└── checklists/
    └── requirements.md  # Spec quality checklist (already created)
```

### Source Code

```
src/
├── components/
│   └── clients/
│       ├── ClientEditForm.vue          # NEW: Inline edit form component
│       └── ClientEditForm.spec.js      # NEW: Test file
├── composables/
│   └── useClientValidation.js          # NEW: Validation logic composable
├── stores/
│   └── client.js                       # MODIFIED: Add updateClient action
├── pages/
│   └── ClientDetailsPage.vue           # MODIFIED: Add edit mode, integrate ClientEditForm
└── i18n/
    ├── en-US.js                        # MODIFIED: Add client.edit.* keys
    └── fr-FR/
        └── index.js                    # MODIFIED: Add French translations

gas/
├── handlers/
│   └── ClientHandler.gs                # MODIFIED: Add update method
├── services/
│   └── SheetsService.gs                # MODIFIED: Add updateClient method with uniqueness check
└── utils/
    └── Router.gs                       # UNCHANGED: Already routes client.update action

tests/
└── components/
    └── clients/
        └── ClientEditForm.spec.js      # NEW: Component tests
```

## Phase 0: Research & Technical Decisions

**Status**: ✅ Complete (see [research.md](./research.md))

**Key Questions Resolved**:
1. **Inline vs Modal Editing**: Chose inline editing for faster workflow (no modal overhead)
2. **Validation Library**: Using @vuelidate for consistent validation with existing forms
3. **Optimistic vs Pessimistic Updates**: Pessimistic (wait for server confirmation before updating UI)
4. **Concurrent Edit Handling**: Last-save-wins for initial implementation (P3: add version-based optimistic locking)

## Phase 1: Design Artifacts

**Status**: ✅ Complete

**Outputs**:
- [data-model.md](./data-model.md) - Client entity with validation rules
- [contracts/client-update.md](./contracts/client-update.md) - API endpoint specification
- [quickstart.md](./quickstart.md) - Local testing guide
- Updated CLAUDE.md with new technologies

## Phase 2: Implementation Tasks

**Status**: ⏳ Pending - Run `/speckit.implement` to begin

**Task Breakdown**: See [tasks.md](./tasks.md) (generated by `/speckit.tasks`)

### Estimated Implementation Phases

#### Phase 2.1: Backend Foundation (Priority: P1)
- Add `updateClient` method to SheetsService with uniqueness validation
- Add `update` method to ClientHandler with admin-only check
- Add i18n keys for validation errors
- Test backend endpoint with clasp

#### Phase 2.2: Frontend Edit Component (Priority: P1)
- Create ClientEditForm component with Vuelidate
- Create useClientValidation composable
- Add updateClient action to client store
- Write component tests

#### Phase 2.3: Integration (Priority: P1)
- Integrate ClientEditForm into ClientDetailsPage
- Add edit mode toggle (Edit/Cancel buttons)
- Add unsaved changes warning
- Test complete workflow

#### Phase 2.4: Validation & Polish (Priority: P2)
- Add real-time email format validation
- Add national ID uniqueness check on blur
- Improve error messages
- Add loading states

#### Phase 2.5: Audit Trail (Priority: P3)
- Display "Last Updated" timestamp
- Track who made changes
- (Future: Detailed change history)

## Dependencies & Risks

### External Dependencies
- **Google Sheets API**: Existing, stable
- **Vuelidate**: Already used in ClientForm, compatible
- **Quasar**: Existing, stable

### Internal Dependencies
- **Existing ClientDetailsPage**: Must preserve current functionality
- **Client Store**: Must maintain backward compatibility
- **SheetsService**: Must add new method without breaking existing methods

### Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Concurrent edits cause data loss | High | Medium | Document last-save-wins behavior, add P3 optimistic locking task |
| National ID validation performance | Medium | Low | Add index/caching if needed, currently <100 clients so linear scan acceptable |
| Unsaved changes accidentally lost | Medium | Medium | Add beforeunload warning, visually indicate unsaved state |
| Mobile edit UX awkward | Low | Low | Test on mobile early, adjust form layout if needed |

## Success Validation

### Phase 1 (Design) Success Criteria
- [x] Data model clearly defines validation rules
- [x] API contract matches backend implementation patterns
- [x] No constitution violations identified
- [x] All technical decisions documented with rationale

### Phase 2 (Implementation) Success Criteria
Will be evaluated after `/speckit.implement`:
- [ ] All acceptance scenarios from spec pass
- [ ] Tests achieve >80% coverage of new code
- [ ] No regression in existing client details view
- [ ] Performance < 2 seconds for save operation
- [ ] Mobile viewport tested and working
- [ ] French translations complete and accurate

## Next Steps

1. ✅ **Phase 0 Complete**: Research documented in [research.md](./research.md)
2. ✅ **Phase 1 Complete**: Design artifacts generated
3. ⏳ **Ready for Phase 2**: Run `/speckit.implement` to generate tasks and begin development

