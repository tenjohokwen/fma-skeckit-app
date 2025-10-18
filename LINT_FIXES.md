# Lint Error Fixes

**Date**: 2025-10-17
**Status**: ✅ All Errors Fixed

---

## Errors Found

```bash
npm run lint
```

**Output**:
```
/Users/mokwen/dev/gitrepos/bluegithub/fma-skeckit-app/src/layouts/MainLayout.vue
  188:3  error  'formattedTimeRemaining' is assigned a value but never used  no-unused-vars
  191:3  error  'handleExpiration' is assigned a value but never used        no-unused-vars

✖ 2 problems (2 errors, 0 warnings)
```

---

## Root Cause

In **MainLayout.vue**, the session monitor composable was destructuring more variables than needed:

**Before (Incorrect)**:
```javascript
const {
  isWarningVisible,
  timeRemaining,
  formattedTimeRemaining,  // ❌ Not used in template
  isExtending,
  extendSession,
  handleExpiration          // ❌ Not used in template
} = useSessionMonitor()
```

**Why They Were Not Needed**:

1. **`formattedTimeRemaining`**: The SessionExpirationDialog component receives the raw `timeRemaining` prop and formats it internally using its own computed property

2. **`handleExpiration`**: This function is called internally by the session monitor when the token expires. The MainLayout doesn't need to call it directly - the logout is handled via the `@logout` event from the dialog

---

## Fix Applied

**File**: `src/layouts/MainLayout.vue` (lines 184-190)

**After (Correct)**:
```javascript
// Session monitoring
const {
  isWarningVisible,        // ✅ Used in template (v-if)
  timeRemaining,           // ✅ Used in template (prop to SessionExpirationDialog)
  isExtending,             // ✅ Used in template (prop to SessionExpirationDialog)
  extendSession           // ✅ Used in handleExtendSession()
} = useSessionMonitor()
```

**Template Usage**:
```vue
<SessionExpirationDialog
  :show="isWarningVisible"           <!-- Uses isWarningVisible -->
  :time-remaining="timeRemaining"    <!-- Uses timeRemaining -->
  :is-extending="isExtending"        <!-- Uses isExtending -->
  @extend="handleExtendSession"      <!-- Calls extendSession -->
  @logout="handleLogoutFromDialog"
/>
```

---

## Variables Removed

### 1. formattedTimeRemaining

**Where It's Actually Used**: Inside `SessionExpirationDialog.vue`

**SessionExpirationDialog Implementation**:
```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  timeRemaining: Number  // Receives raw seconds
})

// Formats the time internally
const formattedTime = computed(() => {
  const minutes = Math.floor(props.timeRemaining / 60)
  const seconds = props.timeRemaining % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})
</script>

<template>
  <div class="text-h3">
    {{ formattedTime }}  <!-- Uses local computed property -->
  </div>
</template>
```

**Why MainLayout Doesn't Need It**: The dialog component handles its own formatting. MainLayout just passes the raw number.

---

### 2. handleExpiration

**Where It's Actually Used**: Inside `useSessionMonitor.js` composable

**Implementation**:
```javascript
// src/composables/useSessionMonitor.js

function handleExpiration() {
  console.log('[SessionMonitor] Token expired - logging out')

  stopMonitoring()
  authStore.logout()
  router.push({
    name: 'login',
    query: { expired: 'true' }
  })
}

// Called internally by logoutTimerId
logoutTimerId = setTimeout(handleExpiration, logoutDelay)
```

**Why MainLayout Doesn't Need It**:
- Auto-logout is handled automatically by the timer
- User-initiated logout from dialog is handled by `handleLogoutFromDialog()` which calls `handleLogout()`
- MainLayout never needs to call `handleExpiration()` directly

---

## Verification

**Command**:
```bash
npm run lint
```

**Result**:
```
✅ No errors found!
```

**Only warnings (not errors)**:
- npm config deprecation warnings (harmless)
- .eslintignore deprecation warning (can be addressed later)

---

## Lint Passing Files

All source files now pass linting:
- ✅ src/layouts/MainLayout.vue
- ✅ src/composables/useSessionMonitor.js
- ✅ src/components/auth/SessionExpirationDialog.vue
- ✅ src/stores/authStore.js
- ✅ src/services/api.js
- ✅ All other source files

---

## Best Practices Applied

1. **Only destructure what you use**: Don't destructure variables from composables unless they're actually used in the template or script

2. **Let child components handle formatting**: Parent passes raw data, child formats for display

3. **Internal functions stay internal**: Functions meant to be called by timers or internal logic shouldn't be exposed to parent components

4. **Clean destructuring**: Makes code more readable and maintainable

---

## Related Files

- ✅ **src/layouts/MainLayout.vue** - Fixed unused variables
- ✅ **src/composables/useSessionMonitor.js** - No changes needed
- ✅ **src/components/auth/SessionExpirationDialog.vue** - No changes needed

---

**Last Updated**: 2025-10-17
**Status**: All lint errors resolved
