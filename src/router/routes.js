/**
 * Application Routes
 *
 * Defines all routes with lazy loading and metadata for guards.
 * Per constitution: Lazy load all route components for performance.
 */

const routes = [
  // Public routes - No authentication required (EmptyLayout for auth pages)
  {
    path: '/',
    component: () => import('layouts/EmptyLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/HomePage.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'signup',
        name: 'signup',
        component: () => import('pages/auth/SignUpPage.vue'),
        meta: { requiresAuth: false, hideForAuth: true }
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/auth/LoginPage.vue'),
        meta: { requiresAuth: false, hideForAuth: true }
      },
      {
        path: 'verify-email',
        name: 'verify-email',
        component: () => import('pages/auth/EmailVerificationPage.vue'),
        meta: { requiresAuth: false }
      }
    ]
  },

  // Authenticated routes - Requires login (MainLayout for app pages)
  {
    path: '/app',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'search',
        name: 'search',
        component: () => import('pages/SearchPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'case/:id',
        name: 'case-view',
        component: () => import('pages/CaseViewPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'case/:id/edit',
        name: 'case-edit',
        component: () => import('pages/CaseEditPage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'files',
        name: 'files',
        component: () => import('pages/FileManagementPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'clients',
        name: 'clients',
        component: () => import('pages/ClientManagementPage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('pages/ProfilePage.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },

  // Always leave this as last one - 404 catch all
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
