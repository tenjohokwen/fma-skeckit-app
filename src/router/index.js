import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/authStore'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  /**
   * Global navigation guard
   * Checks authentication status and permissions before each route
   */
  Router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore()

    // Check if route requires authentication
    if (to.meta.requiresAuth) {
      if (!authStore.isAuthenticated) {
        // Not authenticated, redirect to login
        next({
          name: 'login',
          query: { redirect: to.fullPath }
        })
        return
      }

      // Check if token is still valid
      if (!authStore.isTokenValid) {
        // Token expired, clear auth and redirect to login
        authStore.clearAuth()
        next({
          name: 'login',
          query: { redirect: to.fullPath, expired: 'true' }
        })
        return
      }

      // Check if route requires admin role
      if (to.meta.requiresAdmin && !authStore.isAdmin) {
        // Not admin, redirect to dashboard
        next({ name: 'dashboard' })
        return
      }
    }

    // Check if route should be hidden for authenticated users
    if (to.meta.hideForAuth && authStore.isAuthenticated) {
      // Already authenticated, redirect to dashboard
      next({ name: 'dashboard' })
      return
    }

    // All checks passed
    next()
  })

  return Router
})
