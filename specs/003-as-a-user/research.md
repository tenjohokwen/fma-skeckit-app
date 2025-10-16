# Phase 0: Research & Technical Decisions

**Feature**: Admin Client Information Editing
**Date**: 2025-10-16
**Status**: Complete

## Research Questions

### 1. Inline Editing vs Modal Dialog?

**Context**: Need to decide UI pattern for editing client information

**Options Evaluated**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Inline Editing | Faster workflow, less context switching, maintains page context | Requires more complex state management, potential layout shifts | ✅ **CHOSEN** |
| Modal Dialog | Isolated state, no layout concerns, clear edit/view separation | Extra click to open, hides surrounding context, feels heavier | ❌ Not chosen |
| Slide-out Panel | Good for complex forms, maintains context | Overkill for 5 simple fields, requires additional component | ❌ Not chosen |

**Rationale**: Inline editing provides the fastest workflow for admins who need to quickly correct client information. The fields are simple enough that inline editing won't cause layout issues. This pattern is already familiar from many modern web apps (e.g., Notion, Airtable).

**Implementation Notes**:
- Toggle between view and edit mode with Edit/Cancel buttons
- Preserve original values for cancel operation
- Use Quasar Q-input components with Vuelidate integration
- Show validation errors inline below each field

---

### 2. Validation Library Choice?

**Context**: Need consistent validation for client fields with real-time feedback

**Options Evaluated**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Vuelidate | Already used in ClientForm, excellent Vue 3 support, composable API | Additional dependency | ✅ **CHOSEN** |
| VeeValidate | Popular, good docs, schema-based validation | Different API from existing code, heavier bundle | ❌ Not chosen |
| Custom Validation | No dependencies, full control | Reinventing the wheel, more code to maintain | ❌ Not chosen |

**Rationale**: Vuelidate is already in use for ClientForm component. Using the same validation library ensures consistency, reduces bundle size (no duplicate validation logic), and allows reuse of validation patterns.

**Implementation Notes**:
- Use `@vuelidate/core` and `@vuelidate/validators`
- Create `useClientValidation` composable with rules: required, email, minLength, maxLength
- Implement custom `uniqueNationalId` validator that calls backend
- Debounce async validation calls (500ms)

---

### 3. Optimistic vs Pessimistic Updates?

**Context**: Should UI update immediately or wait for server confirmation?

**Options Evaluated**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Optimistic Update | Feels faster, better UX for successful cases | Complex rollback on errors, potential for inconsistent state | ❌ Not chosen |
| Pessimistic Update | Simpler error handling, guaranteed consistency, no rollback complexity | Slightly slower perceived performance | ✅ **CHOSEN** |
| Hybrid (Optimistic UI, Pessimistic Data) | Best UX, visual feedback immediate | Most complex to implement correctly | ❌ Too complex for P1 |

**Rationale**: Pessimistic updates are more reliable for P1 implementation. Client information edits are infrequent enough that a 1-2 second wait for confirmation is acceptable. Optimistic updates introduce complexity around error handling and state rollback that isn't justified for this use case.

**Implementation Notes**:
- Disable form during save operation
- Show loading spinner on Save button
- Update UI only after successful server response
- Display error notification if save fails
- Keep edit mode open on error so user can retry

---

### 4. Concurrent Edit Handling?

**Context**: What happens if two admins edit the same client simultaneously?

**Options Evaluated**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Last-Save-Wins | Simple to implement, no backend changes needed | Risk of data loss if concurrent edits | ✅ **CHOSEN for P1** |
| Optimistic Locking (Version Field) | Prevents silent data loss, detects conflicts | Requires version field in sheet, more complex conflict UI | 🔜 P3 enhancement |
| Pessimistic Locking | Guarantees no conflicts | Requires lock management, can cause deadlocks, bad UX | ❌ Not appropriate |

