/**
 * test_feature_007.gs
 *
 * Test suite for Feature 007: Remove clientName from Metadata Sheet
 *
 * Tests:
 * - Client name enrichment (single and batch)
 * - Backend rejection of clientName updates
 * - Folder renaming on client updates
 * - Search functionality with enrichment
 * - Performance benchmarks
 *
 * How to run:
 * 1. Open Google Apps Script editor
 * 2. Run individual test functions or runAllFeature007Tests()
 * 3. Check execution log for results
 */

// ==================== TEST UTILITIES ====================

/**
 * Test result tracker
 */
const TestResults = {
  passed: [],
  failed: [],

  pass: function(testName) {
    this.passed.push(testName);
    Logger.log(`✅ PASS: ${testName}`);
  },

  fail: function(testName, error) {
    this.failed.push({ test: testName, error: error });
    Logger.log(`❌ FAIL: ${testName}`);
    Logger.log(`   Error: ${error}`);
  },

  reset: function() {
    this.passed = [];
    this.failed = [];
  },

  summary: function() {
    Logger.log('');
    Logger.log('='.repeat(60));
    Logger.log('TEST SUMMARY');
    Logger.log('='.repeat(60));
    Logger.log(`Total Tests: ${this.passed.length + this.failed.length}`);
    Logger.log(`✅ Passed: ${this.passed.length}`);
    Logger.log(`❌ Failed: ${this.failed.length}`);

    if (this.failed.length > 0) {
      Logger.log('');
      Logger.log('Failed Tests:');
      this.failed.forEach(f => {
        Logger.log(`  - ${f.test}: ${f.error}`);
      });
    }
    Logger.log('='.repeat(60));

    return {
      total: this.passed.length + this.failed.length,
      passed: this.passed.length,
      failed: this.failed.length,
      failedTests: this.failed
    };
  }
};

