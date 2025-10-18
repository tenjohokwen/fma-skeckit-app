# Feature 007 Testing Guide

**Quick guide to test backend rejection of clientName updates**

---

## Quick Test: Backend Rejection

### Method 1: Run Automated Test (Recommended)

**Time**: 1 minute

1. **Open Google Apps Script Editor**
   - Go to your Google Sheets
   - Extensions → Apps Script

2. **Locate Test File**
   - Find file: `test_feature_007.gs`
   - If not visible, you need to add it to your project (from `gas/tests/test_feature_007.gs`)

3. **Run Backend Rejection Tests**
   - Select function: `runBackendRejectionTests`
   - Click Run (▶️)

4. **Check Results**
   - View → Execution log
   - Look for:
     ```
     ✅ PASS: updateCase - Reject clientName Update
     ✅ PASS: updateCase - Allow Other Field Updates
     ✅ PASS: updateCase - Reject clientId Update
     ```

**Expected Output**:
```
==========================================================
BACKEND REJECTION TESTS
==========================================================

Running: test_updateCase_rejectClientNameUpdate...
✅ PASS: updateCase - Reject clientName Update

Running: test_updateCase_allowOtherUpdates...
✅ PASS: updateCase - Allow Other Field Updates

Running: test_updateCase_rejectClientIdUpdate...
✅ PASS: updateCase - Reject clientId Update

==========================================================
TEST SUMMARY
==========================================================
Total Tests: 3
✅ Passed: 3
❌ Failed: 0
==========================================================
```

✅ **If all 3 pass**: Backend rejection is working correctly!

---

### Method 2: Manual Test in Apps Script Console

**Time**: 2-3 minutes

1. **Open Google Apps Script Editor**

2. **Create a Test Function**
   - Add this to any `.gs` file:

```javascript
function manualTestBackendRejection() {
  try {
    // Step 1: Get any existing case
    const sheet = SheetsService.getMetadataSheet();
    const data = sheet.getDataRange().getValues();

    // Get first case (skip header)
    if (data.length < 2) {
      Logger.log('❌ No cases found. Please create a case first.');
      return;
    }

    const row = data[1]; // First data row
    const caseId = row[0];
    const version = row[13]; // Column N: version

    Logger.log(`Testing with case: ${caseId}`);

    // Step 2: Try to update clientName (should FAIL)
    const updates = {
      caseName: 'Test Update',
      clientName: 'Hacker Name' // This should be rejected
    };

    Logger.log('Attempting to update clientName...');

    SheetsService.updateCase(caseId, updates, version, 'test@example.com');

    // If we reach here, test FAILED
    Logger.log('❌ TEST FAILED: clientName update was allowed (should have been rejected)');

  } catch (error) {
    // Expected to throw error
    if (error.message && error.message.includes('clientName cannot be updated')) {
      Logger.log('✅ TEST PASSED: clientName update was correctly rejected');
      Logger.log(`   Error message: ${error.message}`);
    } else {
      Logger.log(`❌ TEST FAILED: Unexpected error: ${error.message}`);
    }
  }
}
```

3. **Run the Function**
   - Select `manualTestBackendRejection`
   - Click Run

4. **Check Execution Log**
   - Look for: `✅ TEST PASSED: clientName update was correctly rejected`

---

### Method 3: Test via Frontend (Most Realistic)

**Time**: 3-5 minutes

**Note**: This requires browser dev tools to manipulate the request

1. **Open Your App in Browser**

2. **Navigate to Case Edit Page**
   - Find any case
   - Click to edit

3. **Open Browser Developer Tools**
   - Press F12 (Chrome/Firefox)
   - Go to "Console" tab

4. **Inject clientName into Update Request**
   - In the console, paste this code:

```javascript
// Intercept the next fetch request
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const [url, options] = args;

  // If it's a case update request
  if (options && options.method === 'POST' && options.body) {
    try {
      const body = JSON.parse(options.body);

      // Inject clientName into updates
      if (body.action === 'metadata.updateCase' && body.data && body.data.updates) {
        console.log('🔧 Injecting clientName into update request...');
        body.data.updates.clientName = 'Hacked Client Name';
        options.body = JSON.stringify(body);
      }
    } catch (e) {
      // Body not JSON, ignore
    }
  }

  return originalFetch.apply(this, args);
};

console.log('✅ Fetch interceptor installed. Now save the case.');
```

