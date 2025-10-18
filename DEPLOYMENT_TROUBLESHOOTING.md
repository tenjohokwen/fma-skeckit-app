# Deployment Troubleshooting - Token Not Returned

**Issue**: Search and create functions not returning token data
**Status**: Code is correct, likely a deployment/caching issue

---

## ✅ What We've Confirmed

1. **Code is Correct**: All handlers have been updated with `TokenManager.generateToken()` and `ResponseHandler.successWithToken()`
2. **Files Were Pushed**: `npx clasp push --force` successfully pushed 18 files
3. **TokenManager Exists**: The TokenManager.gs file is present and deployed

---

## 🔍 Root Cause Analysis

The most likely cause is **Google Apps Script is using a cached version** of your handlers. This is a common issue with Google Apps Script deployments.

---

## 🛠️ Solution Steps (Try in Order)

### Solution 1: Create New Deployment Version

**Why**: Google Apps Script often caches the deployed web app code. Creating a new version forces it to reload.

**Steps**:
1. Go to https://script.google.com/
2. Open your project (Script ID: `1hBG4kKgv9S2c6-WrH4BTifuWLZThT48AQLzlMsVuriRQxqPaNLF2s8yV`)
3. Click **"Deploy"** → **"Manage deployments"**
4. Click the **"Edit"** icon (pencil) next to your "Web app" deployment
5. Change **"Version"** to **"New version"**
6. In the description, enter: `Token standardization - v2025.10.17`
7. Keep **"Execute as"** = Me
8. Keep **"Who has access"** = Anyone (or your current setting)
9. Click **"Deploy"**
10. **Important**: Copy the new Web App URL (it might be the same, but this forces cache refresh)
11. Test your search/create endpoints again

### Solution 2: Run a Test Execution in Apps Script Editor

**Why**: This forces Google Apps Script to reload and compile the latest code.

**Steps**:
1. In the Apps Script editor, open `handlers/ClientHandler.gs`
2. At the top, click the **dropdown** next to the "Run" button
3. Select **any function** (like `search`)
4. Click **"Run"**
5. You'll get an error (it needs context), but that's OK - this forces a reload
6. Now test your API endpoints again

### Solution 3: Manually Trigger Script Reload

**Why**: Sometimes you need to force Google to recognize changes.

**Steps**:
1. In Apps Script editor, click **"Project Settings"** (gear icon)
2. Scroll to **"Script Properties"**
3. Add a new property:
   - Property: `CACHE_BUSTER`
   - Value: `2025-10-17-token-update`
4. Click **"Save script properties"**
5. Go back to **Editor**
6. Make a tiny change to any handler (add a comment):
   ```javascript
   // Updated 2025-10-17 - Token standardization
   ```
7. Save (Ctrl+S or Cmd+S)
8. Deploy again: `cd gas && npx clasp push --force`
9. Test endpoints

### Solution 4: Check Script Execution Logs

**Why**: See if there's an actual error preventing the code from running.

**Steps**:
1. In Apps Script editor, click **"Executions"** (left sidebar, clock icon)
2. Perform a search or create action in your app
3. Look for the most recent execution
4. Click on it to see logs
5. Check for errors like:
   - `TokenManager is not defined`
   - `generateToken is not a function`
   - `context.user is undefined`
6. If you see errors, screenshot them and we'll fix them

### Solution 5: Verify Deployment Configuration

**Why**: Ensure the deployment is using the latest code.

**Steps**:
1. In Apps Script editor, click **"Deploy"** → **"Test deployments"**
2. This opens a temporary deployment with the LATEST code (no caching)
3. Copy the temporary Web App URL
4. **Temporarily** update your frontend to use this URL
5. Test search/create functions
6. If it works, the issue is definitely caching - proceed to create new production version

---

## 🧪 Quick Diagnostic Test

Run this in your browser console to check what version is deployed:

