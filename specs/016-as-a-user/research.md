# Phase 0 Research: Dashboard Access Parity

**Feature**: 016-as-a-user
**Date**: 2025-10-27
**Purpose**: Research technical decisions and implementation patterns for enabling organization-wide dashboard access

## Research Areas

### 1. Backend Data Filtering Strategy

**Decision**: Remove role-based filtering entirely from `_getFilteredCases()` method

**Rationale**:
- Current implementation (lines 71-80 in DashboardService.gs) filters cases by `assignedTo` for non-admin users
- Simplest approach: Return all cases for all users, matching admin behavior
- No conditional logic needed based on role
- Cleaner code path with less complexity

**Alternatives Considered**:
1. **Add a "viewAll" permission flag** - Rejected because spec requires all non-admin users to see org-wide data, not selective users
2. **Create a separate "organizationMetrics" endpoint** - Rejected because it would duplicate logic and create API complexity
3. **Filter on frontend only** - Rejected because it wouldn't improve cache efficiency (main performance benefit)

**Implementation Details**:
```javascript
// BEFORE (current):
_getFilteredCases: function(userEmail, userRole) {
  const allCases = SheetsService.getAllCases();
  if (userRole === 'ROLE_ADMIN') {
    return allCases;
  }
  // Filter to user's assigned cases only
  return allCases.filter(c => c.assignedTo === userEmail);
}

// AFTER (proposed):
_getFilteredCases: function(userEmail, userRole) {
  // Return all cases for all users (organization-wide metrics)
  return SheetsService.getAllCases();
}
```

**Note**: The method signature remains unchanged to maintain backward compatibility, even though `userEmail` and `userRole` are no longer used for filtering.

---

### 2. Cache Key Optimization Strategy

**Decision**: Change cache key from `dashboard_metrics_{role}_{email}` to `dashboard_metrics_org_wide`

**Rationale**:
- Current cache creates separate entries per user (e.g., `dashboard_metrics_ROLE_USER_john@example.com`)
- With organization-wide data, all users see the same metrics
- Single shared cache entry improves hit rate dramatically (estimated 50%+ improvement per spec SC-006)
- Reduces memory usage in CacheService
- Reduces computation load (metrics calculated once per 5 minutes, not once per user)

**Alternatives Considered**:
1. **Keep role-based cache** (`dashboard_metrics_ROLE_ADMIN`) - Rejected because non-admins will now see identical data to admins
2. **Add organization ID to key** (for multi-org support) - Deferred as out of scope; spec assumes single organization
3. **Remove caching entirely** - Rejected because would hurt performance; caching is critical for Google Apps Script quota management

**Implementation Details**:
```javascript
// BEFORE (current):
getAllMetrics: function(userEmail, userRole) {
  const cacheKey = `dashboard_metrics_${userRole}_${userEmail}`;
  // ...
}

// AFTER (proposed):
getAllMetrics: function(userEmail, userRole) {
  const cacheKey = `dashboard_metrics_org_wide`;
  // Note: Still pass userEmail to metrics for personal stats calculation (Phase 2)
  // ...
}
```

---

### 3. Personal Metrics Calculation Pattern

**Decision**: Calculate personal metrics on frontend using returned organization-wide data

**Rationale**:
- Backend returns all cases with their `assignedTo` values
- Frontend can filter `metrics.casesPerAttorney` array to find current user
- Avoids additional backend API calls
- Simple computation (array filter, no heavy processing)
- Maintains single source of truth for metrics

**Alternatives Considered**:
1. **Backend calculates and returns both org + personal metrics** - Rejected because breaks cache optimization (would need user-specific cache again)
2. **Separate API endpoint for personal metrics** - Rejected because adds unnecessary network request and complexity
3. **Store personal metrics in separate cache** - Rejected because over-engineered for simple calculation

**Implementation Pattern** (frontend):
```javascript
// In DashboardPage.vue or useDashboard.js composable
const personalMetrics = computed(() => {
  if (!metrics.value || !authStore.user) return null;

  const currentUserEmail = authStore.user.email;

  // Find current user's case count
  const userEntry = metrics.value.casesPerAttorney.find(
    attorney => attorney.attorney === currentUserEmail
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

---

### 4. Visual Distinction Approach (User Story 2)

**Decision**: Use Quasar badge component with primary color to highlight current user in "Cases per Attorney" chart

**Rationale**:
- Quasar `q-badge` component provides visual indicator without custom CSS
- Primary blue color (`#2563eb`) follows design system
- Minimal frontend code change
- Maintains accessibility (sufficient contrast)
- Mobile-friendly (badges scale appropriately)

