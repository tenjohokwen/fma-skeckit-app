# Feature 005: Session Extension with Token Refresh Warning

**Status**: Planning
**Priority**: P1 (High - Security & UX)
**Effort**: 1 day (6 hours dev + 2 hours testing)

---

## Overview

Implement proactive session management that warns users before their authentication token expires and allows them to extend their session without losing work or being forced to re-authenticate.

### Background

Currently, the application uses JWT tokens with a 15-minute TTL (Time To Live). When a token expires, users are abruptly logged out, potentially losing unsaved work. This feature adds a user-friendly warning system that:
- Monitors token expiration in real-time
- Alerts users 1 minute before expiration
- Allows users to extend their session with a single click
- Seamlessly refreshes the token without interrupting work

---

## User Stories

### US1: Session Expiration Warning
**As a** logged-in user
**I want to** receive a warning before my session expires
**So that** I don't lose my work due to unexpected logout

**Acceptance Criteria:**
- Warning dialog appears exactly 1 minute before token expires
- Dialog shows countdown timer (e.g., "Session expires in 0:45")
- Dialog is modal and requires user interaction
- Dialog offers two clear actions: "Extend Session" and "Logout"
- If user ignores warning, they are logged out when token expires

### US2: Session Extension
**As a** warned user
**I want to** extend my session with one click
**So that** I can continue working without re-authentication

**Acceptance Criteria:**
- Clicking "Extend Session" immediately sends ping to backend
- Loading state shown while ping is in progress
- On success: Dialog closes, session extended, user continues work
- On failure: Error message shown, option to retry or logout
- New token automatically stored and timer reset

### US3: Automatic Session Cleanup
**As a** user who ignores the warning
**I want to** be automatically logged out when session expires
**So that** my account remains secure

**Acceptance Criteria:**
- If countdown reaches 0:00, user is logged out automatically
- Auth state is cleared completely
- User redirected to login page
- Notification explains session expired
- Login page shows message: "Your session has expired. Please log in again."

---

## Response Format Specification

### Standard Response Structure

**ALL** backend responses must follow this exact format:

```typescript
interface ApiResponse<T = any> {
  status: number;           // HTTP status code (200, 400, 403, etc.)
  msgKey: string;           // i18n translation key
  message: string;          // Human-readable message (fallback)
  data?: T;                 // Response payload (optional)
  token?: TokenObject;      // Auth token (if authenticated endpoint)
}

interface TokenObject {
  value: string;            // Encrypted JWT token
  ttl: number;              // Unix timestamp (milliseconds) when token expires
  username: string;         // User email/username
}

interface UserData {
  email: string;            // User email address
  role: string;             // User role (ROLE_ADMIN | ROLE_USER)
  status: string;           // Account status (VERIFIED | PENDING | etc.)
}
```

### Example: Login Response

```json
{
  "status": 200,
  "msgKey": "auth.login.success",
  "message": "Login successful",
  "data": {
    "email": "tenjoh_okwen@yahoo.com",
    "role": "ROLE_ADMIN",
    "status": "VERIFIED"
  },
  "token": {
    "value": "NVMUK10rKSIKV1VQCDNBJ1MnDglLOjolLhc6RUw8XmstHgx6FHsiOxdbBRMIfRV+D3hQbxNpeXlxb3QIBjpCNjsUBXoCaHB1VwROXBNzHXgNcRs=",
    "ttl": 1760697849187,
    "username": "tenjoh_okwen@yahoo.com"
  }
}
```

### Example: Session Extension (Ping) Response

```json
{
  "status": 200,
  "msgKey": "token.refresh.success",
  "message": "Session extended",
  "data": {
    "email": "tenjoh_okwen@yahoo.com",
    "role": "ROLE_ADMIN",
    "status": "VERIFIED"
  },
  "token": {
    "value": "NVMUK10rKSIKV1VQCDNBJ1MnDglLOjolLhc6RUw8XmstHgx6FHsiOxdbBRMIfRV+D3hQbxNpeXlxb3QIBjpCNjsUBXoCaHB1VwROXBNzHXgNcRs=",
    "ttl": 1760698749187,
    "username": "tenjoh_okwen@yahoo.com"
  }
}
```

