# CaseEditor Integration Guide for Email Notifications

## Purpose
This guide documents how to integrate the EmailNotificationDialog with CaseEditor to pass originalNotes and currentNotes props for validation.

## T055: Pass originalNotes and currentNotes props to EmailNotificationDialog

### Current CaseEditor State

The CaseEditor component maintains:
- `originalData.value` - Original case data when component loaded
- `formData.value` - Current form values being edited

### Required Changes

#### 1. Update EmailNotificationDialog Usage in Template

Find the EmailNotificationDialog component in the CaseEditor template and add props:

```vue
<EmailNotificationDialog
  v-model="showEmailDialog"
  :original-notes="originalData.notes || ''"
  :current-notes="formData.notes || ''"
  @confirm="handleEmailDialogConfirm"
  @cancel="handleEmailDialogCancel"
/>
```

#### 2. Verify originalData Includes Notes

Ensure the `initializeForm()` function includes notes:

```javascript
function initializeForm() {
  formData.value = {
    caseName: props.caseData.caseName || '',
    clientName: props.caseData.clientName || '',
    caseType: props.caseData.caseType || '',
    status: props.caseData.status || '',
    assignedTo: props.caseData.assignedTo || '',
    notes: props.caseData.notes || ''  // Ensure notes are included
  }

  originalData.value = { ...formData.value }
}
```

## Validation Flow

With these props in place:

1. **User changes status** → handleSave() detects change → shows EmailNotificationDialog
2. **Dialog opens** with:
   - `originalNotes`: Original notes from when case was loaded
   - `currentNotes`: Current notes in the form (may be updated)
3. **User checks "Yes, send email"**:
   - If notes unchanged: Error displays, confirm button disabled
   - If notes changed: No error, confirm button enabled
4. **User checks "No, update case only"**:
   - No validation, confirm button always enabled

## Testing Notes Validation

### Test Scenario 1: Notes Unchanged
1. Load a case with existing notes
2. Change status but do NOT change notes
3. Save → Dialog appears
4. Check "Yes, send email"
5. **Expected**: Error message appears, confirm button disabled

### Test Scenario 2: Notes Changed
1. Load a case with existing notes
2. Change status AND update notes
3. Save → Dialog appears
4. Check "Yes, send email"
5. **Expected**: No error, confirm button enabled, can proceed

### Test Scenario 3: No Email Selected
1. Load a case
2. Change status (notes can be anything)
3. Save → Dialog appears
4. Leave "Yes, send email" unchecked (or check "No")
5. **Expected**: No validation error, confirm button enabled

## Implementation Checklist

- [ ] Add `:original-notes` prop to EmailNotificationDialog
- [ ] Add `:current-notes` prop to EmailNotificationDialog
- [ ] Verify `originalData.value` includes notes field
- [ ] Verify `formData.value` includes notes field
- [ ] Test validation with unchanged notes
- [ ] Test validation with changed notes
- [ ] Test no validation when email not selected

## Expected Behavior

✅ **User Story 2 Complete**: Notes validation enforces data quality
- Prevents sending emails without context
- Only validates when user chooses to send email
- Clear error messaging guides user to update notes
- Maintains existing behavior when email not selected

