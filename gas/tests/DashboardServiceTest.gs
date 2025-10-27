/**
 * DashboardServiceTest.gs
 * Test suite for DashboardService status normalization
 * Feature 017: Case-Insensitive Status Handling
 */

/**
 * Test helper: Assert two values are equal
 * @param {*} actual - Actual value
 * @param {*} expected - Expected value
 * @param {string} message - Assertion message
 */
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

/**
 * Test helper: Assert value is not null or undefined
 * @param {*} value - Value to check
 * @param {string} message - Assertion message
 */
function assertNotNull(value, message) {
  if (value === null || value === undefined) {
    throw new Error(`Assertion failed: ${message}\nValue is null or undefined`);
  }
}

/**
 * Test: _normalizeStatus() function
 * Tests basic normalization, multi-word statuses, whitespace handling, and empty/null values
 */
function testNormalizeStatus() {
  Logger.log('Testing _normalizeStatus...');

  // Test basic normalization
  assertEqual(DashboardService._normalizeStatus('open'), 'Open', 'lowercase should become title case');
  assertEqual(DashboardService._normalizeStatus('OPEN'), 'Open', 'uppercase should become title case');
  assertEqual(DashboardService._normalizeStatus('Open'), 'Open', 'title case should remain unchanged');

  // Test multi-word
  assertEqual(DashboardService._normalizeStatus('in progress'), 'In Progress', 'multi-word lowercase');
  assertEqual(DashboardService._normalizeStatus('IN PROGRESS'), 'In Progress', 'multi-word uppercase');

  // Test whitespace
  assertEqual(DashboardService._normalizeStatus(' open '), 'Open', 'trim whitespace');
  assertEqual(DashboardService._normalizeStatus('  In Progress  '), 'In Progress', 'trim multi-word');

  // Test empty/null
  assertEqual(DashboardService._normalizeStatus(''), 'Unknown', 'empty string');
  assertEqual(DashboardService._normalizeStatus(null), 'Unknown', 'null');
  assertEqual(DashboardService._normalizeStatus(undefined), 'Unknown', 'undefined');

  Logger.log('✅ All _normalizeStatus tests passed (8 assertions)');
}

/**
 * Test: getCasesByStatus() with normalized status values
 * Tests that mixed-case status values are properly consolidated
 */
function testGetCasesByStatusNormalization() {
  Logger.log('Testing getCasesByStatus normalization...');

  const testCases = [
    { status: 'Open', caseType: 'A', assignedTo: 'Attorney1', createdAt: '2025-01-01', lastUpdatedAt: '2025-01-02' },
    { status: 'OPEN', caseType: 'B', assignedTo: 'Attorney2', createdAt: '2025-01-01', lastUpdatedAt: '2025-01-02' },
    { status: 'open', caseType: 'A', assignedTo: 'Attorney1', createdAt: '2025-01-01', lastUpdatedAt: '2025-01-02' },
    { status: 'Closed', caseType: 'B', assignedTo: 'Attorney2', createdAt: '2025-01-01', lastUpdatedAt: '2025-01-10' },
    { status: 'CLOSED', caseType: 'A', assignedTo: 'Attorney1', createdAt: '2025-01-01', lastUpdatedAt: '2025-01-10' }
  ];

  // Pre-normalize (simulate _calculateMetrics behavior)
  testCases.forEach(c => {
    c._normalizedStatus = DashboardService._normalizeStatus(c.status);
  });

  const result = DashboardService.getCasesByStatus(testCases);

  // Should have exactly 2 status categories (not 5)
  assertEqual(result.length, 2, 'should consolidate to 2 unique statuses');

  // Find Open and Closed entries
  const openEntry = result.find(r => r.status === 'Open');
  const closedEntry = result.find(r => r.status === 'Closed');

  // Verify Open consolidation
  assertNotNull(openEntry, 'should have Open entry');
  assertEqual(openEntry.count, 3, 'Open should have count of 3');
  assertEqual(openEntry.percentage, 60, 'Open should be 60%');

  // Verify Closed consolidation
  assertNotNull(closedEntry, 'should have Closed entry');
  assertEqual(closedEntry.count, 2, 'Closed should have count of 2');
  assertEqual(closedEntry.percentage, 40, 'Closed should be 40%');

  Logger.log('✅ All getCasesByStatus normalization tests passed (5 assertions)');
}

/**
 * Main test runner
 * Execute all dashboard service tests
 */
function runDashboardServiceTests() {
  Logger.log('=== Running DashboardService Tests ===');

  try {
    testNormalizeStatus();
    testGetCasesByStatusNormalization();
    Logger.log('=== All tests passed ✅ (13 total assertions) ===');
  } catch (error) {
    Logger.log('=== Test failed ❌ ===');
    Logger.log('Error: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    throw error;
  }
}