### Example: Error Response

```json
{
  "status": 401,
  "msgKey": "token.expired",
  "message": "Your session has expired. Please log in again.",
  "data": null
}
```

---

## Functional Requirements

### FR1: Token Expiration Monitoring
- Frontend maintains a timer based on `token.ttl` from server responses
- Timer recalculates remaining time every second
- Warning triggered when remaining time = 60 seconds
- System handles clock skew between client/server

### FR2: Warning Dialog UI
- Modal dialog (blocks interaction with app)
- Clear title: "Session Expiring Soon"
- Countdown display: "Your session will expire in 0:XX"
- Two primary actions:
  - "Extend Session" (primary button, green)
  - "Logout Now" (secondary button, red)
- Cannot be dismissed by clicking outside or pressing ESC
- Accessible (keyboard navigation, screen reader support)

### FR3: Ping Endpoint
- **Endpoint**: `auth.ping` or `auth.extendSession`
- **Method**: POST
- **Auth**: Required (must send current token)
- **Input**: No additional data required (uses token from headers)
- **Output**: Same format as login response with new token
- **Behavior**:
  - Validates current token
  - If valid: Issues new token with extended TTL (+15 minutes)
  - If invalid/expired: Returns 401 error
  - Updates user's last activity timestamp

### FR4: Token Refresh Flow
1. User clicks "Extend Session"
2. Frontend sends POST to ping endpoint with current token
3. Backend validates token and returns new token
4. Frontend:
   - Stores new token in localStorage
   - Updates auth store with new token
   - Resets expiration timer with new TTL
   - Closes warning dialog
   - Shows success notification (optional)

### FR5: Auto-Logout Flow
1. Countdown reaches 0:00
2. Frontend:
   - Clears auth token from localStorage
   - Clears auth store state
   - Cancels all pending API requests
   - Redirects to login page with `?expired=true` query param
   - Shows notification: "Your session has expired"

### FR6: Multi-Tab Synchronization
- When token is refreshed in one tab, other tabs should be notified
- Use `localStorage` events to sync token across tabs
- All tabs reset their timers when token updates
- If one tab logs out, all tabs should logout

---

## Non-Functional Requirements

### NFR1: Performance
- Timer updates should not impact app performance
- Use `requestAnimationFrame` or throttled intervals
- Minimal re-renders when countdown updates

### NFR2: Reliability
- Handle network failures gracefully during ping
- Retry ping request up to 2 times on failure
- If all retries fail, log user out for security

### NFR3: Security
- Never extend session if user is inactive for >15 minutes
- Clear all auth data on logout (tokens, user info, etc.)
- Ping endpoint must validate token integrity
- Prevent session extension spam (rate limiting)

### NFR4: Accessibility
- Warning dialog must be keyboard navigable
- Screen readers announce countdown
- Focus trapped in dialog
- High contrast for countdown timer

---

## Technical Design

### Frontend Components

#### 1. `useSessionMonitor` Composable

```javascript
// src/composables/useSessionMonitor.js
export function useSessionMonitor() {
  const authStore = useAuthStore()
  const warningShown = ref(false)
  const timeRemaining = ref(0) // seconds
  const timerId = ref(null)

  function startMonitoring() {
    // Calculate time until expiration
    // Show warning at 60 seconds
    // Auto-logout at 0 seconds
  }

  function stopMonitoring() {
    // Clear timers
  }

  async function extendSession() {
    // Call ping endpoint
    // Update token
    // Reset timer
  }

  function handleExpiration() {
    // Clear auth
    // Redirect to login
  }

  return {
    warningShown,
    timeRemaining,
    startMonitoring,
    stopMonitoring,
    extendSession
  }
}
```

#### 2. `SessionExpirationDialog` Component