**Rationale**: Last-save-wins is acceptable for initial implementation because:
1. Admin count is small (< 5 admins total)
2. Concurrent edits on same client are rare
3. Client information changes are infrequent
4. Adds zero implementation complexity

For P3, we can add a `version` field and implement optimistic locking if concurrent edits become a problem.

**Implementation Notes** (P1):
- No special handling needed
- Document last-save-wins behavior in user docs
- Log warning if concurrent edits detected in future monitoring

**Future Enhancement** (P3):
- Add `version` column to clients sheet
- Increment version on each update
- Return HTTP 409 Conflict if version mismatch
- Show conflict resolution UI to admin

---

### 5. Unsaved Changes Warning?

**Context**: How to prevent accidental data loss when navigating away?

**Decision**: ✅ Implement using Vue Router navigation guard

**Implementation Notes**:
- Add `hasUnsavedChanges` computed property (compares current values to original)
- Use `onBeforeRouteLeave` to prompt user if unsaved changes exist
- Show Q-dialog with "You have unsaved changes. Leave anyway?" message
- Also handle browser refresh/close with `beforeunload` event

**Code Pattern**:
```javascript
// In ClientDetailsPage.vue
onBeforeRouteLeave((to, from, next) => {
  if (hasUnsavedChanges.value) {
    $q.dialog({
      title: t('client.edit.unsavedChanges'),
      message: t('client.edit.unsavedChangesMessage'),
      cancel: true,
      persistent: true
    }).onOk(() => next())
      .onCancel(() => next(false))
  } else {
    next()
  }
})
```

---

## Technical Decisions Summary

### Frontend Stack
- **Component**: ClientEditForm.vue (new, extracted from ClientDetailsPage)
- **Validation**: @vuelidate/core + @vuelidate/validators
- **State Management**: Pinia client store with new `updateClient` action
- **UI Library**: Quasar Q-input, Q-btn, Q-form components
- **Update Strategy**: Pessimistic (wait for server confirmation)
- **Concurrent Edits**: Last-save-wins (P1), optimistic locking (P3)

### Backend Stack
- **Handler**: ClientHandler.update() method (new)
- **Service**: SheetsService.updateClient() method (new)
- **Validation**: Uniqueness check for national ID using linear scan
- **Authorization**: Admin-only check using context.user.role
- **Response**: Standard {status, msgKey, message, data: {client}, token} format

### Validation Rules
- **First Name**: Required, 1-50 characters
- **Last Name**: Required, 1-50 characters
- **National ID**: Required, 5-20 characters, unique across all clients
- **Telephone**: Optional, 10-15 digits (E.164 format)
- **Email**: Optional, valid email format (RFC 5322)

### Performance Targets
- **Validation Feedback**: < 500ms for client-side, < 1 second for server-side (uniqueness check)
- **Save Operation**: < 2 seconds end-to-end
- **Complete Edit Workflow**: < 30 seconds from Edit click to saved confirmation

---

## Alternatives Considered But Rejected

### Form Library (Rejected)
**Option**: Use a full form management library like Formkit or vue-form
**Why Rejected**: Overkill for simple 5-field form. Vuelidate provides everything needed without additional abstraction layers.

### Real-time Validation (Rejected for P1)
**Option**: Validate national ID uniqueness on every keystroke
**Why Rejected**: Creates too many server requests. Validation on blur is sufficient and more performant.

### Undo/Redo (Rejected)
**Option**: Implement undo/redo for client edits
**Why Rejected**: Out of scope. Users can manually revert changes by editing again.

---

## Dependencies Added

### Frontend
- **None**: @vuelidate/core and @vuelidate/validators already installed

### Backend
- **None**: All required GAS libraries already available

---

## Next Steps

Phase 0 research complete. Ready to proceed to Phase 1:
1. Generate data-model.md
2. Generate API contracts
3. Generate quickstart.md
4. Update agent context (CLAUDE.md)

