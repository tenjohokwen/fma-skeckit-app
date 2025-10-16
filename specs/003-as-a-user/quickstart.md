# Quickstart: Testing Admin Client Edit Feature

**Feature**: Admin Client Information Editing
**Date**: 2025-10-16

## Prerequisites

1. **Development Environment Setup**:
   - Node.js 16+ installed
   - npm dependencies installed (`npm install`)
   - Google Apps Script CLI (clasp) installed globally
   - Authenticated with clasp (`clasp login`)

2. **Backend Configuration**:
   - Google Sheets spreadsheet created with `clients` sheet
   - Script Properties configured with `SPREADSHEET_ID`
   - Backend deployed with `clasp push`

3. **Test Data**:
   - At least one client exists in the system
   - Admin user account created with ROLE_ADMIN

## Quick Start

### 1. Start Development Server

```bash
# From project root
npm run dev
```

The app will be available at `http://localhost:9000` (or the port shown in terminal).

### 2. Login as Admin

1. Navigate to `http://localhost:9000`
2. Login with admin credentials (ROLE_ADMIN user)
3. You should see the search page

### 3. Navigate to Client Details

1. Click on the "Clients" tab in the search page
2. Search for an existing client (e.g., by name)
3. Click the "View" icon (eye icon) next to a client in the search results
4. You should now be on the Client Details page

### 4. Test Edit Functionality

#### Test Case 1: Successful Edit
1. On the Client Details page, click the **"Edit"** button (visible only to admins)
2. Verify that all personal information fields become editable
3. Modify the telephone number (e.g., change from `+237612345678` to `+237687654321`)
4. Click **"Save"**
5. Verify:
   - Loading spinner appears on Save button
   - Success notification displays
   - Fields return to read-only mode
   - Updated telephone number is shown

#### Test Case 2: Field Validation
1. Click **"Edit"** again
2. Clear the first name field (required field)
3. Attempt to click **"Save"**
4. Verify:
   - Error message appears below first name field: "First name is required"
   - Save operation is prevented
   - Form remains in edit mode

#### Test Case 3: Email Format Validation
1. While in edit mode, enter an invalid email: `not-an-email`
2. Tab out of the email field
3. Verify:
   - Validation error appears: "Invalid email format"
4. Correct the email to valid format: `test@example.com`
5. Verify error clears

#### Test Case 4: Cancel Changes
1. While in edit mode, modify the last name
2. Click **"Cancel"**
3. Verify:
   - All fields revert to original values
   - Edit mode closes
   - No save request is made

#### Test Case 5: Unsaved Changes Warning
1. Click **"Edit"**
2. Modify any field (e.g., telephone)
3. Attempt to navigate away (e.g., click browser back button)
4. Verify:
   - Warning dialog appears: "You have unsaved changes. Leave anyway?"
   - Clicking "Cancel" keeps you on the page
   - Clicking "OK" navigates away (changes lost)

#### Test Case 6: Duplicate National ID (Backend Validation)
1. Click **"Edit"**
2. Change the national ID to one that already exists for another client
3. Click **"Save"**
4. Verify:
   - Error notification displays: "This National ID is already registered to another client"
   - Form remains in edit mode
   - Changes are not saved

## Testing Backend Directly

### Using Postman or cURL

```bash
# Get your authentication token first (copy from browser DevTools)
TOKEN="your-auth-token-here"

# Update client request
curl -X POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec \
  -H "Content-Type: application/json" \
  -d '{
    "action": "client.update",
    "data": {
      "clientId": "existing-client-id",
      "firstName": "Updated",
      "lastName": "Name",
      "nationalId": "12345-67890",
      "telephone": "+237612345678",
      "email": "updated@example.com"
    },
    "token": "'$TOKEN'"
  }'
```

### Expected Response

