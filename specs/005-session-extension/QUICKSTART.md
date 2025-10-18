# Feature 005: Session Extension - Quick Start Guide

**For Developers**: Fast track to implementing session extension

---

## Quick Overview

**What**: Warn users 60 seconds before session expires and let them extend with one click

**Why**: Prevent unexpected logouts and data loss

**Time**: 8 hours total

---

## 5-Minute Summary

### What Gets Built

1. **Backend**: Standardize all API responses to include token refresh
2. **Backend**: Create `auth.ping` endpoint for session extension
3. **Frontend**: `useSessionMonitor` composable tracks token expiration
4. **Frontend**: Warning dialog appears at 60 seconds
5. **Frontend**: Multi-tab sync keeps all tabs in sync

### Response Format (ALL endpoints)

```json
{
  "status": 200,
  "msgKey": "some.i18n.key",
  "message": "Human readable message",
  "data": { /* your data */ },
  "token": {
    "value": "encrypted_jwt_token",
    "ttl": 1760697849187,
    "username": "user@example.com"
  }
}
```

### User Flow

```
1. User logs in
2. Timer starts (15 minutes)
3. At 14:00 remaining → Warning dialog appears
4. User clicks "Extend Session"
5. Ping sent to backend
6. New token received
7. Timer resets to 15:00
8. Dialog closes
```

---

## Phase-by-Phase Checklist

### Phase 0: Response Format (2h)

**Backend Files**:
- [x] `gas/utils/ResponseHandler.gs` - Add `successWithToken()` method
- [x] `gas/handlers/AuthHandler.gs` - Update login/signup responses
- [x] `gas/utils/Router.gs` - Auto-refresh tokens on all authenticated calls

**Key Code**:
```javascript
// ResponseHandler.gs
successWithToken: function(msgKey, message, data, user, tokenValue) {
  return {
    status: 200,
    msgKey: msgKey,
    message: message,
    data: data,
    token: {
      value: tokenValue,
      ttl: Date.now() + (15 * 60 * 1000),
      username: user.email
    }
  };
}
```

**Test**: Login and verify response has `token` object with `ttl`

---

### Phase 1: Ping Endpoint (1h)

**Backend Files**:
- [x] `gas/handlers/AuthHandler.gs` - Add `ping()` method
- [x] `gas/utils/Router.gs` - Register `auth.ping` route

**Key Code**:
```javascript
// AuthHandler.gs
ping: function(context) {
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

**Test**: `curl -X POST [URL] -d '{"action":"auth.ping","token":"[VALID_TOKEN]"}'`

---

### Phase 2: Session Monitor (2h)

**Frontend Files**:
- [x] `src/composables/useSessionMonitor.js` - NEW
- [x] `src/services/api.js` - Dispatch `token-refreshed` event
- [x] `src/stores/authStore.js` - Add `tokenTTL` to state

**Key Code**:
```javascript
// useSessionMonitor.js
export function useSessionMonitor() {
  const isWarningVisible = ref(false)
  const timeRemaining = ref(0)

  function startMonitoring() {
    // Update countdown every second
    // Show warning at 60 seconds
    // Auto-logout at 0 seconds
  }

  async function extendSession() {
    await api.post('auth.ping', {})
    // Token auto-updated by api.js
  }

  return { isWarningVisible, timeRemaining, extendSession }
}
```

**Test**: Set short TTL (60s), verify warning appears

---

### Phase 3: Warning Dialog (1.5h)

**Frontend Files**:
- [x] `src/components/auth/SessionExpirationDialog.vue` - NEW
- [x] `src/i18n/en-US.js` - Add session translations
- [x] `src/i18n/fr-FR/index.js` - Add session translations

**Key Code**:
```vue
<template>
  <q-dialog v-model="show" persistent>
    <q-card>
      <q-card-section>
        <div class="text-h6">Session Expiring Soon</div>
        <div class="text-h3">{{ formattedTime }}</div>
      </q-card-section>
      <q-card-actions>
        <q-btn @click="$emit('logout')">Logout</q-btn>
        <q-btn @click="$emit('extend')">Extend Session</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
```

**Test**: Dialog shows, countdown updates, buttons work

---

### Phase 4: Integration (1h)

**Frontend Files**:
- [x] `src/layouts/MainLayout.vue` - Add `useSessionMonitor` and dialog
- [x] `src/pages/auth/LoginPage.vue` - Show expired banner

**Key Code**:
```vue
<!-- MainLayout.vue -->
<script setup>
const {
  isWarningVisible,
  timeRemaining,
  isExtending,
  extendSession
} = useSessionMonitor()

async function handleExtendSession() {
  await extendSession()
}
</script>

<template>
  <SessionExpirationDialog
    v-model:show="isWarningVisible"
    :time-remaining="timeRemaining"
    :is-extending="isExtending"
    @extend="handleExtendSession"
  />
