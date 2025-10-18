# Feature 005: Session Extension - Requirements Checklist

**Feature**: Session Extension with Token Refresh Warning
**Date**: 2025-10-17
**Status**: Planning

---

## Constitution Compliance

- [ ] **Architecture**: Follows Vue 3 + Quasar + Google Apps Script stack
- [ ] **Code Style**: Uses Composition API with `<script setup>`
- [ ] **State Management**: Leverages Pinia store for auth state
- [ ] **API Communication**: Uses existing api.js service layer
- [ ] **Error Handling**: Proper try-catch with user-friendly messages
- [ ] **Internationalization**: All text externalized to i18n files
- [ ] **Accessibility**: Keyboard navigation and screen reader support

**Score**: 0/7 ✅

---

## User Story Coverage

### US1: Session Expiration Warning
- [ ] Warning dialog appears 1 minute before expiration
- [ ] Dialog shows live countdown timer
- [ ] Dialog is modal (cannot be dismissed)
- [ ] Dialog has "Extend Session" button
- [ ] Dialog has "Logout" button
- [ ] Auto-logout if user ignores warning

**Score**: 0/6

### US2: Session Extension
- [ ] "Extend Session" sends ping to backend
- [ ] Loading state shown during request
- [ ] Success closes dialog and resets timer
- [ ] Failure shows error with retry option
- [ ] New token automatically stored
- [ ] Timer reset with new TTL

**Score**: 0/6

### US3: Automatic Session Cleanup
- [ ] Auto-logout when countdown reaches 0:00
- [ ] Auth state completely cleared
- [ ] Redirect to login page
- [ ] Notification explains expiration
- [ ] Login page shows expired session message

**Score**: 0/5

**Total User Story Score**: 0/17

---

## Functional Requirements

### Response Format
- [ ] FR1.1: All backend responses follow standard format
- [ ] FR1.2: Response includes status, msgKey, message, data
- [ ] FR1.3: Authenticated responses include token object
- [ ] FR1.4: Token object has value, ttl, username
- [ ] FR1.5: Data object includes email, role, status

**Score**: 0/5

### Token Monitoring
- [ ] FR2.1: Frontend timer based on token.ttl
- [ ] FR2.2: Timer updates every second
- [ ] FR2.3: Warning at exactly 60 seconds remaining
- [ ] FR2.4: Handles client/server clock skew

**Score**: 0/4

### Warning Dialog
- [ ] FR3.1: Modal dialog blocks app interaction
- [ ] FR3.2: Clear title and countdown display
- [ ] FR3.3: Two action buttons (extend/logout)
- [ ] FR3.4: Cannot dismiss by ESC or outside click
- [ ] FR3.5: Accessible (keyboard + screen reader)

**Score**: 0/5

### Ping Endpoint
- [ ] FR4.1: Endpoint created (auth.ping)
- [ ] FR4.2: Requires authentication
- [ ] FR4.3: Validates current token
- [ ] FR4.4: Returns new token with extended TTL
- [ ] FR4.5: Returns standard response format

**Score**: 0/5

### Token Refresh Flow
- [ ] FR5.1: Button triggers API call
- [ ] FR5.2: Token stored in localStorage
- [ ] FR5.3: Auth store updated
- [ ] FR5.4: Timer reset with new TTL
- [ ] FR5.5: Dialog closes on success
- [ ] FR5.6: Success notification (optional)

**Score**: 0/6

### Auto-Logout Flow
- [ ] FR6.1: Triggers at 0:00
- [ ] FR6.2: Clears localStorage token
- [ ] FR6.3: Clears auth store
- [ ] FR6.4: Cancels pending requests
- [ ] FR6.5: Redirects to login with ?expired=true
- [ ] FR6.6: Shows expiration notification

**Score**: 0/6

### Multi-Tab Sync
- [ ] FR7.1: Token refresh syncs across tabs
- [ ] FR7.2: Uses localStorage events
- [ ] FR7.3: All tabs reset timers
- [ ] FR7.4: Logout syncs across tabs

**Score**: 0/4

**Total Functional Requirements Score**: 0/35

---

## Non-Functional Requirements