/**
 * Assert helper
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

/**
 * Assert equals helper
 */
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, but got ${actual}`);
  }
}

/**
 * Assert throws helper
 */
function assertThrows(fn, expectedMessage, testMessage) {
  let threw = false;
  let error = null;

  try {
    fn();
  } catch (e) {
    threw = true;
    error = e;
  }

  assert(threw, testMessage || 'Expected function to throw an error');

  if (expectedMessage) {
    assert(
      error.message.includes(expectedMessage) || error.toString().includes(expectedMessage),
      `Expected error message to contain "${expectedMessage}", but got: ${error.message || error.toString()}`
    );
  }
}

// ==================== TEST DATA SETUP ====================

/**
 * Creates a test client for testing
 * @returns {Object} Created client with clientId
 */
function createTestClient() {
  const timestamp = Date.now();
  const clientData = {
    clientId: Utilities.getUuid(),
    firstName: `TestFirst${timestamp}`,
    lastName: `TestLast${timestamp}`,
    nationalId: `TEST-ID-${timestamp}`,
    telephone: '1234567890',
    email: 'test@example.com',
    folderId: '' // Will be set if folder created
  };

  return SheetsService.createClient(clientData);
}

/**
 * Creates a test case for testing
 * @param {string} clientId - Client ID to associate with
 * @returns {Object} Created case
 */
function createTestCase(clientId) {
  const timestamp = Date.now();
  const client = SheetsService.getClientById(clientId);

  const caseData = {
    caseId: `TEST-CASE-${timestamp}`,
    caseName: `Test Case ${timestamp}`,
    clientId: clientId,
    clientName: `${client.firstName} ${client.lastName}`, // Will be stored temporarily
    assignedTo: '',
    caseType: 'Test Type',
    status: 'Open',
    notes: 'This is a test case'
  };

  return SheetsService.createCase(caseData, 'test@example.com');
}

/**
 * Cleans up test data
 * @param {string} caseId - Case ID to delete
 */
function cleanupTestCase(caseId) {
  // Note: This would require a delete method in SheetsService
  // For now, tests will leave test data (can be manually cleaned)
  Logger.log(`Test case created: ${caseId} (manual cleanup may be needed)`);
}

// ==================== UNIT TESTS ====================

/**
 * Test 1: enrichCaseWithClientName - Valid Client
 */
function test_enrichCaseWithClientName_validClient() {
  const testName = 'enrichCaseWithClientName - Valid Client';

  try {
    // Setup: Create test client and case
    const client = createTestClient();
    const testCase = createTestCase(client.clientId);

    // Get case without system fields (simulates raw data)
    const rawCase = {
      caseId: testCase.caseId,
      caseName: testCase.caseName,
      clientId: client.clientId,
      clientName: '' // Empty, will be enriched
    };

    // Test: Enrich the case
    const enriched = SheetsService.enrichCaseWithClientName(rawCase);

    // Verify: Client name should be set
    assert(enriched.clientName, 'Client name should be set');
    assert(enriched.clientName.includes(client.firstName), `Client name should include firstName: ${client.firstName}`);
    assert(enriched.clientName.includes(client.lastName), `Client name should include lastName: ${client.lastName}`);
    assertEqual(enriched.clientName, `${client.firstName} ${client.lastName}`, 'Client name should be firstName + lastName');

    TestResults.pass(testName);
  } catch (error) {
    TestResults.fail(testName, error.message || error.toString());
  }
}

/**
 * Test 2: enrichCaseWithClientName - Missing Client
 */
function test_enrichCaseWithClientName_missingClient() {
  const testName = 'enrichCaseWithClientName - Missing Client';

  try {
    // Test data with non-existent clientId
    const rawCase = {
      caseId: 'TEST-CASE-MISSING',
      caseName: 'Test Case Missing Client',
      clientId: 'non-existent-client-id-12345',
      clientName: ''
    };

    // Test: Enrich the case
    const enriched = SheetsService.enrichCaseWithClientName(rawCase);

    // Verify: Should have fallback message
    assertEqual(enriched.clientName, '[Client Not Found]', 'Should show [Client Not Found] for missing client');

    TestResults.pass(testName);
  } catch (error) {
    TestResults.fail(testName, error.message || error.toString());
  }
}

/**
 * Test 3: enrichCaseWithClientName - No ClientId
 */
function test_enrichCaseWithClientName_noClientId() {
  const testName = 'enrichCaseWithClientName - No ClientId';

  try {
    // Test data without clientId
    const rawCase = {
      caseId: 'TEST-CASE-NO-ID',
      caseName: 'Test Case No Client ID',
      clientId: null,
      clientName: ''
    };

    // Test: Enrich the case
    const enriched = SheetsService.enrichCaseWithClientName(rawCase);

    // Verify: Should have fallback message
    assertEqual(enriched.clientName, '[No Client]', 'Should show [No Client] when clientId is missing');

    TestResults.pass(testName);
  } catch (error) {
    TestResults.fail(testName, error.message || error.toString());
  }
}

/**
 * Test 4: enrichCasesWithClientNames - Batch Enrichment
 */
function test_enrichCasesWithClientNames_batch() {
  const testName = 'enrichCasesWithClientNames - Batch Enrichment';

  try {
    // Setup: Create 3 test clients
    const client1 = createTestClient();
    const client2 = createTestClient();
    const client3 = createTestClient();

    // Create test cases
    const cases = [
      { caseId: 'C1', clientId: client1.clientId, clientName: '' },
      { caseId: 'C2', clientId: client2.clientId, clientName: '' },
      { caseId: 'C3', clientId: client1.clientId, clientName: '' }, // Same client as C1
      { caseId: 'C4', clientId: 'non-existent', clientName: '' },    // Non-existent client
      { caseId: 'C5', clientId: null, clientName: '' }               // No client
    ];

    // Test: Batch enrich
    const enriched = SheetsService.enrichCasesWithClientNames(cases);

    // Verify: All cases enriched
    assertEqual(enriched.length, 5, 'Should return same number of cases');

    // Case 1: Valid client
    assert(enriched[0].clientName.includes(client1.firstName), 'Case 1 should have client1 name');

    // Case 2: Valid client
    assert(enriched[1].clientName.includes(client2.firstName), 'Case 2 should have client2 name');

    // Case 3: Same client as Case 1
    assertEqual(enriched[2].clientName, enriched[0].clientName, 'Case 3 should have same name as Case 1');

    // Case 4: Non-existent client
    assertEqual(enriched[3].clientName, '[Client Not Found]', 'Case 4 should show [Client Not Found]');

    // Case 5: No client
    assertEqual(enriched[4].clientName, '[No Client]', 'Case 5 should show [No Client]');

    TestResults.pass(testName);
  } catch (error) {
    TestResults.fail(testName, error.message || error.toString());
  }
}

// ==================== BACKEND REJECTION TESTS ====================

/**
 * Test 5: updateCase - Reject clientName Update
 */
function test_updateCase_rejectClientNameUpdate() {
  const testName = 'updateCase - Reject clientName Update';

  try {
    // Setup: Create test client and case
    const client = createTestClient();
    const testCase = createTestCase(client.clientId);

    // Test: Try to update clientName
    const updates = {
      caseName: 'Updated Case Name',
      clientName: 'Hacker Name' // Should be rejected
    };

    // Verify: Should throw validation error
    assertThrows(
      function() {
        SheetsService.updateCase(testCase.caseId, updates, testCase.version, 'test@example.com');
      },
      'clientName cannot be updated',
      'Should reject clientName update with appropriate error message'
    );

    TestResults.pass(testName);
  } catch (error) {
    TestResults.fail(testName, error.message || error.toString());
  }
}

/**
 * Test 6: updateCase - Allow Other Field Updates
 */
function test_updateCase_allowOtherUpdates() {
  const testName = 'updateCase - Allow Other Field Updates';

  try {
    // Setup: Create test client and case
    const client = createTestClient();
    const testCase = createTestCase(client.clientId);

    // Test: Update other fields (NOT clientName)
    const updates = {
      caseName: 'Updated Case Name',
      assignedTo: 'John Doe',
      status: 'In Progress',
      notes: 'Updated notes'
    };

    // Should succeed
    const updatedCase = SheetsService.updateCase(testCase.caseId, updates, testCase.version, 'test@example.com');

    // Verify: Updates applied
    assertEqual(updatedCase.caseName, 'Updated Case Name', 'Case name should be updated');
    assertEqual(updatedCase.assignedTo, 'John Doe', 'Assigned to should be updated');
    assertEqual(updatedCase.status, 'In Progress', 'Status should be updated');
    assertEqual(updatedCase.notes, 'Updated notes', 'Notes should be updated');

    // Verify: Client name still enriched correctly
    assert(updatedCase.clientName.includes(client.firstName), 'Client name should still be enriched from clients sheet');

    TestResults.pass(testName);
  } catch (error) {
    TestResults.fail(testName, error.message || error.toString());
  }
}

/**
 * Test 7: updateCase - Reject clientId Update (existing validation)
 */
function test_updateCase_rejectClientIdUpdate() {
  const testName = 'updateCase - Reject clientId Update';

  try {
    // Setup: Create test client and case
    const client = createTestClient();
    const testCase = createTestCase(client.clientId);

    // Test: Try to update clientId
    const updates = {
      clientId: 'new-client-id-12345' // Should be rejected
    };

    // Verify: Should throw validation error
    assertThrows(
      function() {
        SheetsService.updateCase(testCase.caseId, updates, testCase.version, 'test@example.com');
      },
      'clientId is immutable',
      'Should reject clientId update'
    );

    TestResults.pass(testName);
  } catch (error) {
    TestResults.fail(testName, error.message || error.toString());
  }
}

// ==================== INTEGRATION TESTS ====================

/**
 * Test 8: getCaseById - Returns Enriched Case
 */
function test_getCaseById_returnsEnrichedCase() {
  const testName = 'getCaseById - Returns Enriched Case';

  try {
    // Setup: Create test client and case
    const client = createTestClient();
    const testCase = createTestCase(client.clientId);

    // Test: Fetch case by ID
    const fetchedCase = SheetsService.getCaseById(testCase.caseId);

    // Verify: Case returned with enriched client name
    assert(fetchedCase, 'Case should be found');
    assertEqual(fetchedCase.caseId, testCase.caseId, 'Case ID should match');
    assert(fetchedCase.clientName, 'Client name should be present');
    assert(fetchedCase.clientName.includes(client.firstName), 'Client name should include firstName from clients sheet');
    assert(fetchedCase.clientName.includes(client.lastName), 'Client name should include lastName from clients sheet');

    TestResults.pass(testName);
  } catch (error) {
    TestResults.fail(testName, error.message || error.toString());
  }
}

/**
 * Test 9: searchCasesByName - Returns Enriched Results
 */
function test_searchCasesByName_returnsEnrichedResults() {
  const testName = 'searchCasesByName - Returns Enriched Results';

  try {
    // Setup: Create test client with unique name
    const timestamp = Date.now();
    const client = createTestClient();
    const testCase = createTestCase(client.clientId);

    // Test: Search by client first name
    const results = SheetsService.searchCasesByName(client.firstName, null);

    // Verify: Results include our test case
    assert(results.length > 0, 'Should find at least one case');

    // Find our test case in results
    const found = results.find(c => c.caseId === testCase.caseId);
    assert(found, 'Should find our test case in results');
    assert(found.clientName, 'Result should have enriched client name');
    assert(found.clientName.includes(client.firstName), 'Client name should be enriched correctly');

    TestResults.pass(testName);
  } catch (error) {
    TestResults.fail(testName, error.message || error.toString());
  }
}

/**
 * Test 10: Client Name Stays Current After Client Update
 */
function test_clientNameStaysCurrentAfterClientUpdate() {
  const testName = 'Client Name Stays Current After Client Update';

  try {
    // Setup: Create test client and case
    const client = createTestClient();
    const testCase = createTestCase(client.clientId);

    // Get initial case (with original client name)
    const initialCase = SheetsService.getCaseById(testCase.caseId);
    const initialClientName = initialCase.clientName;
    Logger.log(`Initial client name: ${initialClientName}`);

    // Update client's first name
    const newFirstName = `Updated${client.firstName}`;
    SheetsService.updateClient(client.clientId, { firstName: newFirstName });

    // Fetch case again (should have updated client name)
    const updatedCase = SheetsService.getCaseById(testCase.caseId);
    const newClientName = updatedCase.clientName;
    Logger.log(`New client name: ${newClientName}`);

    // Verify: Client name updated automatically
    assert(newClientName.includes(newFirstName), `Client name should include new firstName: ${newFirstName}`);
    assert(!newClientName.includes(client.firstName) || newFirstName.includes(client.firstName), 'Client name should not show old firstName (unless it\'s a substring)');
    assert(newClientName !== initialClientName, 'Client name should be different after client update');

    TestResults.pass(testName);
  } catch (error) {
    TestResults.fail(testName, error.message || error.toString());
  }
}

// ==================== PERFORMANCE TESTS ====================

/**
 * Test 11: Performance - Single Case Fetch
 */
function test_performance_singleCaseFetch() {
  const testName = 'Performance - Single Case Fetch';

  try {
    // Setup: Create test client and case
    const client = createTestClient();
    const testCase = createTestCase(client.clientId);

    // Test: Measure fetch time
    const startTime = Date.now();
    const fetchedCase = SheetsService.getCaseById(testCase.caseId);
    const endTime = Date.now();
    const duration = endTime - startTime;

    Logger.log(`Single case fetch time: ${duration}ms`);

    // Verify: Case fetched successfully
    assert(fetchedCase, 'Case should be fetched');
    assert(fetchedCase.clientName, 'Client name should be enriched');

    // Performance check: Should be under 500ms
    if (duration > 500) {
      Logger.log(`⚠️  WARNING: Single case fetch took ${duration}ms (target: < 500ms)`);
    } else {
      Logger.log(`✅ Performance OK: ${duration}ms < 500ms`);
    }

    TestResults.pass(testName);
  } catch (error) {
    TestResults.fail(testName, error.message || error.toString());
  }
}

/**
 * Test 12: Performance - Batch Enrichment vs Individual
 */
function test_performance_batchVsIndividual() {
  const testName = 'Performance - Batch vs Individual Enrichment';

  try {
    // Setup: Create 10 test clients
    const clients = [];
    const cases = [];

    for (let i = 0; i < 10; i++) {
      const client = createTestClient();
      clients.push(client);
      cases.push({
        caseId: `PERF-TEST-${i}`,
        clientId: client.clientId,
        clientName: ''
      });
    }

    // Test 1: Individual enrichment
    const startIndividual = Date.now();
    cases.forEach(c => SheetsService.enrichCaseWithClientName(c));
    const endIndividual = Date.now();
    const durationIndividual = endIndividual - startIndividual;

    // Reset client names
    cases.forEach(c => c.clientName = '');

    // Test 2: Batch enrichment
    const startBatch = Date.now();
    SheetsService.enrichCasesWithClientNames(cases);
    const endBatch = Date.now();
    const durationBatch = endBatch - startBatch;

    Logger.log(`Individual enrichment (10 cases): ${durationIndividual}ms`);
    Logger.log(`Batch enrichment (10 cases): ${durationBatch}ms`);
    Logger.log(`Batch is ${Math.round((1 - durationBatch/durationIndividual) * 100)}% faster`);

    // Verify: Batch should be faster or comparable
    assert(durationBatch <= durationIndividual * 1.2, 'Batch enrichment should be comparable or faster than individual');

    TestResults.pass(testName);
  } catch (error) {
    TestResults.fail(testName, error.message || error.toString());
  }
}

// ==================== TEST RUNNER ====================

/**
 * Runs all Feature 007 tests
 * Execute this function from Google Apps Script editor
 */
function runAllFeature007Tests() {
  Logger.log('');
  Logger.log('='.repeat(60));
  Logger.log('FEATURE 007 TEST SUITE');
  Logger.log('Remove clientName from Metadata Sheet');
  Logger.log('='.repeat(60));
  Logger.log('');

  // Reset test results
  TestResults.reset();

  // Run all tests
  const tests = [
    // Unit Tests
    test_enrichCaseWithClientName_validClient,
    test_enrichCaseWithClientName_missingClient,
    test_enrichCaseWithClientName_noClientId,
    test_enrichCasesWithClientNames_batch,

    // Backend Rejection Tests
    test_updateCase_rejectClientNameUpdate,
    test_updateCase_allowOtherUpdates,
    test_updateCase_rejectClientIdUpdate,

    // Integration Tests
    test_getCaseById_returnsEnrichedCase,
    test_searchCasesByName_returnsEnrichedResults,
    test_clientNameStaysCurrentAfterClientUpdate,

    // Performance Tests
    test_performance_singleCaseFetch,
    test_performance_batchVsIndividual
  ];

  Logger.log(`Running ${tests.length} tests...\n`);

  tests.forEach(test => {
    Logger.log(`Running: ${test.name}...`);
    test();
    Logger.log('');
  });

  // Print summary
  const summary = TestResults.summary();

  return summary;
}

/**
 * Quick test - Backend Rejection Only
 * Run this for quick verification of clientName immutability
 */
function runBackendRejectionTests() {
  Logger.log('');
  Logger.log('='.repeat(60));
  Logger.log('BACKEND REJECTION TESTS');
  Logger.log('='.repeat(60));
  Logger.log('');

  TestResults.reset();

  // Run only backend rejection tests
  test_updateCase_rejectClientNameUpdate();
  test_updateCase_allowOtherUpdates();
  test_updateCase_rejectClientIdUpdate();

  TestResults.summary();
}

/**
 * Quick test - Enrichment Only
 */
function runEnrichmentTests() {
  Logger.log('');
  Logger.log('='.repeat(60));
  Logger.log('ENRICHMENT TESTS');
  Logger.log('='.repeat(60));
  Logger.log('');

  TestResults.reset();

  test_enrichCaseWithClientName_validClient();
  test_enrichCaseWithClientName_missingClient();
  test_enrichCaseWithClientName_noClientId();
  test_enrichCasesWithClientNames_batch();
  test_getCaseById_returnsEnrichedCase();

  TestResults.summary();
}

/**
 * Quick test - Performance Only
 */
function runPerformanceTests() {
  Logger.log('');
  Logger.log('='.repeat(60));
  Logger.log('PERFORMANCE TESTS');
  Logger.log('='.repeat(60));
  Logger.log('');

  TestResults.reset();

  test_performance_singleCaseFetch();
  test_performance_batchVsIndividual();

  TestResults.summary();
}