</template>
```

**Test**: Full flow from login to warning to extend

---

### Phase 5: Testing (0.5h)

**Manual Tests**:
1. ✅ Login → Warning → Extend → Success
2. ✅ Login → Warning → Ignore → Auto-logout
3. ✅ Multi-tab: Extend in tab 1 → Tab 2 resets
4. ✅ API call → Token refreshes → Timer resets
5. ✅ Network failure → Error shown → Can retry

---

## Critical Code Locations

### Backend Response Format
```
gas/utils/ResponseHandler.gs - Line ~50
  → successWithToken() method

gas/utils/Router.gs - Line ~80
  → Auto-refresh token after handler
```

### Token Refresh Event
```
src/services/api.js - Line ~64
  → Dispatch 'token-refreshed' event

src/composables/useSessionMonitor.js - Line ~120
  → Listen for 'token-refreshed' event
```

### Timer Logic
```
src/composables/useSessionMonitor.js
  → startMonitoring() - Line ~70
  → showWarning() - Line ~90
  → handleExpiration() - Line ~100
```

### Multi-Tab Sync
```
src/composables/useSessionMonitor.js
  → handleStorageChange() - Line ~140
  → Uses localStorage events
```

---

## Common Issues & Solutions

### Issue: Warning doesn't appear
**Check**:
- [ ] `tokenTTL` stored in localStorage?
- [ ] Session monitor started in MainLayout?
- [ ] No console errors?

**Fix**: Check browser console for errors

### Issue: Timer not accurate
**Check**:
- [ ] Server TTL is absolute timestamp?
- [ ] Client clock not too different from server?

**Fix**: Use server TTL, not duration calculation

### Issue: Extend doesn't work
**Check**:
- [ ] Ping endpoint deployed?
- [ ] Token valid?
- [ ] Network tab shows 200 response?

**Fix**: Check backend logs, verify endpoint registered

### Issue: Multi-tab not syncing
**Check**:
- [ ] localStorage events firing?
- [ ] Same domain/port?

**Fix**: Use Chrome DevTools → Application → Storage to verify

---

## Testing Commands

### Backend Test
```bash
# Deploy backend
npx clasp push

# Test ping endpoint
curl -X POST https://your-gas-url \
  -H "Content-Type: application/json" \
  -d '{
    "action": "auth.ping",
    "token": "your-valid-token-here"
  }'

# Expected: 200 with new token and TTL
```

### Frontend Test
```bash
# Start dev server
npm run dev

# Open browser console
# Manually trigger warning (in console):
window.dispatchEvent(new CustomEvent('token-refreshed', {
  detail: { ttl: Date.now() + 60000 } // 60 seconds
}))

# Warning should appear in 1-2 seconds
```

---

## Deployment Checklist

### Pre-Deploy
- [ ] All 5 phases complete
- [ ] Manual tests passed
- [ ] No console errors
- [ ] i18n translations added
- [ ] Code reviewed

### Deploy Backend
```bash
npx clasp push
```

### Deploy Frontend
```bash
npm run build
# Deploy to hosting
```

### Post-Deploy
- [ ] Test login
- [ ] Test warning (use short TTL)
- [ ] Test extend
- [ ] Test multi-tab
- [ ] Monitor for 30 minutes

---

## Performance Tips

1. **Timer Optimization**: Use `setInterval(1000)` not `requestAnimationFrame`
2. **Event Throttling**: Already built-in to composable
3. **Memory**: Always clear timers in `onUnmounted`
4. **Network**: Ping is lightweight (no data payload)

---

## Accessibility Checklist

- [ ] Dialog has clear title
- [ ] Countdown has `aria-live="polite"`
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Screen reader announces time
- [ ] High contrast mode supported
- [ ] Focus trapped in dialog

---

## Multi-Tab Architecture

```
Tab 1: Login → Stores token in localStorage
  ↓
Tab 2: Reads token from localStorage
  ↓
Both: Listen for 'storage' events
  ↓
Tab 1: Extends session → Updates localStorage
  ↓
Tab 2: Receives storage event → Resets timer
```

---

## File Summary

| File | Lines | Purpose |
|------|-------|---------|
| `gas/utils/ResponseHandler.gs` | +20 | Token format helper |
| `gas/handlers/AuthHandler.gs` | +25 | Ping endpoint |
| `gas/utils/Router.gs` | +10 | Auto-refresh |
| `src/composables/useSessionMonitor.js` | +250 | Core logic |
| `src/components/auth/SessionExpirationDialog.vue` | +80 | UI |
| `src/layouts/MainLayout.vue` | +15 | Integration |
| `src/services/api.js` | +8 | Event dispatch |
| `src/stores/authStore.js` | +5 | TTL storage |
| i18n files | +30 | Translations |
| **TOTAL** | **~443 lines** | |

---

## Next Steps After Implementation

1. **Monitor**: Watch for errors in production
2. **Measure**: Track extension rate and session duration
3. **Optimize**: Adjust warning time if needed
4. **Enhance**: Add activity-based auto-extension

---

**Questions?** Check the full spec: `specs/005-session-extension/spec.md`

**Ready to implement?** Follow the plan: `specs/005-session-extension/plan.md`
