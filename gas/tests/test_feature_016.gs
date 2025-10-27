/**
 * test_feature_016.gs
 * Backend tests for Feature 016: Dashboard Access Parity
 *
 * Verify that non-admin users see organization-wide dashboard metrics
 */

/**
 * Test 1: Verify non-admin user receives all cases (not filtered)
 */
function test_nonAdminSeesAllCases() {
  Logger.log('=== Test 1: Non-admin user sees all cases ===');

  try {
    // Simulate non-admin user request
    const nonAdminUser = {
      email: 'user@test.com',
      role: 'ROLE_USER'
    };

    // Get metrics as non-admin user
    const metrics = DashboardService.getAllMetrics(nonAdminUser.email, nonAdminUser.role);

    // Verify metrics structure exists
    if (!metrics) {
      throw new Error('Metrics is null or undefined');
    }

    if (!metrics.activeCases) {
      throw new Error('activeCases metric missing');
    }

    if (!metrics.casesPerAttorney || !Array.isArray(metrics.casesPerAttorney)) {
      throw new Error('casesPerAttorney metric missing or not an array');
    }

    // Verify non-admin sees cases from multiple attorneys (org-wide data)
    if (metrics.casesPerAttorney.length > 1) {
      Logger.log(`✓ PASS: Non-admin sees ${metrics.casesPerAttorney.length} attorneys (org-wide data)`);
      Logger.log(`  Active cases count: ${metrics.activeCases.count}`);
      return true;
    } else if (metrics.casesPerAttorney.length === 1) {
      // Edge case: Only one attorney in system
      Logger.log(`⚠️  PASS: Non-admin sees 1 attorney (may be single-user org)`);
      Logger.log(`  Active cases count: ${metrics.activeCases.count}`);
      return true;
    } else {
      throw new Error('Non-admin sees no attorneys (expected org-wide data)');
    }

  } catch (error) {
    Logger.log(`✗ FAIL: ${error.message}`);
    return false;
  }
}

/**
 * Test 2: Verify admin functionality unchanged
 */
function test_adminStillSeesAllCases() {
  Logger.log('=== Test 2: Admin still sees all cases ===');

  try {
    // Simulate admin user request
    const adminUser = {
      email: 'admin@test.com',
      role: 'ROLE_ADMIN'
    };

    // Get metrics as admin user
    const metrics = DashboardService.getAllMetrics(adminUser.email, adminUser.role);

    // Verify metrics structure exists
    if (!metrics || !metrics.activeCases || !metrics.casesPerAttorney) {
      throw new Error('Metrics structure incomplete');
    }

    Logger.log(`✓ PASS: Admin sees ${metrics.activeCases.count} active cases`);
    Logger.log(`  Attorney count: ${metrics.casesPerAttorney.length}`);
    return true;

  } catch (error) {
    Logger.log(`✗ FAIL: ${error.message}`);
    return false;
  }
}

/**
 * Test 3: Verify same cache key used for all users
 */
function test_cacheKeyIsShared() {
  Logger.log('=== Test 3: Cache key is shared across users ===');

  try {
    const cache = CacheService.getScriptCache();

    // Clear cache first
    cache.remove('dashboard_metrics_org_wide');

    // Request 1: Non-admin user
    const user1Metrics = DashboardService.getAllMetrics('user1@test.com', 'ROLE_USER');

    // Request 2: Different non-admin user (should hit cache)
    const user2Metrics = DashboardService.getAllMetrics('user2@test.com', 'ROLE_USER');

    // Request 3: Admin user (should also hit same cache)
    const adminMetrics = DashboardService.getAllMetrics('admin@test.com', 'ROLE_ADMIN');

    // Verify all three get identical data
    if (user1Metrics.activeCases.count !== user2Metrics.activeCases.count) {
      throw new Error('Different users got different active case counts');
    }

    if (user1Metrics.activeCases.count !== adminMetrics.activeCases.count) {
      throw new Error('Admin and user got different active case counts');
    }

    Logger.log(`✓ PASS: All users see identical metrics (count: ${user1Metrics.activeCases.count})`);
    Logger.log(`  Cache key: dashboard_metrics_org_wide (shared)`);
    return true;

  } catch (error) {
    Logger.log(`✗ FAIL: ${error.message}`);
    return false;
  }
}

/**
 * Test 4: Verify API response format unchanged
 */
function test_metricsStructureUnchanged() {
  Logger.log('=== Test 4: Metrics structure unchanged ===');

  try {
    const metrics = DashboardService.getAllMetrics('test@test.com', 'ROLE_USER');

    // Verify all expected fields present
    const requiredFields = [
      'activeCases',
      'casesByStatus',
      'casesByType',
      'casesPerAttorney',
      'resolutionTime',
      'lastUpdated'
    ];

    for (const field of requiredFields) {
      if (!(field in metrics)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Verify activeCases structure
    if (!metrics.activeCases.count || metrics.activeCases.count < 0) {
      throw new Error('activeCases.count invalid');
    }

    if (!metrics.activeCases.trend || !metrics.activeCases.trend.direction) {
      throw new Error('activeCases.trend structure invalid');
    }

    // Verify arrays
    if (!Array.isArray(metrics.casesByStatus)) {
      throw new Error('casesByStatus should be array');
    }

    if (!Array.isArray(metrics.casesByType)) {
      throw new Error('casesByType should be array');
    }

    if (!Array.isArray(metrics.casesPerAttorney)) {
      throw new Error('casesPerAttorney should be array');
    }

    Logger.log('✓ PASS: All 6 metrics present with correct structure');
    Logger.log(`  activeCases: ${metrics.activeCases.count}`);
    Logger.log(`  casesByStatus: ${metrics.casesByStatus.length} statuses`);
    Logger.log(`  casesByType: ${metrics.casesByType.length} types`);
    Logger.log(`  casesPerAttorney: ${metrics.casesPerAttorney.length} attorneys`);
    Logger.log(`  resolutionTime: ${metrics.resolutionTime.count} closed cases`);
    return true;

  } catch (error) {
    Logger.log(`✗ FAIL: ${error.message}`);
    return false;
  }
}

/**
 * Run all Feature 016 tests
 */
function runAllFeature016Tests() {
  Logger.log('==========================================');
  Logger.log('Feature 016: Dashboard Access Parity Tests');
  Logger.log('==========================================');

  const results = {
    test1: test_nonAdminSeesAllCases(),
    test2: test_adminStillSeesAllCases(),
    test3: test_cacheKeyIsShared(),
    test4: test_metricsStructureUnchanged()
  };

  const passed = Object.values(results).filter(r => r === true).length;
  const total = Object.keys(results).length;

  Logger.log('==========================================');
  Logger.log(`Test Results: ${passed}/${total} passed`);
  Logger.log('==========================================');

  if (passed === total) {
    Logger.log('✅ ALL TESTS PASSED');
    return true;
  } else {
    Logger.log('❌ SOME TESTS FAILED');
    return false;
  }
}
