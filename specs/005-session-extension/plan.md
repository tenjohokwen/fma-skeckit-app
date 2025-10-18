# Feature 005: Session Extension - Implementation Plan

**Feature**: Session Extension with Token Refresh Warning
**Created**: 2025-10-17
**Estimated Effort**: 1 day (8 hours)
**Priority**: P1 (High)

---

## Table of Contents

1. [Overview](#overview)
2. [Implementation Phases](#implementation-phases)
3. [Detailed Tasks](#detailed-tasks)
4. [Testing Plan](#testing-plan)
5. [Deployment Strategy](#deployment-strategy)
6. [Rollback Plan](#rollback-plan)

---

## Overview

### Goals

- Implement proactive session expiration warning system
- Allow users to extend sessions without re-authentication
- Standardize all API response formats
- Prevent unexpected logouts and data loss

### Success Criteria

- ✅ All API responses follow standardized format
- ✅ Warning appears exactly 60 seconds before token expiration
- ✅ Session can be extended with one click
- ✅ Auto-logout works when session expires
- ✅ Multi-tab synchronization works correctly
- ✅ No regression in existing auth functionality

### Dependencies

- Existing JWT token system (15-minute TTL)
- Vue 3 + Quasar + Pinia stack
- Google Apps Script backend
- i18n system

---

## Implementation Phases

### Phase 0: Response Format Standardization (2 hours)
**Priority**: P0 (Critical - Foundation)
**Risk**: Medium - Touches all API responses

Update all backend handlers to return standardized response format with token object.

### Phase 1: Backend Ping Endpoint (1 hour)
**Priority**: P0 (Critical - Required for extension)
**Risk**: Low - Simple endpoint

Create `auth.ping` endpoint that validates token and returns new token with extended TTL.

### Phase 2: Session Monitor Composable (2 hours)
**Priority**: P0 (Critical - Core functionality)
**Risk**: Medium - Complex timer logic

Build `useSessionMonitor` composable with timer, warning trigger, and auto-logout.

### Phase 3: Warning Dialog Component (1.5 hours)
**Priority**: P0 (Critical - User interface)
**Risk**: Low - Standard UI component

Create modal dialog with countdown and action buttons.

### Phase 4: Integration & Multi-Tab Sync (1 hour)
**Priority**: P1 (High - Enhanced UX)
**Risk**: Medium - Cross-tab communication

Integrate session monitor into MainLayout and implement multi-tab synchronization.

### Phase 5: Testing & Bug Fixes (0.5 hours)
**Priority**: P0 (Critical - Quality assurance)
**Risk**: Low

Run comprehensive tests and fix issues.

---

## Detailed Tasks

### Phase 0: Response Format Standardization

#### Task 0.1: Update ResponseHandler Utility (30 min)
**File**: `gas/utils/ResponseHandler.gs`

**Current State**: ResponseHandler has various methods but doesn't enforce token inclusion

**Changes Required**:
```javascript
const ResponseHandler = {
  /**
   * Success response with optional token
   * @param {string} msgKey - i18n key
   * @param {string} message - Human-readable message
   * @param {Object} data - Response data
   * @param {Object} token - Token object {value, ttl, username}
   * @returns {Object} Standardized response
   */
  success: function(msgKey, message, data, token) {
    const response = {
      status: 200,
      msgKey: msgKey,
      message: message,
      data: data || null
    };

    // Only include token if provided
    if (token) {
      response.token = {
        value: token.value,
        ttl: token.ttl,
        username: token.username
      };
    }

    return response;
  },

  /**
   * Success response with token (authenticated endpoints)
   */
  successWithToken: function(msgKey, message, data, user, tokenValue) {
    return this.success(msgKey, message, data, {
      value: tokenValue,
      ttl: Date.now() + (15 * 60 * 1000), // 15 minutes
      username: user.email
    });
  },

  // ... existing error methods
};
```

**Testing**:
- [ ] Verify response structure matches spec
- [ ] Verify token object format
- [ ] Verify null data handling

#### Task 0.2: Update AuthHandler Responses (30 min)
**File**: `gas/handlers/AuthHandler.gs`

**Changes Required**:
- Update `login` to use `successWithToken`
- Update `signup` to use `successWithToken`
- Update `verifyEmail` to use `successWithToken`
- Ensure all return new token with TTL

**Example**:
```javascript
login: function(context) {
  // ... existing validation

  const token = TokenService.generateToken(user.email, user.role);

  return ResponseHandler.successWithToken(
    'auth.login.success',
    'Login successful',
    {
      email: user.email,
      role: user.role,
      status: user.status
    },
    user,
    token.value
  );
}
```

**Files to Update**:
- [x] `login` method
- [x] `signup` method
- [x] `verifyEmail` method

**Testing**:
- [ ] Login returns token with TTL
- [ ] Signup returns token with TTL
- [ ] Verify email returns token with TTL

#### Task 0.3: Update Other Handlers (30 min)
**Files**: All handlers that return authenticated responses

**Strategy**:
- Search for all methods that check `context.user`
- Add token refresh to responses
- Use SecurityInterceptor to generate new token

**Files to Check**:
- `gas/handlers/ClientHandler.gs`
- `gas/handlers/CaseHandler.gs`
- `gas/handlers/FileHandler.gs`
- `gas/handlers/MetadataHandler.gs`

**Implementation**:
```javascript
// Add to SecurityInterceptor or create TokenRefreshUtil
const TokenRefreshUtil = {
  addTokenToResponse: function(response, user) {
    const newToken = TokenService.generateToken(user.email, user.role);
    response.token = {
      value: newToken.value,
      ttl: newToken.ttl,
      username: user.email
    };
    return response;
  }
};

// Use in handlers:
const response = {
  status: 200,
  msgKey: 'client.search.success',
  message: 'Clients found',
  data: { clients: results }
};

return TokenRefreshUtil.addTokenToResponse(response, context.user);
```

**Testing**:
- [ ] All authenticated endpoints return token
- [ ] Token TTL is correct (15 min from now)
- [ ] Token is valid

#### Task 0.4: Update Router Token Handling (30 min)
**File**: `gas/utils/Router.gs`

**Current State**: Router validates tokens but doesn't refresh

**Changes Required**:
```javascript
const Router = {
  route: function(request) {
    // ... existing validation

    // After successful route handling
    const response = handler(context);

    // Auto-refresh token for all authenticated requests
    if (context.user && !response.token) {
      const newToken = TokenService.generateToken(
        context.user.email,
        context.user.role
      );
      response.token = {
        value: newToken.value,
        ttl: newToken.ttl,
        username: context.user.email
      };
    }

    return response;
  }
};
```

**Testing**:
- [ ] Token auto-refreshed on all authenticated calls
- [ ] Token not added to public endpoints
- [ ] TTL calculation is correct

---

### Phase 1: Backend Ping Endpoint

#### Task 1.1: Create Ping Endpoint (30 min)
**File**: `gas/handlers/AuthHandler.gs`

**Implementation**:
```javascript
const AuthHandler = {
  // ... existing methods

  /**
   * Ping endpoint to extend session
   * Simply validates token and returns new one
   *
   * @param {Object} context - Request context
   * @param {Object} context.user - Authenticated user (validated by SecurityInterceptor)
   * @returns {Object} Response with new token
   */
  ping: function(context) {
    // User is already authenticated by SecurityInterceptor
    // Just return success with new token

    const user = context.user;
    const newToken = TokenService.generateToken(user.email, user.role);

    return {
      status: 200,
      msgKey: 'token.refresh.success',
      message: 'Session extended',
      data: {
        email: user.email,
        role: user.role,
        status: user.status
      },
      token: {
        value: newToken.value,
        ttl: newToken.ttl,
        username: user.email
      }
    };
  }
};
```

**Testing**:
- [ ] Endpoint accessible with valid token
- [ ] Returns 401 with invalid token
- [ ] Returns new token with extended TTL
- [ ] Response format matches spec

#### Task 1.2: Register Ping Route (15 min)
**File**: `gas/utils/Router.gs`

**Changes Required**:
```javascript
const routes = {
  // ... existing routes
  'auth.ping': AuthHandler.ping,
  'auth.extendSession': AuthHandler.ping // Alias
};
```

**Testing**:
- [ ] Route registered correctly
- [ ] Action 'auth.ping' works
- [ ] Alias 'auth.extendSession' works

#### Task 1.3: Add Rate Limiting (15 min)
**File**: `gas/handlers/AuthHandler.gs`

**Implementation**:
```javascript
// Simple in-memory rate limiting (resets on script reload)
const PingRateLimiter = {
  attempts: {},

  checkLimit: function(email) {
    const now = Date.now();
    const key = email;

    if (!this.attempts[key]) {
      this.attempts[key] = { count: 1, resetAt: now + 60000 };
      return true;
    }

    if (now > this.attempts[key].resetAt) {
      this.attempts[key] = { count: 1, resetAt: now + 60000 };
      return true;
    }

    if (this.attempts[key].count >= 5) {
      return false; // Max 5 pings per minute
    }

    this.attempts[key].count++;
    return true;
  }
};

// In ping handler:
ping: function(context) {
  if (!PingRateLimiter.checkLimit(context.user.email)) {
    throw ResponseHandler.validationError(
      'Too many ping requests. Please wait.',
      'token.refresh.rateLimit'
    );
  }

  // ... rest of implementation
}
```

**Testing**:
- [ ] Allows 5 pings per minute
- [ ] Blocks 6th ping
- [ ] Resets after 1 minute

---

### Phase 2: Session Monitor Composable

#### Task 2.1: Create useSessionMonitor Composable (1 hour)
**File**: `src/composables/useSessionMonitor.js`

**Implementation**:
```javascript
/**
 * useSessionMonitor.js
 *
 * Monitors authentication token expiration and triggers warnings/logout.
 * Handles session extension and multi-tab synchronization.
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import { useRouter } from 'vue-router'
import { api } from 'src/services/api'

const WARNING_THRESHOLD = 60 // seconds before expiration to show warning
const UPDATE_INTERVAL = 1000 // 1 second

export function useSessionMonitor() {
  const authStore = useAuthStore()
  const router = useRouter()

  // State
  const isWarningVisible = ref(false)
  const timeRemaining = ref(0) // seconds
  const isExtending = ref(false)

  // Timers
  let updateTimerId = null
  let warningTimerId = null
  let logoutTimerId = null

  /**
   * Calculate seconds until token expires
   */
  function calculateTimeRemaining() {
    const ttl = authStore.tokenTTL
    if (!ttl) return 0

    const now = Date.now()
    const remaining = Math.max(0, Math.floor((ttl - now) / 1000))
    return remaining
  }

  /**
   * Update countdown every second
   */
  function updateCountdown() {
    timeRemaining.value = calculateTimeRemaining()

    if (timeRemaining.value === 0 && authStore.isAuthenticated) {
      handleExpiration()
    }
  }

  /**
   * Show warning dialog
   */
  function showWarning() {
    if (!authStore.isAuthenticated) return
    if (isWarningVisible.value) return // Already showing

    console.log('[SessionMonitor] Showing expiration warning')
    isWarningVisible.value = true
  }

  /**
   * Handle token expiration - auto logout
   */
  function handleExpiration() {
    console.log('[SessionMonitor] Token expired - logging out')

    stopMonitoring()
    authStore.logout()
    router.push({
      name: 'login',
      query: { expired: 'true' }
    })
  }

  /**
   * Extend session by calling ping endpoint
   */
  async function extendSession() {
    if (isExtending.value) return // Prevent duplicate requests

    isExtending.value = true

    try {
      console.log('[SessionMonitor] Extending session...')

      const response = await api.post('auth.ping', {})

      // Token automatically updated by api.js
      // Reset timers will be triggered by token-refreshed event

      isWarningVisible.value = false
      console.log('[SessionMonitor] Session extended successfully')

      return { success: true }
    } catch (error) {
      console.error('[SessionMonitor] Failed to extend session:', error)
      return {
        success: false,
        error: error.message || 'Failed to extend session'
      }
    } finally {
      isExtending.value = false
    }
  }

  /**
   * Start monitoring token expiration
   */
  function startMonitoring() {
    if (!authStore.isAuthenticated) {
      console.log('[SessionMonitor] Not authenticated, skipping monitor')
      return
    }

    stopMonitoring() // Clear existing timers

    const remaining = calculateTimeRemaining()
    console.log(`[SessionMonitor] Starting monitor. Token expires in ${remaining}s`)

    if (remaining <= 0) {
      handleExpiration()
      return
    }

    // Update countdown every second
    updateTimerId = setInterval(updateCountdown, UPDATE_INTERVAL)

    // Schedule warning
    const warningDelay = Math.max(0, (remaining - WARNING_THRESHOLD) * 1000)
    warningTimerId = setTimeout(showWarning, warningDelay)

    // Schedule auto-logout
    const logoutDelay = remaining * 1000
    logoutTimerId = setTimeout(handleExpiration, logoutDelay)

    // Initial update
    updateCountdown()
  }

  /**
   * Stop monitoring
   */
  function stopMonitoring() {
    if (updateTimerId) {
      clearInterval(updateTimerId)
      updateTimerId = null
    }
    if (warningTimerId) {
      clearTimeout(warningTimerId)
      warningTimerId = null
    }
    if (logoutTimerId) {
      clearTimeout(logoutTimerId)
      logoutTimerId = null
    }

    isWarningVisible.value = false
    timeRemaining.value = 0
  }

  /**
   * Handle token refresh from other sources (API calls, other tabs)
   */
  function handleTokenRefresh(event) {
    const newTTL = event.detail?.ttl || authStore.tokenTTL

    console.log('[SessionMonitor] Token refreshed, restarting monitor')

    // Close warning if open
    isWarningVisible.value = false

    // Restart monitoring with new TTL
    startMonitoring()
  }

  /**
   * Handle logout from other tabs
   */
  function handleStorageChange(event) {
    if (event.key === 'auth_token' && !event.newValue) {
      // Token removed in another tab - logout this tab too
      console.log('[SessionMonitor] Token removed in another tab, logging out')
      stopMonitoring()
      authStore.logout()
      router.push({ name: 'login' })
    }
  }

  /**
   * Format time remaining as MM:SS
   */
  const formattedTimeRemaining = computed(() => {
    const minutes = Math.floor(timeRemaining.value / 60)
    const seconds = timeRemaining.value % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  })

  // Lifecycle
  onMounted(() => {
    // Listen for token refresh events
    window.addEventListener('token-refreshed', handleTokenRefresh)
    window.addEventListener('storage', handleStorageChange)

    // Start monitoring if authenticated
    if (authStore.isAuthenticated) {
      startMonitoring()
    }
  })

  onUnmounted(() => {
    window.removeEventListener('token-refreshed', handleTokenRefresh)
    window.removeEventListener('storage', handleStorageChange)
    stopMonitoring()
  })

  return {
    // State
    isWarningVisible,
    timeRemaining,
    formattedTimeRemaining,
    isExtending,

    // Methods
    startMonitoring,
    stopMonitoring,
    extendSession,
    handleExpiration
  }
}
```

**Testing**:
- [ ] Timer starts correctly
- [ ] Countdown updates every second
- [ ] Warning shows at 60 seconds
- [ ] Auto-logout at 0 seconds
- [ ] Timer resets after extension
- [ ] Handles token refresh event
- [ ] Handles storage change event

#### Task 2.2: Update API Client for Token Events (30 min)
**File**: `src/services/api.js`

**Changes Required**:
```javascript
// In api.post method, after token storage:
if (response.data.token && response.data.token.value) {
  localStorage.setItem('auth_token', response.data.token.value)
  localStorage.setItem('auth_token_ttl', response.data.token.ttl)

  // Dispatch event for session monitor
  window.dispatchEvent(new CustomEvent('token-refreshed', {
    detail: {
      ttl: response.data.token.ttl,
      value: response.data.token.value
    }
  }))
}
```

**Testing**:
- [ ] Event dispatched on token refresh
- [ ] Event contains correct TTL
- [ ] Multiple listeners receive event

#### Task 2.3: Update Auth Store (30 min)
**File**: `src/stores/authStore.js`

**Changes Required**:
```javascript
// Add tokenTTL to state
const authStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    tokenTTL: null, // NEW: Track token expiration
    isAuthenticated: false
  }),

  actions: {
    setAuth(token, user) {
      this.token = token
      this.user = user
      this.isAuthenticated = true

      // Get TTL from localStorage
      const ttl = localStorage.getItem('auth_token_ttl')
      this.tokenTTL = ttl ? parseInt(ttl, 10) : null

      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))
    },

    logout() {
      this.token = null
      this.user = null
      this.tokenTTL = null
      this.isAuthenticated = false

      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_token_ttl')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_username')
    },

    // ... rest of store
  }
})
```

**Testing**:
- [ ] tokenTTL stored correctly
- [ ] tokenTTL cleared on logout
- [ ] tokenTTL restored on page reload

---

### Phase 3: Warning Dialog Component

#### Task 3.1: Create SessionExpirationDialog (1 hour)
**File**: `src/components/auth/SessionExpirationDialog.vue`

**Implementation**:
```vue
<template>
  <q-dialog
    v-model="show"
    persistent
    no-esc-dismiss
    no-backdrop-dismiss
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="min-width: 400px">
      <!-- Header -->
      <q-card-section class="row items-center bg-warning text-white">
        <q-icon name="warning" size="md" class="q-mr-sm" />
        <div class="text-h6">{{ $t('session.expiring.title') }}</div>
      </q-card-section>

      <!-- Content -->
      <q-card-section>
        <div class="text-body1 q-mb-md">
          {{ $t('session.expiring.message', { time: formattedTime }) }}
        </div>

        <!-- Countdown Timer -->
        <div class="text-center q-pa-md">
          <div class="text-h3 text-negative" :aria-live="'polite'">
            {{ formattedTime }}
          </div>
          <div class="text-caption text-grey-7">
            {{ $t('session.expiring.countdown') }}
          </div>
        </div>

        <!-- Error Message -->
        <q-banner
          v-if="error"
          dense
          rounded
          class="bg-negative text-white q-mt-md"
        >
          <template #avatar>
            <q-icon name="error" color="white" />
          </template>
          {{ error }}
        </q-banner>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          :label="$t('session.expiring.logoutButton')"
          color="grey-7"
          icon="logout"
          @click="handleLogout"
          :disable="isExtending"
        />
        <q-btn
          unelevated
          :label="$t('session.expiring.extendButton')"
          color="primary"
          icon="refresh"
          :loading="isExtending"
          @click="handleExtend"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

// Props
const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  timeRemaining: {
    type: Number,
    required: true
  },
  isExtending: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['extend', 'logout', 'update:show'])

// State
const error = ref(null)

// Computed
const formattedTime = computed(() => {
  const minutes = Math.floor(props.timeRemaining / 60)
  const seconds = props.timeRemaining % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// Methods
async function handleExtend() {
  error.value = null
  emit('extend')
}

function handleLogout() {
  emit('logout')
  authStore.logout()
  router.push({ name: 'login' })
}

// Watch for extension errors
watch(() => props.isExtending, (isExtending, wasExtending) => {
  if (wasExtending && !isExtending && props.show) {
    // Extension completed but dialog still showing = error
    error.value = t('token.refresh.error')
  }
})
</script>

<style scoped lang="scss">
.q-dialog__backdrop {
  background: rgba(0, 0, 0, 0.7) !important;
}
</style>
```

**Testing**:
- [ ] Dialog renders correctly
- [ ] Countdown updates in real-time
- [ ] Extend button triggers event
- [ ] Logout button triggers event
- [ ] Loading state shown during extend
- [ ] Error message displayed on failure
- [ ] Cannot dismiss by clicking outside
- [ ] Cannot dismiss with ESC key
- [ ] Keyboard accessible (Tab navigation)
- [ ] Screen reader announces countdown

#### Task 3.2: Add i18n Translations (30 min)
**File**: `src/i18n/en-US.js` and `src/i18n/fr-FR/index.js`

**English**:
```javascript
{
  "session": {
    "expiring": {
      "title": "Session Expiring Soon",
      "message": "Your session will expire in {time}",
      "countdown": "Time remaining",
      "extendButton": "Extend Session",
      "logoutButton": "Logout Now"
    },
    "expired": {
      "title": "Session Expired",
      "message": "Your session has expired. Please log in again.",
      "loginButton": "Log In"
    },
    "extended": {
      "success": "Session extended successfully",
      "failure": "Failed to extend session"
    }
  },
  "token": {
    "refresh": {
      "success": "Session extended",
      "error": "Failed to extend session. Please try again.",
      "rateLimit": "Too many requests. Please wait a moment."
    },
    "expired": "Your session has expired. Please log in again."
  }
}
```

**French**:
```javascript
{
  "session": {
    "expiring": {
      "title": "Session Expirant Bientôt",
      "message": "Votre session expirera dans {time}",
      "countdown": "Temps restant",
      "extendButton": "Prolonger la Session",
      "logoutButton": "Se Déconnecter"
    },
    "expired": {
      "title": "Session Expirée",
      "message": "Votre session a expiré. Veuillez vous reconnecter.",
      "loginButton": "Se Connecter"
    },
    "extended": {
      "success": "Session prolongée avec succès",
      "failure": "Impossible de prolonger la session"
    }
  },
  "token": {
    "refresh": {
      "success": "Session prolongée",
      "error": "Impossible de prolonger la session. Veuillez réessayer.",
      "rateLimit": "Trop de requêtes. Veuillez patienter."
    },
    "expired": "Votre session a expiré. Veuillez vous reconnecter."
  }
}
```

**Testing**:
- [ ] English translations load
- [ ] French translations load
- [ ] Interpolation works ({time})
- [ ] All keys present in both languages

---

### Phase 4: Integration & Multi-Tab Sync

#### Task 4.1: Integrate into MainLayout (30 min)
**File**: `src/layouts/MainLayout.vue`

**Changes Required**:
```vue
<template>
  <q-layout view="lHh Lpr lFf">
    <!-- ... existing layout -->

    <!-- Session Expiration Dialog -->
    <SessionExpirationDialog
      v-model:show="isWarningVisible"
      :time-remaining="timeRemaining"
      :is-extending="isExtending"
      @extend="handleExtendSession"
      @logout="handleLogoutFromDialog"
    />
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { useI18n } from 'vue-i18n'
import { useRoleAccess } from 'src/composables/useRoleAccess'
import { useSessionMonitor } from 'src/composables/useSessionMonitor'
import { useNotifications } from 'src/composables/useNotifications'
import LanguageSwitcher from 'components/LanguageSwitcher.vue'
import SessionExpirationDialog from 'src/components/auth/SessionExpirationDialog.vue'

const router = useRouter()
const authStore = useAuthStore()
const { t: $t } = useI18n()
const { isViewOnly } = useRoleAccess()
const { notifySuccess, notifyError } = useNotifications()

// Session monitoring
const {
  isWarningVisible,
  timeRemaining,
  formattedTimeRemaining,
  isExtending,
  extendSession,
  handleExpiration
} = useSessionMonitor()

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function handleLogout() {
  authStore.logout()
  router.push({ name: 'login' })
}

function handleLogoutFromDialog() {
  handleLogout()
}

async function handleExtendSession() {
  const result = await extendSession()

  if (result.success) {
    notifySuccess($t('session.extended.success'))
  } else {
    notifyError(result.error || $t('token.refresh.error'))
  }
}
</script>
```

**Testing**:
- [ ] Dialog appears at 60 seconds
- [ ] Extend works correctly
- [ ] Logout works correctly
- [ ] No console errors
- [ ] App remains functional during warning

#### Task 4.2: Update Login Page for Expired Sessions (15 min)
**File**: `src/pages/auth/LoginPage.vue`

**Changes Required**:
```vue
<template>
  <q-page class="flex flex-center">
    <!-- Session Expired Banner -->
    <q-banner
      v-if="sessionExpired"
      dense
      rounded
      class="bg-warning text-white q-mb-md absolute-top"
    >
      <template #avatar>
        <q-icon name="schedule" />
      </template>
      {{ $t('session.expired.message') }}
    </q-banner>

    <!-- ... existing login form -->
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const sessionExpired = ref(false)

onMounted(() => {
  sessionExpired.value = route.query.expired === 'true'
})
</script>
```

**Testing**:
- [ ] Banner shows when ?expired=true
- [ ] Banner doesn't show on normal login
- [ ] Message is clear and helpful

#### Task 4.3: Handle Tab Visibility Changes (15 min)
**File**: `src/composables/useSessionMonitor.js`

**Enhancement**:
```javascript
// Add to useSessionMonitor composable

import { usePageVisibility } from '@vueuse/core'

export function useSessionMonitor() {
  // ... existing code

  const isPageVisible = usePageVisibility()

  // Watch for tab becoming visible again
  watch(isPageVisible, (visible) => {
    if (visible && authStore.isAuthenticated) {
      // Recalculate time remaining
      const remaining = calculateTimeRemaining()

      if (remaining <= 0) {
        // Expired while tab was hidden
        handleExpiration()
      } else if (remaining <= WARNING_THRESHOLD && !isWarningVisible.value) {
        // Should be showing warning
        showWarning()
      }

      // Update countdown immediately
      updateCountdown()
    }
  })

  // ... rest of composable
}
```

**Testing**:
- [ ] Warning shows immediately if tab returns and <60s
- [ ] Auto-logout if tab returns and expired
- [ ] Countdown accurate after tab switch

---

### Phase 5: Testing & Bug Fixes

#### Task 5.1: Manual Testing (15 min)

**Test Scenarios**:
1. **Happy Path**:
   - [ ] Login
   - [ ] Wait 14 minutes
   - [ ] Warning appears at 14:00
   - [ ] Countdown accurate
   - [ ] Click "Extend Session"
   - [ ] Dialog closes
   - [ ] Timer resets to 15:00
   - [ ] Success notification shows

2. **Auto-Logout**:
   - [ ] Login
   - [ ] Wait 14 minutes
   - [ ] Warning appears
   - [ ] Ignore warning
   - [ ] Auto-logout at 15:00
   - [ ] Redirect to login
   - [ ] "Session expired" banner shows

3. **Multi-Tab**:
   - [ ] Open app in 2 tabs
   - [ ] Wait for warning in tab 1
   - [ ] Extend in tab 1
   - [ ] Verify tab 2 timer resets
   - [ ] No warning in tab 2

4. **API Token Refresh**:
   - [ ] Login
   - [ ] Make any API call (search clients)
   - [ ] Verify timer resets
   - [ ] No warning for another 14 minutes

5. **Network Failure**:
   - [ ] Login
   - [ ] Wait for warning
   - [ ] Disconnect network
   - [ ] Click "Extend Session"
   - [ ] Error message shows
   - [ ] Can retry
   - [ ] Countdown continues

6. **Rapid Clicks**:
   - [ ] Login
   - [ ] Wait for warning
   - [ ] Click "Extend Session" rapidly
   - [ ] Only one request sent
   - [ ] Button disabled during request

#### Task 5.2: Fix Issues (15 min)

**Common Issues to Watch**:
- Timer drift (client/server time difference)
- Memory leaks from timers
- Race conditions in token refresh
- Dialog not closing after extend
- Console errors

**Fix as needed**

---

## Testing Plan

### Unit Tests

**Not required for Phase 1** - Focus on integration and manual testing.

### Integration Tests

**Priority**: Low - Manual testing sufficient for MVP

**Potential Test Cases**:
```javascript
describe('Session Monitor', () => {
  it('should show warning at 60 seconds', async () => {
    // Mock token with 60s TTL
    // Start monitor
    // Wait 1 second
    // Assert warning visible
  })

  it('should extend session successfully', async () => {
    // Mock API response
    // Trigger extend
    // Assert new token stored
    // Assert timer reset
  })

  it('should auto-logout at expiration', async () => {
    // Mock token with 0s TTL
    // Start monitor
    // Assert logged out
    // Assert redirected
  })
})
```

### Manual QA Checklist

- [ ] All API responses follow standard format
- [ ] Ping endpoint works
- [ ] Warning shows at correct time
- [ ] Countdown is accurate
- [ ] Extend session works
- [ ] Auto-logout works
- [ ] Multi-tab sync works
- [ ] Tab visibility handling works
- [ ] Error handling works
- [ ] i18n works (EN + FR)
- [ ] No console errors
- [ ] No memory leaks
- [ ] Accessible (keyboard + screen reader)

---

## Deployment Strategy

### Pre-Deployment Checklist

- [ ] All tasks completed
- [ ] Manual testing passed
- [ ] No console errors
- [ ] Code reviewed
- [ ] i18n translations complete
- [ ] Documentation updated

### Deployment Steps

#### Step 1: Deploy Backend (15 min)
```bash
# Push backend changes to Google Apps Script
npx clasp push

# Test ping endpoint
curl -X POST [GAS_URL] \
  -H "Content-Type: application/json" \
  -d '{"action":"auth.ping","token":"[VALID_TOKEN]"}'

# Expected: 200 with new token
```

#### Step 2: Deploy Frontend (5 min)
```bash
# Build for production
npm run build

# Deploy to hosting (or start dev server for testing)
npm run dev
```

#### Step 3: Smoke Test (10 min)
- [ ] Login works
- [ ] Token has TTL in response
- [ ] All API calls return tokens
- [ ] Ping endpoint accessible
- [ ] Warning appears (use short TTL for testing)
- [ ] Extend works
- [ ] Auto-logout works

#### Step 4: Monitor (30 min)
- [ ] Watch for errors in console
- [ ] Check network tab for API calls
- [ ] Verify localStorage updates
- [ ] Test in multiple tabs
- [ ] Test in multiple browsers

### Rollback Plan

If critical issues found:

1. **Backend Rollback**:
   ```bash
   # Revert to previous version
   npx clasp push --version [PREVIOUS_VERSION]
   ```

2. **Frontend Rollback**:
   - Comment out `useSessionMonitor` in MainLayout
   - Comment out SessionExpirationDialog
   - Redeploy

3. **Partial Rollback**:
   - Keep response format changes (non-breaking)
   - Disable session monitor UI only
   - Fix issues and redeploy

---

## Risk Mitigation

### High Risks

1. **Timer Accuracy**
   - **Risk**: Client/server clock skew causes early/late warnings
   - **Mitigation**: Use server TTL (absolute time) not duration
   - **Fallback**: Add 5-second buffer to warning

2. **Token Refresh Conflicts**
   - **Risk**: Multiple tabs/API calls refresh simultaneously
   - **Mitigation**: All refreshes are safe (just generate new token)
   - **Fallback**: Last token wins

3. **Memory Leaks**
   - **Risk**: Timers not cleared properly
   - **Mitigation**: Proper cleanup in onUnmounted
   - **Testing**: Check with Chrome DevTools memory profiler

### Medium Risks

1. **Rate Limiting Too Strict**
   - **Risk**: Legitimate users blocked from extending
   - **Mitigation**: Set limit to 5 per minute (generous)
   - **Fallback**: Increase limit or remove

2. **Dialog Blocks Critical Actions**
   - **Risk**: User can't save work during warning
   - **Mitigation**: Dialog is modal but app still functional underneath
   - **Fallback**: Make dialog dismissible

---

## Success Metrics

**Measure after 1 week**:
- Session extension rate: >70% of warnings result in extension
- Unexpected logout complaints: 0
- Ping endpoint success rate: >99%
- Average session duration: Increase by 50%

---

## Timeline

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Phase 0: Response Format | 2h | Day 1, 9:00 | Day 1, 11:00 |
| Phase 1: Ping Endpoint | 1h | Day 1, 11:00 | Day 1, 12:00 |
| **Lunch Break** | 1h | Day 1, 12:00 | Day 1, 13:00 |
| Phase 2: Session Monitor | 2h | Day 1, 13:00 | Day 1, 15:00 |
| Phase 3: Warning Dialog | 1.5h | Day 1, 15:00 | Day 1, 16:30 |
| Phase 4: Integration | 1h | Day 1, 16:30 | Day 1, 17:30 |
| Phase 5: Testing | 0.5h | Day 1, 17:30 | Day 1, 18:00 |
| **TOTAL** | **8h** | | |

---

## Post-Implementation

### Documentation
- [ ] Update API documentation
- [ ] Update user guide
- [ ] Update developer guide
- [ ] Add troubleshooting section

### Monitoring
- [ ] Add analytics for session extensions
- [ ] Monitor ping endpoint usage
- [ ] Track auto-logout rate
- [ ] Monitor error rate

### Future Enhancements
- Configurable warning time (currently hardcoded 60s)
- "Remember me" for extended sessions
- Activity-based refresh (auto-extend on user activity)
- Session history/audit log

---

**Plan Status**: ✅ Complete
**Ready for Implementation**: ✅ Yes
**Estimated Completion**: 1 day (8 hours)