**Alternatives Considered**:
1. **Separate "My Cases" summary card above dashboard** - Considered for future enhancement, not MVP
2. **Different chart color for current user's bar** - Rejected because ApexCharts customization is complex
3. **Icon indicator next to user's name** - Possible future enhancement, badge is simpler for MVP

**Implementation Pattern**:
```vue
<!-- In CasesPerAttorneyChart.vue -->
<template>
  <div v-for="attorney in data" :key="attorney.attorney">
    {{ attorney.attorney }}
    <q-badge
      v-if="attorney.attorney === currentUser"
      color="primary"
      label="You"
      class="q-ml-sm"
    />
    ({{ attorney.count }} cases)
  </div>
</template>
```

---

### 5. Testing Strategy

**Decision**: Use Vitest mocks to simulate both ROLE_ADMIN and ROLE_USER scenarios

**Rationale**:
- Existing test infrastructure uses Vitest + Vue Test Utils
- Can mock `authStore.user.role` to test both scenarios
- Can verify chart data is identical for both roles
- Can test visual indicators only appear for current user

**Test Scenarios**:
1. **Admin user views dashboard** - Verify metrics displayed
2. **Non-admin user views dashboard** - Verify identical metrics displayed
3. **Non-admin user with assigned cases** - Verify personal indicator appears
4. **Non-admin user with zero assigned cases** - Verify graceful handling
5. **Cache behavior** - Verify shared cache key used (backend test)

**Implementation Pattern**:
```javascript
// In tests/components/DashboardPage.spec.js
describe('Dashboard Access Parity', () => {
  it('displays identical metrics for admin and non-admin users', async () => {
    // Test with admin user
    const adminWrapper = mount(DashboardPage, {
      global: {
        mocks: { authStore: { user: { role: 'ROLE_ADMIN', email: 'admin@test.com' } } }
      }
    });

    // Test with non-admin user
    const userWrapper = mount(DashboardPage, {
      global: {
        mocks: { authStore: { user: { role: 'ROLE_USER', email: 'user@test.com' } } }
      }
    });

    // Assert both see same data
    expect(adminWrapper.find('[data-testid="active-cases"]').text())
      .toBe(userWrapper.find('[data-testid="active-cases"]').text());
  });
});
```

---

### 6. Security Considerations

**Decision**: No changes to edit/delete permissions; viewing metrics does not grant edit rights

**Rationale**:
- Dashboard displays read-only analytics
- Existing security controls in CaseHandler.gs validate permissions for edit/delete operations
- Role-based access control (RBAC) still enforced at edit endpoints
- This feature only changes data visibility for read operations

**Verification**:
- Existing tests for CaseHandler permissions remain unchanged
- No new security interceptor rules needed
- Token validation remains at SecurityInterceptor layer (unchanged)

**Documentation Note**:
Spec assumption: "Users understand that viewing organization-wide metrics does not grant them permission to edit cases outside their assignments" - this is enforced by existing backend security, not just user understanding.

---

### 7. i18n Keys Required

**Decision**: Add the following i18n keys for new UI text

**English**:
```javascript
dashboard: {
  personalMetrics: {
    myCases: "My Cases",
    youLabel: "You",
    yourWorkload: "Your Workload",
    ofTotal: "of {total} total"
  }
}
```

**French**:
```javascript
dashboard: {
  personalMetrics: {
    myCases: "Mes Cas",
    youLabel: "Vous",
    yourWorkload: "Votre Charge de Travail",
    ofTotal: "sur {total} total"
  }
}
```

---

## Summary of Technical Decisions

| Area | Decision | Impact |
|------|----------|--------|
| Backend Filtering | Remove role-based filter entirely | Simplifies code, enables org-wide data |
| Cache Strategy | Single org-wide cache key | 50%+ cache hit improvement, reduced computation |
| Personal Metrics | Frontend calculation from org data | No additional API calls, simple implementation |
| Visual Indicators | Quasar badge in attorney chart | Clear, accessible, follows design system |
| Testing | Vitest with role mocking | Comprehensive coverage of both user types |
| Security | No changes to edit permissions | Maintains existing security model |
| i18n | Add 4 new keys (EN/FR) | Supports bilingual requirement |

## Risks & Mitigations

**Risk 1**: Cache key change might cause temporary inconsistency during deployment
- **Mitigation**: Old cache entries will expire naturally after 5 minutes; no special migration needed

**Risk 2**: Users might expect to edit all cases they can now see
- **Mitigation**: Spec FR-010 explicitly states edit permissions are unchanged; enforce at backend

**Risk 3**: Performance impact of returning all cases to all users
- **Mitigation**: Admin users already receive all cases; no additional load. Cache improvement offsets any marginal increase.

## Next Steps (Phase 1)

1. Create `data-model.md` - Document metrics entities and relationships
2. Update agent context with any new patterns
3. Create `quickstart.md` - One-page implementation reference
