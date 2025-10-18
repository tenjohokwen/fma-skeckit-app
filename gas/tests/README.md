# Google Apps Script Tests

Test suite for backend functionality.

## Feature 007 Tests

**File**: [test_feature_007.gs](test_feature_007.gs)

### Test Coverage

#### Unit Tests (4 tests)
- ✅ `enrichCaseWithClientName` - Valid client
- ✅ `enrichCaseWithClientName` - Missing client (fallback message)
- ✅ `enrichCaseWithClientName` - No clientId (fallback message)
- ✅ `enrichCasesWithClientNames` - Batch enrichment with optimization

#### Backend Rejection Tests (3 tests)
- ✅ `updateCase` - Reject clientName update (Feature 007)
- ✅ `updateCase` - Allow other field updates
- ✅ `updateCase` - Reject clientId update (Feature 006)

#### Integration Tests (3 tests)
- ✅ `getCaseById` - Returns enriched case
- ✅ `searchCasesByName` - Returns enriched results
- ✅ Client name stays current after client update

#### Performance Tests (2 tests)
- ✅ Single case fetch performance (target: < 500ms)
- ✅ Batch vs individual enrichment comparison

**Total**: 12 comprehensive tests

---

## How to Run Tests

### Option 1: Run All Tests

1. Open your Google Apps Script project
2. Navigate to the test file: `test_feature_007.gs`
3. Select function: `runAllFeature007Tests`
4. Click "Run" (▶️)
5. Check the "Execution log" for results

**Output**: Complete test report with pass/fail status

### Option 2: Run Backend Rejection Tests Only

For quick verification of clientName immutability:

1. Select function: `runBackendRejectionTests`
2. Click "Run"
3. Check execution log

**Tests**:
- Reject clientName update ✅
- Allow other updates ✅
- Reject clientId update ✅

### Option 3: Run Enrichment Tests Only

To test client name enrichment functionality:

1. Select function: `runEnrichmentTests`
2. Click "Run"
3. Check execution log

### Option 4: Run Performance Tests Only

To measure enrichment performance:

1. Select function: `runPerformanceTests`
2. Click "Run"
3. Check execution log for timing metrics

### Option 5: Run Individual Tests

You can also run any individual test function:
- `test_enrichCaseWithClientName_validClient()`
- `test_updateCase_rejectClientNameUpdate()`
- etc.

---

## Understanding Test Results

### Success Output

```
✅ PASS: enrichCaseWithClientName - Valid Client
✅ PASS: updateCase - Reject clientName Update
✅ PASS: getCaseById - Returns Enriched Case

==========================================================
TEST SUMMARY
==========================================================
Total Tests: 12
✅ Passed: 12
❌ Failed: 0
==========================================================
```

### Failure Output

```
❌ FAIL: updateCase - Reject clientName Update
   Error: Expected function to throw an error

==========================================================
TEST SUMMARY
==========================================================
Total Tests: 12
✅ Passed: 11
❌ Failed: 1

Failed Tests:
  - updateCase - Reject clientName Update: Expected function to throw...
==========================================================
```

---

## Test Details

### Test 1-4: Enrichment Unit Tests

**Purpose**: Verify client name enrichment works correctly

**What's Tested**:
- ✅ Valid client → Returns "FirstName LastName"
- ✅ Missing client → Returns "[Client Not Found]"
- ✅ No clientId → Returns "[No Client]"
- ✅ Batch enrichment → Efficiently enriches multiple cases

**Expected Behavior**:
- Client name fetched from clients sheet using clientId
- Fallback messages for error cases
- Batch optimization avoids N+1 queries

---

### Test 5-7: Backend Rejection Tests ⭐ IMPORTANT

**Purpose**: Verify backend rejects clientName updates (Feature 007)

#### Test 5: Reject clientName Update

**What it does**:
```javascript
// Try to update clientName (should be REJECTED)
const updates = {
  caseName: 'Updated Case Name',
  clientName: 'Hacker Name' // ❌ Should fail
};

SheetsService.updateCase(caseId, updates, version, user);
```

**Expected Result**: Throws error with message containing "clientName cannot be updated"

**Why Important**: Ensures users can't change client names from case details

---

#### Test 6: Allow Other Updates