### Performance
- [ ] NFR1.1: Timer doesn't impact app performance
- [ ] NFR1.2: Uses throttled intervals
- [ ] NFR1.3: Minimal re-renders

**Score**: 0/3

### Reliability
- [ ] NFR2.1: Handles network failures gracefully
- [ ] NFR2.2: Retries ping up to 2 times
- [ ] NFR2.3: Logs out user after all retries fail

**Score**: 0/3

### Security
- [ ] NFR3.1: Token validation before extension
- [ ] NFR3.2: All auth data cleared on logout
- [ ] NFR3.3: Ping validates token integrity
- [ ] NFR3.4: Rate limiting prevents spam

**Score**: 0/4

### Accessibility
- [ ] NFR4.1: Dialog keyboard navigable
- [ ] NFR4.2: Screen reader announces countdown
- [ ] NFR4.3: Focus trapped in dialog
- [ ] NFR4.4: High contrast countdown

**Score**: 0/4

**Total Non-Functional Score**: 0/14

---

## Edge Cases

- [ ] EC1: Prevent multiple rapid extend clicks
- [ ] EC2: Handle network failure during extension
- [ ] EC3: Handle token expiring during ping
- [ ] EC4: Auto-reset timer when API returns new token
- [ ] EC5: Handle client/server clock skew
- [ ] EC6: Handle browser tab hibernation

**Score**: 0/6

---

## Testing Requirements

### Unit Tests
- [ ] Timer starts with valid TTL
- [ ] Warning at 60 seconds
- [ ] Auto-logout at 0 seconds
- [ ] Timer resets after extension
- [ ] Timer stops on logout
- [ ] Dialog renders correctly
- [ ] Buttons call correct handlers

**Score**: 0/7

### Integration Tests
- [ ] End-to-end session flow
- [ ] Multi-tab synchronization
- [ ] Auto-logout flow
- [ ] Token refresh from any API call

**Score**: 0/4

### Manual Tests
- [ ] UX validation (warning is noticeable)
- [ ] Countdown accuracy
- [ ] Button responsiveness
- [ ] Accessibility (keyboard, screen reader)

**Score**: 0/4

**Total Testing Score**: 0/15

---

## Implementation Components

### Backend
- [ ] Create auth.ping endpoint in AuthHandler.gs
- [ ] Update ResponseHandler for format enforcement
- [ ] Add token validation
- [ ] Add rate limiting

**Score**: 0/4

### Frontend Composable
- [ ] Create useSessionMonitor.js
- [ ] Implement startMonitoring()
- [ ] Implement stopMonitoring()
- [ ] Implement extendSession()
- [ ] Implement handleExpiration()
- [ ] Handle multi-tab sync

**Score**: 0/6

### Frontend Components
- [ ] Create SessionExpirationDialog.vue
- [ ] Countdown display
- [ ] Extend button with loading state
- [ ] Logout button
- [ ] Accessibility features

**Score**: 0/5

### API Updates
- [ ] Update api.js to handle token from all responses
- [ ] Dispatch token-refreshed event
- [ ] Update auth store integration

**Score**: 0/3

### i18n
- [ ] Add English translations
- [ ] Add French translations
- [ ] Add msgKey mappings

**Score**: 0/3

**Total Implementation Score**: 0/21

---

## Documentation

- [ ] API endpoint documentation
- [ ] Composable usage guide
- [ ] Component props/events documentation
- [ ] Testing guide
- [ ] Deployment checklist

**Score**: 0/5

---

## Summary

| Category | Score | Percentage |
|----------|-------|------------|
| Constitution Compliance | 0/7 | 0% |
| User Stories | 0/17 | 0% |
| Functional Requirements | 0/35 | 0% |
| Non-Functional Requirements | 0/14 | 0% |
| Edge Cases | 0/6 | 0% |
| Testing | 0/15 | 0% |
| Implementation | 0/21 | 0% |
| Documentation | 0/5 | 0% |
| **TOTAL** | **0/120** | **0%** |

---

## Sign-off

- [ ] Product Owner approval
- [ ] Technical Lead review
- [ ] Security review
- [ ] UX review
- [ ] Ready for implementation

---

**Specification Complete**: ✅
**Requirements Validated**: ⏳ Pending
**Ready to Implement**: ⏳ Pending
