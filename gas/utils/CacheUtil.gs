/**
 * CacheUtil.gs
 * Cache management utilities for Google Apps Script
 * Feature 017: Case-Insensitive Status Handling
 */

/**
 * Clear dashboard metrics cache
 * Feature 017: Run once after deploying status normalization changes to force fresh metrics calculation
 *
 * Usage: Execute this function in Google Apps Script editor after deploying DashboardService changes
 */
function clearDashboardCache() {
  const cache = CacheService.getScriptCache();
  cache.remove('dashboard_metrics_org_wide');
  Logger.log('✅ Dashboard cache cleared - fresh metrics will be calculated on next request');
}

/**
 * Clear all script caches
 * WARNING: This will clear ALL cached data, not just dashboard metrics
 * Use with caution
 */
function clearAllCaches() {
  const cache = CacheService.getScriptCache();
  cache.removeAll(['dashboard_metrics_org_wide']);
  Logger.log('✅ All caches cleared');
}

/**
 * View current cache status
 * Helpful for debugging cache-related issues
 * @returns {Object} Cache status information
 */
function viewCacheStatus() {
  const cache = CacheService.getScriptCache();
  const dashboardCacheExists = cache.get('dashboard_metrics_org_wide') !== null;

  const status = {
    dashboard_metrics_org_wide: dashboardCacheExists ? 'EXISTS' : 'NOT CACHED',
    message: dashboardCacheExists
      ? 'Dashboard metrics are cached. Run clearDashboardCache() to invalidate.'
      : 'Dashboard metrics cache is empty. Next request will calculate fresh metrics.'
  };

  Logger.log(JSON.stringify(status, null, 2));
  return status;
}
