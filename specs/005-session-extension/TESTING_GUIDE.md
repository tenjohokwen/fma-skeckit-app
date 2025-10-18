# Feature 005: Session Extension - Testing Guide

**Feature**: Session Extension with Token Refresh Warning
**Date**: 2025-10-17
**Status**: Implementation Complete - Ready for Testing

---

## Testing Overview

This guide provides step-by-step instructions for testing all aspects of the session extension feature.

**Estimated Testing Time**: 45-60 minutes

---

## Prerequisites

### 1. Backend Deployment
✅ Backend changes deployed to Google Apps Script via `npx clasp push`

### 2. Frontend Build
Start the development server:
```bash
npm run dev
```

### 3. Test User Account
You'll need a verified user account. Use one of:
- Admin account: `tenjoh_okwen@yahoo.com`
- Non-admin account (if available)

### 4. Browser Setup
- Open Chrome/Firefox with DevTools
- Enable Console for monitoring events
- Have two browser tabs ready for multi-tab testing

---

## Test Suite

### Test 1: Login Flow with Token Refresh

**Objective**: Verify login returns token with correct format and TTL

**Steps**:
1. Open browser DevTools → Network tab
2. Navigate to login page
3. Enter valid credentials and submit
4. Inspect Network request for `auth.login` action

**Expected Results**:
- ✅ Response includes `token` object
- ✅ `token.value` is an encrypted string
- ✅ `token.ttl` is a Unix timestamp ~15 minutes in future
- ✅ `token.username` matches logged-in user email
- ✅ User redirected to dashboard
- ✅ Token stored in localStorage (`auth_token`, `auth_token_ttl`)

**Pass/Fail**: ⬜

**Notes**:
```
Response format example:
{
  "status": 200,
  "msgKey": "auth.login.success",
  "message": "Login successful",
  "data": {
    "email": "user@example.com",
    "role": "ROLE_ADMIN",
    "status": "VERIFIED"
  },
  "token": {
    "value": "encrypted_token_here",
    "ttl": 1760697849187,
    "username": "user@example.com"
  }
}
```

---

### Test 2: Session Monitor Initialization

**Objective**: Verify session monitor starts automatically on login

**Steps**:
1. Open DevTools → Console
2. Log in successfully
3. Type in console: `window.localStorage.getItem('auth_token_ttl')`
4. Calculate time until expiration: `(ttl - Date.now()) / 1000 / 60` (should be ~15 minutes)

**Expected Results**:
- ✅ Token TTL stored in localStorage
- ✅ TTL is approximately 15 minutes (900 seconds) in the future
- ✅ No console errors related to session monitoring
- ✅ Session monitor composable is active in MainLayout

**Pass/Fail**: ⬜

**Notes**:
```
Example console check:
> window.localStorage.getItem('auth_token_ttl')
"1760697849187"

> (1760697849187 - Date.now()) / 1000 / 60
14.98 (approximately 15 minutes)
```

---

### Test 3: Warning Dialog Appearance

**Objective**: Verify warning dialog appears at 60 seconds before expiration

**Setup**:
For faster testing, we need to temporarily reduce the warning threshold.

**Option A - Manual Wait (15 minutes)**:
1. Log in
2. Wait 14 minutes
3. Warning should appear at 14:00 mark

**Option B - Quick Test (modify code temporarily)**:
1. Edit `src/composables/useSessionMonitor.js`
2. Change `WARNING_THRESHOLD = 60` to `WARNING_THRESHOLD = 840` (14 minutes)
3. Save and reload app
4. Warning will appear 1 minute after login
5. ⚠️ Remember to revert this change after testing!

**Steps** (using Option B for speed):
1. Modify warning threshold to 840 seconds
2. Log in
3. Wait 60 seconds
4. Warning dialog should appear

**Expected Results**:
- ✅ Modal dialog appears with warning icon
- ✅ Title: "Session Expiring Soon"
- ✅ Countdown shows time remaining (e.g., "0:59", "0:58"...)
- ✅ Two buttons visible: "Logout Now" and "Extend Session"
- ✅ Dialog cannot be dismissed by clicking outside
- ✅ Dialog cannot be dismissed by pressing ESC
- ✅ Countdown updates every second

**Pass/Fail**: ⬜