```vue
<!-- src/components/auth/SessionExpirationDialog.vue -->
<template>
  <q-dialog v-model="show" persistent>
    <q-card>
      <q-card-section>
        <div class="text-h6">Session Expiring Soon</div>
        <div class="text-body1 q-mt-md">
          Your session will expire in {{ formatTime(timeRemaining) }}
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Logout Now"
          color="negative"
          @click="handleLogout"
        />
        <q-btn
          unelevated
          label="Extend Session"
          color="primary"
          :loading="extending"
          @click="handleExtend"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
```

### Backend Endpoint

#### Ping/Session Extension Endpoint

**File**: `gas/handlers/AuthHandler.gs`

```javascript
/**
 * Ping endpoint to extend session
 * @param {Object} context - Request context
 * @param {Object} context.user - Authenticated user
 * @param {string} context.token - Current auth token
 * @returns {Object} Response with new token
 */
ping: function(context) {
  // User is already authenticated by SecurityInterceptor
  // Just issue a new token with extended TTL

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
```

### Response Format Enforcement

#### Backend Response Handler

All handlers must use `ResponseHandler` utility to ensure consistent format:

```javascript
// gas/utils/ResponseHandler.gs
const ResponseHandler = {
  success: function(msgKey, message, data, token) {
    return {
      status: 200,
      msgKey: msgKey,
      message: message,
      data: data || null,
      token: token || undefined
    };
  },

  error: function(status, msgKey, message) {
    return {
      status: status,
      msgKey: msgKey,
      message: message,
      data: null
    };
  },

  // ... other helper methods
};
```

#### Frontend API Client

Update `api.js` to handle token refresh from all responses:

```javascript
// src/services/api.js
async post(action, data = {}, token = null) {
  // ... existing code

  // Handle token refresh from ANY response
  if (response.data.token && response.data.token.value) {
    localStorage.setItem('auth_token', response.data.token.value)
    localStorage.setItem('auth_token_ttl', response.data.token.ttl)

    // Trigger session monitor reset
    window.dispatchEvent(new CustomEvent('token-refreshed', {
      detail: { ttl: response.data.token.ttl }
    }))
  }

  return response.data
}
```

---

## Edge Cases

### EC1: User Extends Session Multiple Times
- **Scenario**: User clicks "Extend Session" multiple times rapidly
- **Solution**: Disable button during API call, prevent duplicate requests

### EC2: Network Failure During Extension
- **Scenario**: Ping request fails due to network error
- **Solution**: Show error message, allow retry, countdown continues

### EC3: Token Expires During Extension Request
- **Scenario**: User clicks extend but token expires before ping completes
- **Solution**: Backend returns 401, frontend logs user out gracefully

### EC4: User Activity During Countdown
- **Scenario**: User makes API call while countdown is active
- **Solution**: API response includes new token, timer automatically resets

### EC5: Clock Skew Between Client/Server
- **Scenario**: Client clock is ahead/behind server clock
- **Solution**: Use server TTL (absolute timestamp) not duration calculation

### EC6: Browser Tab Hibernation
- **Scenario**: Browser puts tab to sleep (Chrome tab freezing)
- **Solution**: On tab wake, recalculate time and show warning/logout immediately if needed

---

## Testing Strategy

### Unit Tests

1. **useSessionMonitor Composable**
   - Timer starts correctly with valid TTL
   - Warning triggered at exactly 60 seconds
   - Auto-logout triggered at 0 seconds
   - Timer resets after successful extension
   - Timer stops on manual logout

2. **SessionExpirationDialog Component**
   - Renders countdown correctly
   - Extend button calls API
   - Logout button clears auth
   - Dialog cannot be dismissed

### Integration Tests

1. **End-to-End Session Flow**
   - Login → Timer starts
   - Wait 14 minutes → Warning appears
   - Click "Extend Session" → Timer resets
   - Verify token updated in localStorage

2. **Multi-Tab Sync**
   - Open app in 2 tabs
   - Extend session in tab 1
   - Verify tab 2 receives new token
   - Verify both timers reset

