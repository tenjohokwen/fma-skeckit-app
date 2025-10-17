# Quickstart Guide: Testing Read-Only Access

**Feature ID**: 004
**Date**: 2025-10-17

## Overview

This guide provides step-by-step instructions for testing the read-only access control feature with both admin and non-admin users.

## Prerequisites

### 1. User Accounts

You need two test accounts:

**Admin User**:
- Email: `admin@example.com` (or your admin account)
- Role: `ROLE_ADMIN`
- Password: (your admin password)

**Non-Admin User**:
- Email: `user@example.com` (or your regular user account)
- Role: `ROLE_USER`
- Password: (your user password)

### 2. Test Data

Ensure you have:
- At least 1 existing client in the system
- At least 1 case folder for that client
- At least 1 file in the case folder

---

## Quick Test Checklist

### ✅ Backend Security Tests (10 minutes)

Use Postman, curl, or API testing tool:

```bash
# Get non-admin token
POST https://your-app-url.com/api
{
  "action": "auth.login",
  "data": {
    "email": "user@example.com",
    "password": "password"
  }
}

# Save the token, then test:

# Test 1: Non-admin attempts client.create
POST https://your-app-url.com/api
{
  "action": "client.create",
  "data": {
    "firstName": "Test",
    "lastName": "User",
    "nationalId": "12345"
  },
  "token": "<non-admin-token>"
}
# Expected: 403 Forbidden

# Test 2: Non-admin attempts file.downloadFile
POST https://your-app-url.com/api
{
  "action": "file.downloadFile",
  "data": {
    "fileId": "<existing-file-id>"
  },
  "token": "<non-admin-token>"
}
# Expected: 403 Forbidden

# Test 3: Non-admin reads client.search
POST https://your-app-url.com/api
{
  "action": "client.search",
  "data": {
    "firstName": "John"
  },
  "token": "<non-admin-token>"
}
# Expected: 200 OK with results
```

**Pass Criteria**: All CREATE/UPDATE/DELETE/DOWNLOAD return 403, all READ return 200.

---

### ✅ Frontend Visual Tests (15 minutes)

#### Test as Non-Admin User

1. **Login**
   ```
   - Navigate to login page
   - Enter non-admin credentials
   - Click "Log In"
   - ✅ Should successfully log in
   ```

2. **Header Check**
   ```
   - Look at the application header/navigation
   - ✅ Should see "View Only" badge
   - ✅ Hover over badge should show tooltip
   ```

3. **Search Page**
   ```
   - Navigate to Search page
   - ✅ Should see search form
   - ❌ Should NOT see "Create New Client" button
   - Enter a client name and search
   - ✅ Should see results
   - ❌ Each result should NOT show "Create Case" icon
   - ✅ Each result should show "View Details" icon only
   ```

4. **Client Details Page**
   ```
   - Click "View Details" on a client
   - ✅ Should see client information (read-only)
   - ❌ Should NOT see "Edit" button
   - ✅ Should see list of cases
   - ❌ Should NOT see "Create New Case" button
   ```

5. **Case Files Page**
   ```
   - Click on a case folder
   - ✅ Should see file listing
   - ❌ Should NOT see FileUploader component
   - ❌ Should NOT see "Upload File" button
   - ❌ Should NOT see delete icon on files
   - ❌ Should NOT see rename icon on files
   - ❌ Should NOT see download icon on files
   - ❌ Should NOT see "Delete Folder" button
   ```

6. **Navigation**
   ```
   - Try navigating to different pages
   - ✅ All pages should be accessible
   - ✅ Data should be visible
   - ❌ No action buttons should be visible
   ```

**Pass Criteria**: 0 action buttons visible, all data visible, "View Only" badge present.

---

#### Test as Admin User

1. **Login**
   ```
   - Log out non-admin user
   - Login with admin credentials
   - ✅ Should successfully log in
   ```

2. **Header Check**
   ```
   - Look at the application header
   - ❌ Should NOT see "View Only" badge
   ```

3. **Search Page**
   ```
   - Navigate to Search page
   - ✅ Should see "Create New Client" button
   - Search for a client
   - ✅ Each result should show both:
     - "View Details" icon
     - "Create Case" icon
   ```

4. **Client Details Page**
   ```
   - Click "View Details" on a client
   - ✅ Should see "Edit" button
   - ✅ Should see "Create New Case" button
   - ✅ All existing functionality should work
   ```

