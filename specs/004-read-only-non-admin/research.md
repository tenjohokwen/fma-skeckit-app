# Research: Read-Only Access for Non-Admin Users

**Feature ID**: 004
**Phase**: 0 (Research)
**Date**: 2025-10-17

## Research Questions

### Q1: What is the current state of admin checks in the backend?

**Method**: Audit all handler files for authorization checks

**Findings**:

#### ✅ Already Protected (Admin-Only)
1. **client.create** (`ClientHandler.gs:99`)
   - Has admin check: ❌ NO (should be added but currently relies on business logic)
   - Actually: Creates folder, likely needs admin access

2. **client.update** (`ClientHandler.gs:270`)
   - Has admin check: ✅ YES
   - Pattern: `if (!context.user || context.user.role !== 'ROLE_ADMIN')`

3. **file.uploadFile** (`FileHandler.gs`)
   - Has admin check: ✅ YES (historical)

4. **file.deleteFile** (`FileHandler.gs`)
   - Has admin check: ✅ YES

5. **file.renameFile** (`FileHandler.gs`)
   - Has admin check: ✅ YES

6. **folder.delete** (`FolderHandler.gs`)
   - Has admin check: ✅ YES
   - Pattern: Admin-only with typed confirmation

#### ⚠️ Missing Protection
1. **case.create** (`CaseHandler.gs`)
   - Has admin check: ❌ NO
   - Risk: HIGH - Anyone can create case folders
   - Action: ADD admin check

2. **file.downloadFile** (`FileHandler.gs:797`)
   - Has admin check: ❌ NO (was removed in previous feature)
   - Risk: HIGH - Anyone can download files
   - Action: RESTORE admin check

#### ✅ Correctly Open (Read-Only)
1. **client.search** (`ClientHandler.gs:21`)
   - Has admin check: ❌ NO
   - Correct: READ operation, should be accessible

2. **client.get** (`ClientHandler.gs:185`)
   - Has admin check: ❌ NO
   - Correct: READ operation, should be accessible

3. **file.listFolderContents** (`FileHandler.gs:579`)
   - Has admin check: ❌ NO (was removed)
   - Correct: READ operation, should remain accessible

**Conclusion**: 2 critical endpoints need admin checks added/restored.

---

### Q2: What are best practices for role-based UI rendering?

**Research Sources**: Vue.js documentation, security guides

**Options Evaluated**:

#### Option A: v-if (Recommended)
```vue
<q-btn v-if="canCreate" label="Create" />
```
**Pros**:
- Component not rendered at all (no DOM node)
- Better performance (no hidden elements)
- No CSS inspection reveals hidden features
- Vue reactivity handles updates automatically

**Cons**:
- Component completely destroyed/recreated on permission change

#### Option B: v-show
```vue
<q-btn v-show="canCreate" label="Create" />
```
**Pros**:
- Faster toggling (just CSS display change)
- Component state preserved

**Cons**:
- Element exists in DOM (visible in inspector)
- Security concern: exposes features to curious users
- Slightly worse performance (more DOM nodes)

#### Option C: Computed Properties
```vue
<q-btn v-if="showCreateButton" label="Create" />
```
**Pros**:
- Cached by Vue (performance)
- Can combine multiple conditions
- Clearer intent in template

**Cons**:
- More verbose (need computed per button)

**Decision**: Use **v-if with composable** for best security and performance.

---

### Q3: Client-side vs Server-side Authorization

**Analysis**:

#### Server-Side (Required)
- **Purpose**: Security enforcement
- **Pattern**: Check role at start of every handler method
- **Failure Mode**: Return 403 Forbidden
- **Trust Level**: 100% (authoritative)

```javascript
// Backend pattern
if (!context.user || context.user.role !== 'ROLE_ADMIN') {
  throw ResponseHandler.forbiddenError('Admin access required', 'error.forbidden');
}
```

#### Client-Side (UX Enhancement)
- **Purpose**: Hide UI elements users can't access
- **Pattern**: Use composable with computed properties
- **Failure Mode**: Show button that returns 403 on click
- **Trust Level**: 0% (can be bypassed)

```javascript
// Frontend pattern
const { canCreate } = useRoleAccess()
```

**Key Principle**: Never trust the client. Always enforce server-side.

**Decision**: Implement both layers:
1. Server-side for security (critical)
2. Client-side for better UX (important)

---

### Q4: How to display "View Only" indicators?

**Options Evaluated**:

#### Option A: Badge in Header (Recommended)
```vue
<q-badge color="info" label="View Only">
  <q-tooltip>Contact admin for edit access</q-tooltip>
</q-badge>
```
**Pros**:
- Always visible
- Doesn't block content
- Quasar native component
- Accessible (tooltip provides context)

**Cons**:
- Takes up header space

#### Option B: Banner at Top
```vue
<q-banner color="info">
  You have read-only access
</q-banner>
```
**Pros**:
- Very prominent
- Can include action button

**Cons**:
- Takes up vertical space
- Pushes content down
- Annoying after first view

#### Option C: Toast/Notification (Once)
**Pros**:
- Non-intrusive
- Temporary

**Cons**:
- Easy to miss
- Needs to be shown on every login
- Not persistent

**Decision**: Use **Badge in Header** with tooltip for persistent, non-intrusive indicator.

---

### Q5: Pattern for Centralized Role Checks

