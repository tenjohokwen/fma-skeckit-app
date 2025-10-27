/**
 * DashboardService.gs
 * Service for aggregating and calculating dashboard analytics metrics
 * Feature 008: Dashboard Analytics
 */

const DashboardService = {
  CACHE_TTL: 300, // 5 minutes

  /**
   * Gets all dashboard metrics (with caching)
   * @param {string} userEmail - Current user's email
   * @param {string} userRole - User's role (ROLE_ADMIN or ROLE_USER)
   * @returns {Object} Dashboard metrics
   * Feature 016: Shared cache for organization-wide metrics
   */
  getAllMetrics: function(userEmail, userRole) {
    const cache = CacheService.getScriptCache();
    const cacheKey = 'dashboard_metrics_org_wide'; // Shared cache across all users

    // Try to get from cache
    const cached = cache.get(cacheKey);
    if (cached) {
      Logger.log(`✓ Cache hit for ${cacheKey}`);
      return JSON.parse(cached);
    }

    Logger.log(`✗ Cache miss for ${cacheKey}, calculating fresh metrics...`);

    // Calculate fresh metrics
    const metrics = this._calculateMetrics(userEmail, userRole);

    // Store in cache
    cache.put(cacheKey, JSON.stringify(metrics), this.CACHE_TTL);

    return metrics;
  },

  /**
   * Internal: Calculate fresh metrics
   * @private
   */
  _calculateMetrics: function(userEmail, userRole) {
    const cases = this._getFilteredCases(userEmail, userRole);

    // Handle empty dataset gracefully
    if (!Array.isArray(cases) || cases.length === 0) {
      return {
        activeCases: { count: 0, trend: { direction: 'neutral', percentage: 0, change: 0 } },
        casesByStatus: [],
        casesByType: [],
        casesPerAttorney: [],
        resolutionTime: { average: 0, median: 0, min: 0, max: 0, percentile75: 0, percentile90: 0, count: 0 },
        lastUpdated: DateUtil.getCurrentTimestamp()
      };
    }

    return {
      activeCases: this.getActiveCasesMetric(cases),
      casesByStatus: this.getCasesByStatus(cases),
      casesByType: this.getCasesByType(cases),
      casesPerAttorney: this.getCasesPerAttorney(cases),
      resolutionTime: this.getResolutionMetrics(cases),
      lastUpdated: DateUtil.getCurrentTimestamp()
    };
  },

  /**
   * Get all cases for organization-wide metrics
   * @private
   * Feature 016: Dashboard Access Parity - All users see org-wide data
   */
  _getFilteredCases: function(userEmail, userRole) {
    // Return all cases for organization-wide metrics (no role-based filtering)
    return SheetsService.getAllCases();
  },

  /**
   * Get active cases count with trend
   * @param {Array} cases - Array of case objects
   * @returns {Object} Active cases metric
   */
  getActiveCasesMetric: function(cases) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Current active cases (status ≠ 'Closed')
    const currentActive = cases.filter(c => c.status !== 'Closed').length;

    // Previous period: cases created before 30 days ago that are still active
    const previousCases = cases.filter(c => {
      const createdDate = new Date(c.createdAt);
      return createdDate < thirtyDaysAgo && c.status !== 'Closed';
    }).length;

    const trend = this._calculateTrend(currentActive, previousCases);

    return {
      count: currentActive,
      trend: trend
    };
  },

  /**
   * Get cases grouped by status
   * @param {Array} cases - Array of case objects
   * @returns {Array} Array of status metrics
   */
  getCasesByStatus: function(cases) {
    const statusCounts = {};

    cases.forEach(c => {
      const status = c.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status,
      count: count,
      percentage: Math.round((count / cases.length) * 100)
    }));
  },

  /**
   * Get cases grouped by type (top 10 + Other)
   * @param {Array} cases - Array of case objects
   * @returns {Array} Array of type metrics, sorted by count descending
   */
  getCasesByType: function(cases) {
    const typeCounts = {};

    cases.forEach(c => {
      const type = c.caseType || 'Uncategorized';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    // Sort by count descending
    const sorted = Object.entries(typeCounts)
      .map(([type, count]) => ({
        type: type,
        count: count,
        percentage: Math.round((count / cases.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    // Group remaining into "Other" if more than 10 types
    if (sorted.length > 10) {
      const top10 = sorted.slice(0, 10);
      const others = sorted.slice(10);
      const otherCount = others.reduce((sum, item) => sum + item.count, 0);

      top10.push({
        type: 'Other',
        count: otherCount,
        percentage: Math.round((otherCount / cases.length) * 100)
      });

      return top10;
    }

    return sorted;
  },

  /**
   * Get active cases per attorney with workload levels
   * @param {Array} cases - Array of case objects
   * @returns {Array} Array of attorney metrics, sorted by count descending
   */
  getCasesPerAttorney: function(cases) {
    // Only count active cases (status ≠ 'Closed')
    const activeCases = cases.filter(c => c.status !== 'Closed');
    const attorneyCounts = {};

    activeCases.forEach(c => {
      const attorney = c.assignedTo || 'Unassigned';
      attorneyCounts[attorney] = (attorneyCounts[attorney] || 0) + 1;
    });

    return Object.entries(attorneyCounts)
      .map(([attorney, count]) => ({
        attorney: attorney,
        count: count,
        level: this._getWorkloadLevel(count)
      }))
      .sort((a, b) => b.count - a.count);
  },

  /**
   * Get resolution time metrics for closed cases
   * @param {Array} cases - Array of case objects
   * @returns {Object} Resolution metrics
   */
  getResolutionMetrics: function(cases) {
    const closedCases = cases.filter(c => c.status === 'Closed');

    const resolutionTimes = closedCases.map(c => {
      const created = new Date(c.createdAt);
      const closed = new Date(c.lastUpdatedAt); // Proxy for close date
      return Math.floor((closed - created) / (1000 * 60 * 60 * 24)); // days
    }).filter(days => days >= 0); // Filter out invalid data

    if (resolutionTimes.length === 0) {
      return {
        average: 0,
        median: 0,
        min: 0,
        max: 0,
        percentile75: 0,
        percentile90: 0,
        count: 0
      };
    }

    const sorted = resolutionTimes.sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);

    return {
      average: Math.round(sum / sorted.length),
      median: sorted[Math.floor(sorted.length / 2)],
      min: sorted[0],
      max: sorted[sorted.length - 1],
      percentile75: sorted[Math.floor(sorted.length * 0.75)],
      percentile90: sorted[Math.floor(sorted.length * 0.90)],
      count: sorted.length
    };
  },

  /**
   * Calculate trend between two values
   * @private
   * @param {number} current - Current value
   * @param {number} previous - Previous value
   * @returns {Object} Trend object with direction, percentage, change
   */
  _calculateTrend: function(current, previous) {
    if (previous === 0) {
      return { direction: 'neutral', percentage: 0, change: 0 };
    }

    const change = current - previous;
    const percentage = Math.round((change / previous) * 100);
    const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

    return {
      direction: direction,
      percentage: percentage,
      change: change
    };
  },

  /**
   * Get workload level based on case count
   * @private
   * @param {number} count - Number of active cases
   * @returns {string} Workload level: 'low' | 'medium' | 'high' | 'overloaded'
   */
  _getWorkloadLevel: function(count) {
    if (count <= 10) return 'low';
    if (count <= 20) return 'medium';
    if (count <= 30) return 'high';
    return 'overloaded';
  }
};