5. **Case Files Page**
   ```
   - Navigate to a case folder
   - ✅ Should see FileUploader component
   - ✅ Should see all action buttons:
     - Upload
     - Download
     - Delete
     - Rename
     - Delete Folder
   - ✅ All existing functionality should work
   ```

**Pass Criteria**: All buttons visible and functional, no "View Only" badge.

---

## Detailed Testing Procedures

### Backend Testing with Postman

#### Setup Postman Collection

1. Create new collection: "Access Control Tests"
2. Add environment variables:
   - `baseUrl`: Your app URL
   - `adminToken`: (will be set after login)
   - `userToken`: (will be set after login)

#### Test Suite

**Pre-Test: Get Tokens**

```javascript
// Request 1: Get Admin Token
POST {{baseUrl}}/api
Body:
{
  "action": "auth.login",
  "data": {
    "email": "admin@example.com",
    "password": "admin-password"
  }
}

// In Tests tab:
pm.environment.set("adminToken", pm.response.json().token.value);

// Request 2: Get User Token
POST {{baseUrl}}/api
Body:
{
  "action": "auth.login",
  "data": {
    "email": "user@example.com",
    "password": "user-password"
  }
}

// In Tests tab:
pm.environment.set("userToken", pm.response.json().token.value);
```

**Test 1: Non-Admin Cannot Create Client**
```javascript
POST {{baseUrl}}/api
Body:
{
  "action": "client.create",
  "data": {
    "firstName": "Forbidden",
    "lastName": "Test",
    "nationalId": "99999",
    "email": "test@test.com"
  },
  "token": "{{userToken}}"
}

// Tests:
pm.test("Returns 403", () => {
  pm.response.to.have.status(403);
});

pm.test("Error message is clear", () => {
  const json = pm.response.json();
  pm.expect(json.msgKey).to.eql("error.forbidden");
});
```

**Test 2: Non-Admin Cannot Download File**
```javascript
POST {{baseUrl}}/api
Body:
{
  "action": "file.downloadFile",
  "data": {
    "fileId": "your-test-file-id"
  },
  "token": "{{userToken}}"
}

// Tests:
pm.test("Returns 403", () => {
  pm.response.to.have.status(403);
});
```

**Test 3: Non-Admin CAN Search Clients**
```javascript
POST {{baseUrl}}/api
Body:
{
  "action": "client.search",
  "data": {
    "firstName": "John"
  },
  "token": "{{userToken}}"
}

// Tests:
pm.test("Returns 200", () => {
  pm.response.to.have.status(200);
});

pm.test("Returns client data", () => {
  const json = pm.response.json();
  pm.expect(json.data).to.have.property("clients");
});
```

**Test 4: Admin CAN Create Client**
```javascript
POST {{baseUrl}}/api
Body:
{
  "action": "client.create",
  "data": {
    "firstName": "Test",
    "lastName": "Admin",
    "nationalId": "88888",
    "email": "admin-test@test.com"
  },
  "token": "{{adminToken}}"
}

// Tests:
pm.test("Returns 200", () => {
  pm.response.to.have.status(200);
});
```

**Run All Tests**: Click "Run Collection" and verify all pass.

---

### Frontend Testing Checklist

#### Non-Admin User Verification

**Page: Search**
- [ ] "Create New Client" button hidden
- [ ] Search form visible and functional
- [ ] Search results display correctly
- [ ] "View Details" icon present on results
- [ ] "Create Case" icon hidden on results

**Page: Client Details**
- [ ] Client information displays correctly
- [ ] "Edit" button hidden
- [ ] Cases list displays correctly
- [ ] "Create New Case" button hidden
- [ ] Can click on cases to view files

**Page: Case Files**
- [ ] File/folder listing displays correctly
- [ ] FileUploader component hidden
- [ ] No "Upload" button visible
- [ ] No "Delete" icons on files
- [ ] No "Rename" icons on files
- [ ] No "Download" icons on files
- [ ] No "Delete Folder" button

**Header/Layout**
- [ ] "View Only" badge visible
- [ ] Badge has informative tooltip
- [ ] All navigation links work

**Console Check**
- [ ] No JavaScript errors in console
- [ ] No failed API calls (except expected 403s)

#### Admin User Verification

**All Pages**
- [ ] "View Only" badge NOT visible
- [ ] All buttons visible and functional
- [ ] Can create clients
- [ ] Can edit clients
- [ ] Can create cases
- [ ] Can upload files
- [ ] Can download files
- [ ] Can delete files
- [ ] Can rename files
- [ ] Can delete folders

---

## Common Issues & Troubleshooting

### Issue 1: Non-admin still sees action buttons