**Evaluated Approaches**:

#### Approach A: Composable (Recommended)
```javascript
// composables/useRoleAccess.js
export function useRoleAccess() {
  const authStore = useAuthStore()

  const isAdmin = computed(() => authStore.user?.role === 'ROLE_ADMIN')
  const canCreate = computed(() => isAdmin.value)
  const canEdit = computed(() => isAdmin.value)

  return { isAdmin, canCreate, canEdit, ... }
}
```
**Pros**:
- Single source of truth
- Computed properties cached
- Easy to test
- Consistent across components

**Cons**:
- Need to import in every component

#### Approach B: Global Provide/Inject
**Pros**:
- No imports needed in child components

**Cons**:
- Less explicit
- Harder to test
- Not idiomatic Vue 3

#### Approach C: Direct Store Access
```javascript
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.role === 'ROLE_ADMIN')
```
**Pros**:
- Simple

**Cons**:
- Repeated code
- Inconsistent patterns
- Hard to change logic later

**Decision**: Use **Composable Pattern** for centralized, testable role checks.

---

## Security Best Practices

### 1. Defense in Depth
- ✅ Server-side authorization (primary defense)
- ✅ Client-side UI restrictions (secondary defense)
- ✅ Error messages don't expose system details
- ✅ Role stored in JWT (server-signed, tamper-proof)

### 2. Fail Secure
- Default to denying access
- Explicit allow lists, not block lists
- Return 403 for unauthorized, not 404

### 3. Principle of Least Privilege
- Non-admin users get minimum necessary permissions
- READ-only access by default
- WRITE requires explicit admin role

### 4. Audit Trail (Future)
- Log all 403 responses
- Track who attempts restricted operations
- Monitor for privilege escalation attempts

## Performance Considerations

### Computed Property Caching
```javascript
// Vue caches computed properties automatically
const canCreate = computed(() => isAdmin.value)

// Only re-evaluated when isAdmin.value changes
// Thousands of checks = 1 computation
```

**Impact**: Negligible (<1ms per component mount)

### Conditional Rendering
```vue
<!-- v-if: Component not rendered -->
<FileUploader v-if="canUpload" />

<!-- Better than v-show for complex components -->
<!-- Saves ~50-100ms per hidden component -->
```

**Impact**: Slight performance improvement for non-admin users

### Backend Authorization Overhead
```javascript
// Simple role check at method start
if (context.user.role !== 'ROLE_ADMIN') { throw ... }

// Cost: ~0.1ms per request
// Negligible compared to DB/Drive operations (50-500ms)
```

**Impact**: Unnoticeable

## Implementation Decisions Summary

| Question | Decision | Rationale |
|----------|----------|-----------|
| UI Rendering | v-if with composable | Security + performance |
| Authorization Layer | Both client & server | Defense in depth |
| View-Only Indicator | Badge in header | Persistent, non-intrusive |
| Role Check Pattern | useRoleAccess composable | Centralized, testable |
| Download Access | Admin-only | Consistency + security |
| Folder Listing | Read-only (no auth) | Allow viewing, block actions |

## Risks Identified

### High Risk
1. **API Bypass**: Non-admin calls backend directly
   - **Mitigation**: Enforce all checks server-side first

2. **Privilege Escalation**: Token manipulation
   - **Mitigation**: JWT signed by server, validated on every request

### Medium Risk
3. **Inconsistent UI**: Some buttons visible
   - **Mitigation**: Use composable consistently, visual testing

4. **Admin Regression**: Break existing admin flows
   - **Mitigation**: Comprehensive testing with admin account

### Low Risk
5. **Performance Impact**: Many role checks
   - **Mitigation**: Computed properties cache results

6. **Confusing UX**: Non-admin doesn't understand limitations
   - **Mitigation**: "View Only" badge + tooltips

## Testing Strategy

### Backend Security Tests
```javascript
// Test pattern for each endpoint
describe('Endpoint Authorization', () => {
  it('rejects non-admin users', async () => {
    const response = await callEndpoint({ role: 'ROLE_USER' })
    expect(response.status).toBe(403)
    expect(response.msgKey).toBe('error.forbidden')
  })

  it('allows admin users', async () => {
    const response = await callEndpoint({ role: 'ROLE_ADMIN' })
    expect(response.status).toBe(200)
  })
})
```

### Frontend Component Tests
```javascript
describe('Component Access Control', () => {
  it('hides create button for non-admin', () => {
    const wrapper = mount(Component, {
      global: {
        provide: { authStore: { user: { role: 'ROLE_USER' } } }
      }
    })
    expect(wrapper.find('[data-test="create-btn"]').exists()).toBe(false)
  })

  it('shows create button for admin', () => {
    const wrapper = mount(Component, {
      global: {
        provide: { authStore: { user: { role: 'ROLE_ADMIN' } } }
      }
    })
    expect(wrapper.find('[data-test="create-btn"]').exists()).toBe(true)
  })
})
```

## References

- [OWASP: Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [Vue.js: Conditional Rendering](https://vuejs.org/guide/essentials/conditional.html)
- [Feature 003: Admin Client Editing](../003-as-a-user/spec.md) - Admin check pattern

---

**Research Status**: ✅ Complete
**Key Findings**: 2 endpoints need admin checks, use composable pattern, badge for indicator
**Next Step**: Create access-control.md with authorization matrix