```json
{
  "status": 200,
  "msgKey": "client.update.success",
  "message": "Client information updated successfully",
  "data": {
    "client": {
      "clientId": "existing-client-id",
      "firstName": "Updated",
      "lastName": "Name",
      "nationalId": "12345-67890",
      "telephone": "+237612345678",
      "email": "updated@example.com",
      "folderId": "...",
      "createdAt": "2025-01-15T10:30:00",
      "updatedAt": "2025-10-16T15:45:20"
    }
  },
  "token": {
    "value": "refreshed-token",
    "ttl": 1734358520000,
    "username": "admin@example.com"
  }
}
```

## Running Automated Tests

### Frontend Component Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test ClientEditForm.spec.js
```

### Expected Test Output

```
 PASS  src/components/clients/ClientEditForm.spec.js
  ClientEditForm
    ✓ renders form fields in edit mode (45ms)
    ✓ validates required fields (32ms)
    ✓ validates email format (28ms)
    ✓ emits save event with form data (23ms)
    ✓ emits cancel event and resets form (19ms)
    ✓ shows loading state during save (35ms)
    ✓ displays validation errors (27ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        2.451s
```

## Troubleshooting

### Issue: Edit Button Not Visible

**Cause**: User is not logged in as admin

**Solution**:
1. Check browser console for authentication errors
2. Verify user has `ROLE_ADMIN` in backend
3. Try logging out and back in

### Issue: Save Button Does Nothing

**Cause**: Validation errors present

**Solution**:
1. Check for red error messages below form fields
2. Ensure all required fields are filled
3. Verify email and phone format if provided
4. Check browser console for JavaScript errors

### Issue: "This National ID is already registered" Error

**Cause**: National ID conflicts with another client

**Solution**:
1. Use a different national ID value
2. Check the `clients` sheet in Google Sheets to see existing IDs
3. This is expected behavior to prevent duplicates

### Issue: Save Succeeds But UI Doesn't Update

**Cause**: Frontend store not refreshing

**Solution**:
1. Check browser console for errors
2. Manually refresh the page to verify changes persisted
3. Check backend logs in Google Apps Script

### Issue: Backend Returns 403 Forbidden

**Cause**: User doesn't have admin permissions

**Solution**:
1. Verify user role in backend: `UserService.getUserByEmail(email).role`
2. Update user role to `ROLE_ADMIN` if needed
3. Ensure SecurityInterceptor is correctly validating roles

## Manual Verification Checklist

After implementing the feature, verify these items:

- [ ] Edit button visible only to admin users
- [ ] Edit button hidden from non-admin users
- [ ] Clicking Edit makes fields editable
- [ ] Save button disabled during save operation
- [ ] Loading spinner appears during save
- [ ] Success notification appears after save
- [ ] Fields return to read-only after successful save
- [ ] Cancel button discards changes
- [ ] Required field validation works (first name, last name, national ID)
- [ ] Email format validation works
- [ ] Phone format validation works
- [ ] National ID uniqueness validation works
- [ ] Unsaved changes warning appears when navigating away
- [ ] Updated timestamp reflects last change
- [ ] Mobile viewport displays form correctly
- [ ] French translations display correctly when language is switched
- [ ] No console errors during normal operation
- [ ] Keyboard navigation works (Tab, Enter, Escape)

## Performance Benchmarks

Expected performance targets:

| Operation | Target | How to Measure |
|-----------|--------|----------------|
| Open edit mode | < 200ms | Click Edit → fields editable |
| Client-side validation | < 100ms | Type invalid email → error appears |
| Save operation | < 2s | Click Save → success notification |
| Complete workflow | < 30s | Edit → Save → Confirmation |

Use browser DevTools Network tab to measure actual timings.

## Next Steps

After testing is complete and all scenarios pass:

1. **Code Review**: Submit PR for review
2. **QA Testing**: Full regression test of client management features
3. **User Acceptance**: Demo to stakeholders
4. **Documentation**: Update user guide with edit instructions
5. **Deployment**: Merge to main and deploy to production

