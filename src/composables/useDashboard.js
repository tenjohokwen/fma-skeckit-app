import { ref } from 'vue'
import { api } from 'src/services/api'

/**
 * Composable for dashboard analytics data fetching
 * Feature 008: Dashboard Analytics
 * @returns {Object} Dashboard state and methods
 */
export function useDashboard() {
  const metrics = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Fetch dashboard metrics from API
   */
  async function fetchMetrics() {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('dashboard.getMetrics', {})

      // Check for successful response (status 200 or success flag)
      if (response.status === 200 || response.success) {
        metrics.value = response.data.metrics
      } else {
        throw new Error(response.message || 'Failed to fetch metrics')
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    metrics,
    isLoading,
    error,
    fetchMetrics
  }
}