5. **Save the Case**
   - Make any edit (change case name)
   - Click "Save"

6. **Check for Error**
   - You should see an error notification
   - Error should say: "Client name cannot be updated from case details. Please update client information from the Client Details page."

7. **Clean Up**
   - Refresh the page to remove the interceptor

**Expected**: Error notification displayed ✅

---

## Full Test Suite

To run all 12 tests (enrichment, rejection, integration, performance):

1. Open Apps Script
2. Select function: `runAllFeature007Tests`
3. Click Run
4. Wait ~30-60 seconds
5. Check execution log for summary

**Expected**: All 12 tests pass ✅

---

## What Each Test Verifies

### Backend Rejection Tests

#### Test 1: Reject clientName Update
- **Tries**: Update clientName field
- **Expected**: Throws error
- **Error message**: "clientName cannot be updated from case details..."
- **What it proves**: Backend enforces immutability

#### Test 2: Allow Other Updates
- **Tries**: Update caseName, assignedTo, status, notes (NO clientName)
- **Expected**: Update succeeds
- **What it proves**: Normal updates still work

#### Test 3: Reject clientId Update
- **Tries**: Update clientId field
- **Expected**: Throws error
- **Error message**: "clientId is immutable..."
- **What it proves**: Feature 006 validation still works

---

## Troubleshooting

### Test says "FAILED: clientName update was allowed"

**Problem**: Backend is NOT rejecting clientName updates

**Possible Causes**:
1. Code not deployed to Apps Script
2. Using old version of code
3. updateCase() method not updated

**Fix**:
1. Check [gas/services/SheetsService.gs](../../gas/services/SheetsService.gs) lines 305-313
2. Should see:
   ```javascript
   if (updates.hasOwnProperty('clientName')) {
     throw ResponseHandler.validationError(
       'clientName cannot be updated...',
       'metadata.update.error.clientNameImmutable'
     );
   }
   ```
3. Deploy code: `npx clasp push --force`
4. Re-run test

---

### Test throws different error

**Problem**: Error message doesn't match expected

**Check**: What's the actual error message?

**Common errors**:
- "Case not found" → Case ID invalid or deleted
- "Version conflict" → Version number wrong
- "Unauthorized" → User permissions issue

**Fix**: Use a valid, existing case

---

### No cases found

**Problem**: Sheet is empty

**Fix**:
1. Create a client first
2. Create a case for that client
3. Run test again

---

## Success Criteria

✅ **Backend rejection working correctly if**:

1. Automated test passes:
   ```
   ✅ PASS: updateCase - Reject clientName Update
   ```

2. Manual test shows:
   ```
   ✅ TEST PASSED: clientName update was correctly rejected
   ```

3. Frontend test shows error notification with helpful message

4. Other field updates (caseName, status, etc.) still work normally

---

## Next Steps After Tests Pass

Once backend rejection tests pass:

1. ✅ Mark "Backend Rejection Tests" complete in Phase 4 checklist
2. ⏳ Run enrichment tests
3. ⏳ Run integration tests
4. ⏳ Run performance tests
5. ⏳ Manual UI testing
6. ⏳ Ready for Phase 5 (schema change)

---

## Quick Reference

### Files to Check

1. **Backend validation**: [gas/services/SheetsService.gs](../../gas/services/SheetsService.gs) (lines 305-313)
2. **Frontend exclusion**: [src/components/metadata/CaseEditor.vue](../../src/components/metadata/CaseEditor.vue) (line 242)
3. **Error messages**: [src/i18n/en-US.js](../../src/i18n/en-US.js) (line 279)
4. **Test file**: [gas/tests/test_feature_007.gs](../../gas/tests/test_feature_007.gs)

### Functions to Run

- `runBackendRejectionTests()` - Quick backend test (3 tests)
- `runAllFeature007Tests()` - Complete test suite (12 tests)
- `runEnrichmentTests()` - Enrichment only (5 tests)
- `runPerformanceTests()` - Performance only (2 tests)

---

**Last Updated**: 2025-10-18
**Status**: Tests ready to run
**Phase**: 4 - Testing (With Column)