**What it does**:
```javascript
// Update other fields (should SUCCEED)
const updates = {
  caseName: 'Updated',
  assignedTo: 'John Doe',
  status: 'In Progress',
  notes: 'New notes'
  // NO clientName field
};

const updated = SheetsService.updateCase(caseId, updates, version, user);
```

**Expected Result**: Update succeeds, client name still enriched correctly

**Why Important**: Ensures normal updates still work

---

#### Test 7: Reject clientId Update

**What it does**: Verifies existing Feature 006 validation still works

**Expected Result**: Throws error "clientId is immutable"

---

### Test 8-10: Integration Tests

**Purpose**: Verify end-to-end enrichment flows

**Test 8**: `getCaseById` returns enriched case
**Test 9**: `searchCasesByName` returns enriched results
**Test 10**: Client name updates when client info changes

---

### Test 11-12: Performance Tests

**Purpose**: Measure enrichment overhead

#### Test 11: Single Case Fetch

**Target**: < 500ms
**Measures**: Time to fetch and enrich one case

**Sample Output**:
```
Single case fetch time: 287ms
✅ Performance OK: 287ms < 500ms
```

#### Test 12: Batch Enrichment

**Measures**: Batch enrichment vs individual enrichment

**Sample Output**:
```
Individual enrichment (10 cases): 1240ms
Batch enrichment (10 cases): 520ms
Batch is 58% faster
```

**Why Important**: Validates batch optimization works

---

## Interpreting Results

### All Tests Pass ✅

✅ **Feature 007 is working correctly!**

You can proceed to:
- Manual UI testing
- Phase 5 (schema change)

### Some Tests Fail ❌

⚠️ **Fix issues before proceeding**

1. Check execution log for error details
2. Fix the issue
3. Re-run tests
4. Do NOT proceed to Phase 5 until all tests pass

---

## Test Data Cleanup

**Note**: Tests create test data in your sheets:
- Test clients with names like `TestFirst1729270800000`
- Test cases with IDs like `TEST-CASE-1729270800000`

**Cleanup Options**:

1. **Manual**: Delete test rows from sheets
2. **Automated** (future): Add cleanup functions to tests

**Identifying Test Data**:
- Client names start with "TestFirst" or "TestLast"
- Case IDs start with "TEST-CASE-"
- National IDs start with "TEST-ID-"

---

## Troubleshooting

### "SheetsService is not defined"

**Cause**: Script files not loaded in correct order

**Fix**: Ensure all service files are in your project:
- `SheetsService.gs`
- `DriveService.gs`
- `ResponseHandler.gs`
- etc.

### "Client not found" errors

**Cause**: Test trying to use non-existent client

**Fix**: Tests create their own test data - should not happen

### "Permission denied" errors

**Cause**: Script lacks permissions

**Fix**: Re-authorize the script

### Tests timeout

**Cause**: Too much data or slow operations

**Fix**:
- Run smaller test sets
- Clean up old test data
- Check sheet size

---

## Adding New Tests

To add a new test:

1. **Create test function**:
```javascript
function test_yourTestName() {
  const testName = 'Your Test Name';

  try {
    // Setup
    const client = createTestClient();

    // Test
    const result = SheetsService.someMethod();

    // Verify
    assert(result, 'Result should exist');

    TestResults.pass(testName);
  } catch (error) {
    TestResults.fail(testName, error.message);
  }
}
```

2. **Add to test runner**:
```javascript
function runAllFeature007Tests() {
  const tests = [
    // ... existing tests ...
    test_yourTestName  // Add here
  ];

  tests.forEach(test => test());
  TestResults.summary();
}
```

3. **Run and verify**

---

## Best Practices

1. **Always run all tests** before Phase 5 (schema change)
2. **Check execution log** for warnings
3. **Re-run failed tests** individually for debugging
4. **Clean up test data** periodically
5. **Document new tests** in this README

---

## Test Checklist for Phase 4

Before proceeding to Phase 5 (schema change):

- [ ] All 12 automated tests passing
- [ ] Performance tests show acceptable times
- [ ] No enrichment failures logged
- [ ] Manual UI testing complete
- [ ] Test data cleaned up
- [ ] Team approval obtained

---

**Last Updated**: 2025-10-18
**Test File Version**: 1.0
**Feature**: 007 - Remove clientName from Metadata Sheet
**Status**: Ready for Phase 4 Testing