**Notes**:
```
Countdown format: "M:SS" (e.g., "0:45")
Warning threshold: 60 seconds before expiration
```

---

### Test 4: Session Extension (Extend Button)

**Objective**: Verify clicking "Extend Session" refreshes token and resets timer

**Steps**:
1. Trigger warning dialog (using Test 3 setup)
2. Open DevTools → Network tab
3. Click "Extend Session" button
4. Observe network request and response

**Expected Results**:
- ✅ Button shows loading state while request is in progress
- ✅ Network request sent to `auth.ping` action
- ✅ Response includes new `token` object
- ✅ New `token.ttl` is ~15 minutes in future from current time
- ✅ Dialog closes automatically on success
- ✅ Success notification: "Session extended successfully"
- ✅ localStorage updated with new token and TTL
- ✅ Timer resets (verify by checking that warning doesn't reappear immediately)

**Pass/Fail**: ⬜

**Notes**:
```
auth.ping response example:
{
  "status": 200,
  "msgKey": "token.refresh.success",
  "message": "Session extended",
  "data": {
    "email": "user@example.com",
    "role": "ROLE_ADMIN",
    "status": "VERIFIED"
  },
  "token": {
    "value": "new_encrypted_token",
    "ttl": 1760698749187,
    "username": "user@example.com"
  }
}
```

---

### Test 5: Session Extension Error Handling

**Objective**: Verify graceful error handling when extension fails

**Steps**:
1. Trigger warning dialog
2. Open DevTools → Network tab
3. Enable "Offline" mode in DevTools
4. Click "Extend Session"

**Expected Results**:
- ✅ Button shows loading state
- ✅ Request fails (network error)
- ✅ Error banner appears in dialog: "Failed to extend session. Please try again."
- ✅ "Retry" button appears
- ✅ Dialog remains open
- ✅ Countdown continues
- ✅ Clicking "Retry" attempts extension again

**Steps (continued)**:
5. Disable "Offline" mode
6. Click "Retry" button

**Expected Results**:
- ✅ Extension succeeds
- ✅ Dialog closes
- ✅ Success notification shown

**Pass/Fail**: ⬜

**Notes**:
```
Error scenarios to test:
1. Network failure (offline mode)
2. Invalid token (manually modify localStorage token)
3. Expired token (wait until expiration, then try to extend)
```

---

### Test 6: Auto-Logout at Expiration

**Objective**: Verify automatic logout when countdown reaches 0:00

**Setup**:
Same as Test 3 - modify warning threshold for faster testing.

**Steps**:
1. Modify `WARNING_THRESHOLD` to 60 seconds (or use natural 15-minute expiration)
2. Log in
3. Wait for warning dialog to appear
4. **Do NOT click any buttons** - let countdown reach 0:00

**Expected Results**:
- ✅ Countdown reaches 0:00
- ✅ User automatically logged out
- ✅ Auth token removed from localStorage
- ✅ Auth store cleared
- ✅ Redirected to login page with `?expired=true` query parameter
- ✅ Login page shows banner: "Your session has expired. Please log in again."
- ✅ Banner has warning icon and yellow/warning background

**Pass/Fail**: ⬜

**Notes**:
```
Check in console after auto-logout:
> window.localStorage.getItem('auth_token')
null

> window.localStorage.getItem('auth_token_ttl')
null
```

---

### Test 7: Multi-Tab Synchronization - Token Refresh

**Objective**: Verify token refresh in one tab syncs to other tabs

**Steps**:
1. Open app in **Tab 1** and log in
2. Open app in **Tab 2** (same browser, duplicate tab)
3. Both tabs should show dashboard
4. In **Tab 1**, trigger warning dialog (using modified threshold)
5. In **Tab 1**, click "Extend Session"
6. Observe **Tab 2**

**Expected Results**:
- ✅ Tab 1: Token refreshes, dialog closes
- ✅ Tab 2: Receives `storage` event for token update
- ✅ Tab 2: Timer resets automatically
- ✅ Tab 2: Warning dialog does NOT appear (timer was reset)
- ✅ Both tabs have same token in localStorage

**Pass/Fail**: ⬜

**Notes**:
```
Multi-tab sync uses localStorage 'storage' event
Event is triggered when Tab 1 updates auth_token
Tab 2 listens for this event and resets its timer
```

---

### Test 8: Multi-Tab Synchronization - Logout

**Objective**: Verify logout in one tab logs out all tabs

**Steps**:
1. Open app in **Tab 1** and log in
2. Open app in **Tab 2** (duplicate tab)
3. In **Tab 1**, wait for auto-logout (let countdown expire)
4. Observe **Tab 2**

**Expected Results**:
- ✅ Tab 1: Auto-logout occurs, redirected to login
- ✅ Tab 2: Receives `storage` event for token removal
- ✅ Tab 2: Automatically logs out
- ✅ Tab 2: Redirected to login page
- ✅ Both tabs show login page

**Alternative Test**:
Repeat steps but manually logout from Tab 1 (click "Logout Now" in warning dialog or use header logout)

**Expected Results**: Same as above

**Pass/Fail**: ⬜

**Notes**:
```
Logout sync is critical for security
Prevents one tab staying logged in after user logs out
```

---

### Test 9: Token Refresh from Any API Call

**Objective**: Verify ANY authenticated API call can refresh the token and reset timer

**Steps**:
1. Log in
2. Modify `WARNING_THRESHOLD` to 840 (14 minutes) to trigger warning quickly
3. Wait for warning dialog to appear (countdown active)
4. **Without clicking "Extend Session"**, navigate to Search page
5. Perform a client search (e.g., search for "John")
6. Observe network response and dialog

**Expected Results**:
- ✅ Search API request sent
- ✅ Response includes new `token` object
- ✅ Token stored in localStorage
- ✅ `token-refreshed` CustomEvent dispatched
- ✅ Session monitor receives event and resets timer
- ✅ Warning dialog closes automatically (timer reset)

**Pass/Fail**: ⬜

**Notes**:
```
This tests that session is extended on ANY activity
User doesn't need to explicitly click "Extend Session"
Any API interaction extends the session automatically
```

---

### Test 10: Accessibility - Keyboard Navigation

**Objective**: Verify dialog is fully accessible via keyboard

**Steps**:
1. Trigger warning dialog
2. **Without using mouse**, use keyboard only:
   - Press `Tab` key to navigate
   - Press `Shift+Tab` to navigate backwards
   - Press `Enter` to activate buttons

**Expected Results**:
- ✅ Focus starts on "Extend Session" button (primary action)
- ✅ `Tab` moves focus to "Logout Now" button
- ✅ `Tab` again cycles back to "Extend Session"
- ✅ `Shift+Tab` moves focus backwards
- ✅ `Enter` on "Extend Session" triggers extension
- ✅ `Enter` on "Logout Now" triggers logout
- ✅ `ESC` key does NOT close dialog (security)
- ✅ Focus is trapped within dialog (can't tab to elements behind dialog)

**Pass/Fail**: ⬜

**Notes**:
```
Accessibility is critical for users who rely on keyboard
Dialog should follow ARIA best practices
```

---

### Test 11: Accessibility - Screen Reader

**Objective**: Verify dialog is announced properly to screen readers

**Setup**:
- macOS: Enable VoiceOver (Cmd+F5)
- Windows: Enable NVDA or JAWS
- Linux: Enable Orca

**Steps**:
1. Enable screen reader
2. Trigger warning dialog
3. Listen to announcements

**Expected Results**:
- ✅ Dialog title announced: "Session Expiring Soon"
- ✅ Message announced: "Your session will expire in..."
- ✅ Countdown updates announced every ~10 seconds (aria-live="polite")
- ✅ Button labels announced clearly
- ✅ Error messages announced when extension fails

**Pass/Fail**: ⬜

**Notes**:
```
aria-live="polite" ensures countdown updates are announced
without interrupting user's current task
```

---

### Test 12: Edge Case - Browser Tab Hibernation

**Objective**: Verify correct behavior when browser tab is hibernated and restored

**Steps**:
1. Log in
2. Open many other tabs (10+) to force browser to hibernate the app tab
3. Wait 16+ minutes (past token expiration)
4. Return to app tab and activate it

**Expected Results**:
- ✅ On tab activation, session monitor recalculates time
- ✅ Recognizes token is expired
- ✅ Immediately logs user out
- ✅ Redirects to login with "Session expired" message
- ✅ No errors in console

**Pass/Fail**: ⬜

**Notes**:
```
Tab hibernation can pause JavaScript execution
On resume, timer must recalculate from absolute TTL
not from elapsed time during hibernation
```

---

### Test 13: Edge Case - Clock Skew

**Objective**: Verify handling of client/server clock differences

**Setup**:
Temporarily change your system clock:
- macOS: System Preferences → Date & Time → Set manually
- Windows: Control Panel → Date & Time

**Steps**:
1. Set system clock 5 minutes **ahead** of actual time
2. Log in
3. Verify token TTL is calculated correctly
4. Set system clock 5 minutes **behind** actual time
5. Log in again
6. Verify token TTL

**Expected Results**:
- ✅ Timer uses server's absolute TTL timestamp (not duration)
- ✅ Session monitor calculates: `(serverTTL - Date.now())`
- ✅ Warning appears when calculated time = 60 seconds
- ✅ No negative time remaining displayed
- ✅ No unexpected logouts

**Pass/Fail**: ⬜

**Notes**:
```
Server returns absolute timestamp: token.ttl = 1760697849187
Client calculates: remaining = (ttl - Date.now()) / 1000
This approach is resilient to clock skew
```

---

### Test 14: Edge Case - Rapid Extension Clicks

**Objective**: Verify button is disabled during API call to prevent duplicate requests

**Steps**:
1. Trigger warning dialog
2. Enable DevTools → Network → Throttling → "Slow 3G"
3. Click "Extend Session" button rapidly 5+ times

**Expected Results**:
- ✅ Button shows loading state immediately after first click
- ✅ Button is disabled while loading
- ✅ Only ONE network request sent (no duplicates)
- ✅ Subsequent clicks have no effect
- ✅ After response, button re-enables (or dialog closes)

**Pass/Fail**: ⬜

**Notes**:
```
isExtending ref prevents duplicate requests
Button :loading and :disabled props enforce this
```

---

## Test Results Summary

| Test # | Test Name | Pass/Fail | Notes |
|--------|-----------|-----------|-------|
| 1 | Login Flow with Token Refresh | ⬜ | |
| 2 | Session Monitor Initialization | ⬜ | |
| 3 | Warning Dialog Appearance | ⬜ | |
| 4 | Session Extension | ⬜ | |
| 5 | Extension Error Handling | ⬜ | |
| 6 | Auto-Logout at Expiration | ⬜ | |
| 7 | Multi-Tab Sync - Token Refresh | ⬜ | |
| 8 | Multi-Tab Sync - Logout | ⬜ | |
| 9 | Token Refresh from Any API Call | ⬜ | |
| 10 | Keyboard Navigation | ⬜ | |
| 11 | Screen Reader | ⬜ | |
| 12 | Browser Tab Hibernation | ⬜ | |
| 13 | Clock Skew | ⬜ | |
| 14 | Rapid Extension Clicks | ⬜ | |

**Overall Status**: ⬜ Not Started / ⏳ In Progress / ✅ Complete

---

## Known Issues

Document any issues found during testing:

### Issue 1: [Title]
- **Severity**: Critical / High / Medium / Low
- **Description**:
- **Steps to Reproduce**:
- **Expected**:
- **Actual**:
- **Fix Required**:

---

## Cleanup After Testing

### 1. Revert Test Modifications
If you modified `WARNING_THRESHOLD` for testing:
```bash
# In src/composables/useSessionMonitor.js
# Change back to:
const WARNING_THRESHOLD = 60
```

### 2. Reset System Clock
If you modified your system clock for Test 13, reset it to automatic/network time.

### 3. Clear Test Data
```javascript
// In browser console
localStorage.clear()
location.reload()
```

---

## Sign-Off

### Tester Information
- **Name**: ___________________________
- **Date**: ___________________________
- **Environment**: Development / Staging / Production

### Test Results
- **Total Tests**: 14
- **Passed**: _____
- **Failed**: _____
- **Blocked**: _____

### Approval
- ⬜ All critical tests passed
- ⬜ Known issues documented
- ⬜ Ready for production deployment

**Signature**: ___________________________

---

**Next Steps**:
1. Complete all tests
2. Document any issues in GitHub issues
3. Fix critical/high severity issues
4. Re-test after fixes
5. Deploy to production with `npx clasp push`