**Possible Causes**:
- Frontend changes not deployed
- Browser cache showing old version
- useRoleAccess composable not imported

**Solutions**:
1. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
2. Check browser console for errors
3. Verify component imports useRoleAccess
4. Check authStore.user.role value in Vue DevTools

---

### Issue 2: Backend returns 200 when should return 403

**Possible Causes**:
- Admin check not deployed to backend
- Using admin token by mistake
- Token contains admin role

**Solutions**:
1. Verify backend code deployed: `npx clasp push`
2. Check token payload (decode JWT at jwt.io)
3. Verify token is from non-admin user
4. Check Google Apps Script execution logs

---

### Issue 3: "View Only" badge not showing

**Possible Causes**:
- Badge component not added to layout
- authStore.user not populated
- Logged in as admin user

**Solutions**:
1. Check MainLayout.vue for badge component
2. Check authStore.user value in Vue DevTools
3. Verify logged in with non-admin account
4. Check i18n keys loaded correctly

---

### Issue 4: 403 errors in console

**Expected**: This is normal for non-admin users if they attempt restricted actions

**Not Expected**: 403 on read operations (search, get, list)

**Solutions**:
1. Check which endpoint is returning 403
2. If read operation, verify backend doesn't have admin check
3. If write operation, this is correct behavior

---

## Performance Testing

### Load Time Comparison

**Test**: Measure page load times for admin vs non-admin

```javascript
// In browser console
performance.mark('pageStart');
// Navigate to page
performance.mark('pageEnd');
performance.measure('pageLoad', 'pageStart', 'pageEnd');
console.log(performance.getEntriesByName('pageLoad')[0].duration);
```

**Expected**: < 50ms difference between admin and non-admin

---

## Security Verification

### Penetration Testing

**Test 1: Direct API Call Bypass**
```bash
# Attempt to call admin endpoint with non-admin token
curl -X POST https://your-app-url.com/api \
  -H "Content-Type: application/json" \
  -d '{
    "action": "client.create",
    "data": {"firstName": "Hack", "lastName": "Attempt", "nationalId": "00000"},
    "token": "non-admin-token-here"
  }'

# Expected: 403 Forbidden
```

**Test 2: Token Manipulation**
```bash
# Attempt to modify token payload to add admin role
# This should fail because JWT is signed

# Expected: 401 Unauthorized (invalid signature)
```

**Test 3: Missing Token**
```bash
# Attempt to call endpoint without token
curl -X POST https://your-app-url.com/api \
  -H "Content-Type: application/json" \
  -d '{
    "action": "client.search",
    "data": {"firstName": "John"}
  }'

# Expected: 401 Unauthorized
```

---

## Test Results Template

### Backend Tests
| Test | Endpoint | Role | Expected | Actual | Pass? |
|------|----------|------|----------|--------|-------|
| 1 | client.create | USER | 403 | | ⬜ |
| 2 | client.update | USER | 403 | | ⬜ |
| 3 | case.create | USER | 403 | | ⬜ |
| 4 | file.uploadFile | USER | 403 | | ⬜ |
| 5 | file.downloadFile | USER | 403 | | ⬜ |
| 6 | file.deleteFile | USER | 403 | | ⬜ |
| 7 | client.search | USER | 200 | | ⬜ |
| 8 | client.get | USER | 200 | | ⬜ |
| 9 | All endpoints | ADMIN | 200 | | ⬜ |

### Frontend Tests
| Component | Element | Role | Visible? | Actual | Pass? |
|-----------|---------|------|----------|--------|-------|
| SearchPage | Create Client btn | USER | No | | ⬜ |
| SearchPage | Create Case icon | USER | No | | ⬜ |
| ClientDetails | Edit button | USER | No | | ⬜ |
| ClientDetails | Create Case btn | USER | No | | ⬜ |
| CaseFiles | Upload component | USER | No | | ⬜ |
| CaseFiles | Delete buttons | USER | No | | ⬜ |
| CaseFiles | Download buttons | USER | No | | ⬜ |
| Layout | View Only badge | USER | Yes | | ⬜ |
| All Pages | All buttons | ADMIN | Yes | | ⬜ |

---

## Next Steps After Testing

1. ✅ All tests pass → Deploy to production
2. ⚠️ Some tests fail → Fix issues and re-test
3. ❌ Security vulnerabilities found → DO NOT deploy, fix immediately

---

**Document Status**: ✅ Complete
**Testing Time**: ~25 minutes (10 min backend, 15 min frontend)
**Tools Needed**: Postman/API client, browser, test accounts