3. **Auto-Logout Flow**
   - Login → Wait for expiration
   - Verify auto-logout occurs
   - Verify redirect to login page
   - Verify all auth data cleared

### Manual Testing

1. **UX Validation**
   - Warning is noticeable but not annoying
   - Countdown is accurate
   - Buttons are responsive
   - Success/error states are clear

2. **Accessibility Testing**
   - Keyboard navigation works
   - Screen reader announces countdown
   - Focus management is correct
   - High contrast mode supported

---

## i18n Keys

### English (en-US.js)

```javascript
{
  "session": {
    "expiring": {
      "title": "Session Expiring Soon",
      "message": "Your session will expire in {time}",
      "extendButton": "Extend Session",
      "logoutButton": "Logout Now"
    },
    "expired": {
      "title": "Session Expired",
      "message": "Your session has expired. Please log in again.",
      "loginButton": "Log In"
    },
    "extended": {
      "success": "Session extended successfully"
    }
  },
  "token": {
    "refresh": {
      "success": "Session extended",
      "error": "Failed to extend session. Please try again."
    },
    "expired": "Your session has expired. Please log in again."
  }
}
```

### French (fr-FR/index.js)

```javascript
{
  "session": {
    "expiring": {
      "title": "Session Expirant Bientôt",
      "message": "Votre session expirera dans {time}",
      "extendButton": "Prolonger la Session",
      "logoutButton": "Se Déconnecter"
    },
    "expired": {
      "title": "Session Expirée",
      "message": "Votre session a expiré. Veuillez vous reconnecter.",
      "loginButton": "Se Connecter"
    },
    "extended": {
      "success": "Session prolongée avec succès"
    }
  },
  "token": {
    "refresh": {
      "success": "Session prolongée",
      "error": "Impossible de prolonger la session. Veuillez réessayer."
    },
    "expired": "Votre session a expiré. Veuillez vous reconnecter."
  }
}
```

---

## Security Considerations

### SEC1: Token Validation
- Ping endpoint MUST validate token before extending
- Never extend already-expired tokens
- Verify token signature and integrity

### SEC2: Rate Limiting
- Limit ping requests to 1 per minute per user
- Prevent session extension abuse
- Log suspicious activity (>10 extensions in 1 hour)

### SEC3: Secure Storage
- Tokens stored in localStorage (not sessionStorage)
- Clear all auth data on logout
- Never log token values to console in production

### SEC4: HTTPS Only
- All token transmission over HTTPS
- Set secure cookie flags if using cookies
- Prevent token interception

---

## Migration Plan

### Phase 1: Backend Preparation
1. Create `auth.ping` endpoint
2. Ensure all responses include token when authenticated
3. Update ResponseHandler to enforce format
4. Deploy and test ping endpoint

### Phase 2: Frontend Implementation
1. Create `useSessionMonitor` composable
2. Create `SessionExpirationDialog` component
3. Update api.js to handle token refresh
4. Add i18n translations

### Phase 3: Integration
1. Add session monitor to MainLayout
2. Test multi-tab synchronization
3. Test auto-logout flow
4. Fix any edge cases

### Phase 4: Testing & Deployment
1. Run full test suite
2. Manual QA testing
3. Deploy to production
4. Monitor for issues

---

## Success Metrics

- **User Retention**: Reduce unexpected logouts by 90%
- **Session Extensions**: Track extension rate (should be >70% when warned)
- **User Feedback**: No complaints about losing work due to session expiration
- **Error Rate**: <1% ping failures

---

## Dependencies

- Existing auth system with JWT tokens
- Quasar Framework for UI components
- Vue 3 Composition API
- i18n for translations

---

## Out of Scope

- Remember me / extended session duration
- Biometric re-authentication
- Session history/audit log
- Configurable warning time (hardcoded to 60 seconds)

---

## Related Features

- Feature 001: Authentication System
- Feature 004: Read-Only Access for Non-Admin Users

---

**Created**: 2025-10-17
**Author**: Claude Code
**Stakeholders**: All users
