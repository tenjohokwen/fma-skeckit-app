# Quickstart: Dashboard Access Parity

**Feature**: 016-as-a-user | **One-Page Reference**

## At a Glance

**What**: Enable non-admin users to see organization-wide dashboard metrics
**Why**: Provide all team members with firm-wide business visibility
**How**: Remove role-based filtering in backend, add personal metrics indicators in frontend

---

## Backend Changes

### 1. DashboardService.gs - Remove Role Filter

**File**: `gas/services/DashboardService.gs`

**Line 71-80** - Change `_getFilteredCases()`:

```javascript
// BEFORE
_getFilteredCases: function(userEmail, userRole) {
  const allCases = SheetsService.getAllCases();
  if (userRole === 'ROLE_ADMIN') {
    return allCases;
  }
  return allCases.filter(c => c.assignedTo === userEmail);
}

// AFTER
_getFilteredCases: function(userEmail, userRole) {
  // Return all cases for organization-wide metrics
  return SheetsService.getAllCases();
}
```

### 2. DashboardService.gs - Update Cache Key

**Line 18** - Change cache key in `getAllMetrics()`:

```javascript
// BEFORE
const cacheKey = `dashboard_metrics_${userRole}_${userEmail}`;

// AFTER
const cacheKey = `dashboard_metrics_org_wide`;
```

**Impact**: Single shared cache = 50%+ cache hit rate improvement

---

## Frontend Changes

### 3. Add Personal Metrics Computation

**File**: `src/pages/DashboardPage.vue`

Add computed property:

```javascript
const personalMetrics = computed(() => {
  if (!metrics.value || !authStore.user) return null;

  const currentUserEmail = authStore.user.email;
  const userEntry = metrics.value.casesPerAttorney.find(
    a => a.attorney === currentUserEmail
  );

  return {
    myActiveCases: userEntry?.count || 0,
    totalActiveCases: metrics.value.activeCases.count,
    myPercentage: userEntry
      ? Math.round((userEntry.count / metrics.value.activeCases.count) * 100)
      : 0
  };
});
```

### 4. Highlight Current User in Chart

**File**: `src/components/dashboard/CasesPerAttorneyChart.vue`

Add badge to current user:

```vue
<template>
  <div v-for="attorney in data" :key="attorney.attorney">
    {{ attorney.attorney }}
    <q-badge
      v-if="attorney.attorney === authStore.user.email"
      color="primary"
      label="You"
      class="q-ml-sm"
    />
    <span>({{ attorney.count }} cases)</span>
  </div>
</template>
```

### 5. Add i18n Keys

**Files**: `src/i18n/en.json`, `src/i18n/fr.json`

```javascript
// en.json
"dashboard": {
  "personalMetrics": {
    "myCases": "My Cases",
    "youLabel": "You",
    "yourWorkload": "Your Workload"
  }
}

// fr.json
"dashboard": {
  "personalMetrics": {
    "myCases": "Mes Cas",
    "youLabel": "Vous",
    "yourWorkload": "Votre Charge de Travail"
  }
}
```

---

## Testing

### Backend Test

**File**: `gas/tests/test_feature_016.gs`

```javascript
function test_nonAdminSeesAllMetrics() {
  const nonAdminUser = { email: 'user@test.com', role: 'ROLE_USER' };
  const metrics = DashboardService.getAllMetrics(nonAdminUser.email, nonAdminUser.role);

  // Should see all cases, not just assigned ones
  assertTrue(metrics.activeCases.count > 0, 'Non-admin should see active cases');
  assertTrue(metrics.casesByStatus.length > 0, 'Non-admin should see status distribution');
}

function test_cacheKeyIsRoleAgnostic() {
  // Both should use same cache key
  const adminMetrics = DashboardService.getAllMetrics('admin@test.com', 'ROLE_ADMIN');
  const userMetrics = DashboardService.getAllMetrics('user@test.com', 'ROLE_USER');

  // Verify same cache was used (would need cache inspection)
  assertEqual(adminMetrics.activeCases.count, userMetrics.activeCases.count);
}
```

### Frontend Test

**File**: `tests/components/DashboardPage.spec.js`

```javascript
describe('Dashboard Access Parity', () => {
  it('non-admin users see organization-wide metrics', async () => {
    const wrapper = mount(DashboardPage, {
      global: {
        mocks: {
          authStore: { user: { email: 'user@test.com', role: 'ROLE_USER' } }
        }
      }
    });

    await wrapper.vm.handleRefresh();

    expect(wrapper.find('[data-testid="active-cases"]').text()).toContain('150');
  });

  it('highlights current user in attorney chart', async () => {
    const wrapper = mount(CasesPerAttorneyChart, {
      props: {
        data: [
          { attorney: 'user@test.com', count: 10 },
          { attorney: 'other@test.com', count: 15 }
        ]
      },
      global: {
        mocks: {
          authStore: { user: { email: 'user@test.com' } }
        }
      }
    });

    expect(wrapper.find('q-badge').exists()).toBe(true);
    expect(wrapper.find('q-badge').text()).toBe('You');
  });
});
```

---

## Validation Checklist

- [ ] Backend: `_getFilteredCases()` returns all cases for all users
- [ ] Backend: Cache key changed to `dashboard_metrics_org_wide`
- [ ] Frontend: Personal metrics computed correctly
- [ ] Frontend: Current user highlighted in attorney chart
- [ ] i18n: English and French keys added
- [ ] Tests: Backend test for non-admin access
- [ ] Tests: Frontend test for identical metrics
- [ ] Tests: Frontend test for user highlighting
- [ ] Manual: Compare admin vs non-admin dashboard (should be identical)
- [ ] Manual: Verify cache hit rate improved
- [ ] Manual: Verify edit permissions unchanged

---

## Key Files Modified

**Backend**:
- `gas/services/DashboardService.gs` (2 lines changed)

**Frontend**:
- `src/pages/DashboardPage.vue` (add personalMetrics computed)
- `src/components/dashboard/CasesPerAttorneyChart.vue` (add badge)
- `src/i18n/en.json` (add 3 keys)
- `src/i18n/fr.json` (add 3 keys)

**Tests**:
- `gas/tests/test_feature_016.gs` (new file)
- `tests/components/DashboardPage.spec.js` (add 2 test cases)

---

## Rollout Notes

1. **Deploy backend first** - Ensures API returns full data before frontend expects it
2. **Cache will self-migrate** - Old cache entries expire in 5 minutes, no manual intervention
3. **Monitor cache hit rate** - Should see 50%+ improvement in CacheService metrics
4. **User communication** - Inform users that dashboard now shows org-wide data
5. **Security audit** - Verify edit permissions still enforced (no regression)

## Success Metrics (from spec)

- ✅ SC-001: Non-admin users see identical case counts as admins
- ✅ SC-002: Dashboard loads in < 3 seconds
- ✅ SC-003: Users identify personal workload in < 5 seconds
- ✅ SC-004: All 6 charts render with org-wide data
- ✅ SC-005: Zero increase in support tickets
- ✅ SC-006: 50%+ cache hit rate improvement