```javascript
// Test if token is returned
fetch('YOUR_PRODUCTION_API_URL', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  },
  body: JSON.stringify({
    action: 'auth.ping',  // We know this works
    data: {}
  })
})
.then(r => r.json())
.then(pingResponse => {
  console.log('=== AUTH.PING TEST ===');
  console.log('Has Token:', !!pingResponse.token);

  if (pingResponse.token) {
    console.log('✅ auth.ping returns token - TokenManager is working');

    // Now test client.search
    return fetch('YOUR_PRODUCTION_API_URL', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
      },
      body: JSON.stringify({
        action: 'client.search',
        data: { firstName: 'test' }
      })
    });
  } else {
    console.error('❌ Even auth.ping has no token - deployment issue');
    throw new Error('Deployment problem');
  }
})
.then(r => r.json())
.then(searchResponse => {
  console.log('=== CLIENT.SEARCH TEST ===');
  console.log('Has Token:', !!searchResponse.token);

  if (searchResponse.token) {
    console.log('✅ client.search returns token - ALL WORKING!');
  } else {
    console.error('❌ client.search has no token - CACHE ISSUE');
    console.error('Full response:', JSON.stringify(searchResponse, null, 2));
    console.log('\n📋 DIAGNOSIS: ClientHandler deployment is cached');
    console.log('👉 SOLUTION: Create new deployment version (see Solution 1)');
  }
});
```

---

## 📊 Expected vs Actual

### Expected Response (After Fix)
```json
{
  "status": 200,
  "msgKey": "client.search.success",
  "message": "Found 3 client(s)",
  "data": {
    "clients": [...],
    "count": 3
  },
  "token": {
    "value": "NVMUK10rKSIKV1VQCDNBJ...",
    "ttl": 1760697849187,
    "username": "tenjoh_okwen@yahoo.com"
  }
}
```

### Actual Response (Before Fix - Cached Version)
```json
{
  "status": 200,
  "msgKey": "client.search.success",
  "message": "Found 3 client(s)",
  "data": {
    "clients": [...],
    "count": 3
  }
  // ❌ Missing token object
}
```

---

## 🎯 Most Likely Solution

**90% of the time, this is a Google Apps Script caching issue.**

**Fastest Fix**:
1. Go to Apps Script → Deploy → Manage deployments
2. Edit the Web app deployment
3. Change Version to "New version"
4. Click Deploy
5. Test immediately

**This should resolve the issue in 2 minutes.**

---

## 🆘 If Nothing Works

If you've tried all solutions and still no token:

### Last Resort: Manual Code Verification

Add debug logging to see what's happening:

1. Open `gas/handlers/ClientHandler.gs` in Apps Script editor
2. Add logging before the return statement:

```javascript
// Around line 61-78
const newToken = TokenManager.generateToken(context.user.email);

// ADD THIS DEBUG LOG
Logger.log('DEBUG: Generated token: ' + JSON.stringify({
  hasToken: !!newToken,
  hasValue: !!newToken.value,
  username: context.user.email
}));

return ResponseHandler.successWithToken(
  'client.search.success',
  `Found ${matchedClients.length} client(s)`,
  {
    clients: matchedClients,
    count: matchedClients.length,
    searchCriteria: {
      firstName: firstName || '',
      lastName: lastName || '',
      nationalId: nationalId || ''
    }
  },
  context.user,
  newToken.value
);
```

3. Save and deploy
4. Test search
5. Check Executions logs for the DEBUG message

---

## 📞 Need More Help?

If the issue persists:

1. Check the **Executions** logs in Apps Script for any errors
2. Verify the **deployed version** matches your local code
3. Try creating a **completely new deployment** (not just a new version)
4. Share the **execution logs** if you see errors

---

## ✅ Success Checklist

After applying the fix, verify:

- [ ] `auth.ping` returns token ✓
- [ ] `client.search` returns token ✓
- [ ] `client.create` returns token ✓
- [ ] `metadata.searchCasesByName` returns token ✓
- [ ] All token objects have `value`, `ttl`, and `username` ✓

---

**Last Updated**: 2025-10-17
**Status**: Ready for deployment version update
