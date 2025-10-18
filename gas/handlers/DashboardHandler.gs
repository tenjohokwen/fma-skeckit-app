/**
 * DashboardHandler.gs
 * Handler for dashboard analytics endpoints
 * Feature 008: Dashboard Analytics
 */

const DashboardHandler = {
  /**
   * Get all dashboard metrics
   * @param {Object} context - Request context (contains user info)
   * @returns {Object} Response with metrics
   */
  getMetrics: function(context) {
    try {
      const metrics = DashboardService.getAllMetrics(
        context.user.email,
        context.user.role
      );

      const newToken = TokenManager.generateToken(context.user.email);

      return ResponseHandler.successWithToken(
        'dashboard.metrics.success',
        'Dashboard metrics retrieved successfully',
        { metrics: metrics },
        context.user,
        newToken.value
      );

    } catch (error) {
      if (error.status) throw error;

      throw ResponseHandler.serverError(
        'Failed to fetch dashboard metrics: ' + error.toString(),
        'dashboard.metrics.error.server'
      );
    }
  }
};
